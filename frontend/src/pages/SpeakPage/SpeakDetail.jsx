import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToast } from "../../component/Toast/ToastContainer";

import {
  faMicrophone,
  faVolumeUp,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./SpeakDetail.css";

const SpeakDetail = () => {
  const { id } = useParams();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [note, setNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordedQuestions, setRecordedQuestions] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);
  const [overallScore, setOverallScore] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const toast = useToast();

  const getFullAudioURL = (audio_url) => {
    if (!audio_url) return null;
    return audio_url.startsWith("http")
      ? audio_url
      : audio_url.startsWith("/uploads/")
        ? `https://skillforge-99ct.onrender.com${audio_url}`
        : `https://skillforge-99ct.onrender.com/uploads/audio/${audio_url}`;
  };

  const getUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.user_id || user.uid || user.id || "anonymous";
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    return "anonymous";
  };

  const userId = getUserId();

  // Lấy dữ liệu Speaking từ backend
  useEffect(() => {
    const fetchSpeaking = async () => {
      try {
        const res = await fetch(`https://skillforge-99ct.onrender.com/api/speaking/${id}`);
        const data = await res.json();
        
        if (data.speaking_practices_id) {
          setSelectedTopic({
            id: data.speaking_practices_id,
            title: data.topic,
            section: data.section,
            questions: data.questions?.map((q) => ({
              id: q.id,
              text: q.question_text,
              order: q.question_order,
            })) || [],
          });
        }
      } catch (error) {
        console.error("❌ Error fetching speaking topic:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpeaking();
  }, [id]);

  // Load lịch sử bài làm của user
  useEffect(() => {
    const loadUserSubmissions = async () => {
      if (!selectedTopic || !userId) return;

      try {
        console.log("📥 Loading user submissions...");
        const res = await fetch(
          `https://skillforge-99ct.onrender.com/api/speaking/submissions/${userId}/${id}`
        );
        const data = await res.json();

        if (data.success && data.submissions.length > 0) {
          console.log("✅ Found submissions:", data.submissions.length);

          const newRecordedQuestions = new Map();
          
          data.submissions.forEach((submission) => {
            const questionIndex = selectedTopic.questions.findIndex(
              (q) => q.id === submission.speaking_questions_id
            );

            if (questionIndex !== -1) {
              let evaluation = submission;
              if (typeof submission.feedback === "string") {
                try {
                  const parsedFeedback = JSON.parse(submission.feedback);
                  evaluation = { ...submission, ...parsedFeedback };
                } catch (e) {
                  console.warn("Could not parse feedback JSON:", e);
                }
              }

              if (submission.audio_url) {
                evaluation.audio_url = submission.audio_url;
              }

              newRecordedQuestions.set(questionIndex, evaluation);
            }
          });

          setRecordedQuestions(newRecordedQuestions);

          if (newRecordedQuestions.has(currentQuestionIndex)) {
            const currentEval = newRecordedQuestions.get(currentQuestionIndex);
            setCurrentEvaluation(currentEval);
            setShowFeedback(true);
            
            if (currentEval?.audio_url) {
              const fullURL = getFullAudioURL(currentEval.audio_url);
              console.log("🔊 Setting audio URL on load:", fullURL);
              setAudioURL(fullURL);
            }
          }

          console.log("✅ Loaded submissions for questions:", Array.from(newRecordedQuestions.keys()));
        }
      } catch (error) {
        console.error("❌ Error loading submissions:", error);
      }
    };

    if (selectedTopic) {
      loadUserSubmissions();
    }
  }, [selectedTopic, userId, id, currentQuestionIndex]);

  useEffect(() => {
    if (selectedTopic && recordedQuestions.size === selectedTopic.questions.length) {
      setAllCompleted(true);
    }
  }, [recordedQuestions, selectedTopic]);

  if (loading) return <p>Loading...</p>;
  if (!selectedTopic) return <p>Topic not found.</p>;

  const currentQuestion = selectedTopic.questions[currentQuestionIndex];
  const isRecorded = recordedQuestions.has(currentQuestionIndex);

  const handlePrev = () => setCurrentQuestionIndex((i) => Math.max(i - 1, 0));
  const handleNext = () =>
    setCurrentQuestionIndex((i) =>
      Math.min(i + 1, selectedTopic.questions.length - 1)
    );

  // ✅ FIX: Đọc câu hỏi bằng giọng tiếng Anh chuẩn
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
    utterance.lang = "en-US";
    
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (voice) => voice.lang.startsWith("en-") && voice.name.includes("US")
      ) || voices.find((voice) => voice.lang.startsWith("en-"));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      speechSynthesis.onvoiceschanged = setVoice;
    }
  };

  // ✅ FIX: Ghi âm với định dạng tương thích iOS
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // ✅ Kiểm tra MediaRecorder support formats
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm'
        : '';
      
      console.log("🎙️ Recording with format:", mimeType);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        await submitAudio(audioBlob, mimeType);
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, 20000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast("Please allow microphone access!");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // ✅ FIX: Submit audio với format info
  const submitAudio = async (audioBlob, mimeType) => {
    setEvaluating(true);
    setShowFeedback(false);
    setCurrentEvaluation(null);

    try {
      const formData = new FormData();
      
      // ✅ Đặt tên file theo định dạng
      const extension = mimeType === 'audio/mp4' ? 'm4a' : 'webm';
      formData.append("audio", audioBlob, `recording.${extension}`);
      formData.append("userId", userId);
      formData.append("speakingId", id);
      formData.append("questionId", currentQuestion.id);
      formData.append("questionText", currentQuestion.text);
      formData.append("section", selectedTopic.section);
      formData.append("audioFormat", mimeType); // ✅ Gửi format info

      console.log("📤 Submitting audio for evaluation...");

      const res = await fetch("https://skillforge-99ct.onrender.com/api/speaking/submit-answer", {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      console.log("📥 Raw server response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("✅ Parsed result:", result);
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        setEvaluating(false);
        toast("Server returned invalid response format");
        return;
      }
      
      if (result.success) {
        const evaluation = {
          ...result.evaluation,
          transcript: result.transcript,
          audio_url: result.audio_url
        };
        console.log("✅ AI Evaluation received:", evaluation);
        
        setRecordedQuestions((prev) => {
          const newMap = new Map(prev);
          newMap.set(currentQuestionIndex, evaluation);
          console.log("💾 Updated recordedQuestions, size:", newMap.size);
          return newMap;
        });

        setCurrentEvaluation(evaluation);
        setShowFeedback(true);
        setEvaluating(false);
        
        console.log("✅ UI should now show feedback");
      } else {
        setEvaluating(false);
        toast("Failed to evaluate your answer. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error submitting audio:", error);
      setEvaluating(false);
      toast("Error connecting to server.");
    }
  };

  const handleFinalize = async () => {
    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/speaking/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, speakingId: id }),
      });

      const result = await res.json();
      
      if (result.success) {
        setOverallScore(result.overall_score);
        toast(`🎉 Completed! Your overall band: ${result.overall_score.overall_band}`);
      }
    } catch (error) {
      console.error("❌ Error finalizing:", error);
      toast("Failed to save overall score.");
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
    const evaluation = recordedQuestions.get(index);
    if (evaluation && evaluation.audio_url) {
      setCurrentEvaluation(evaluation);
      setShowFeedback(true);
      setAudioURL(getFullAudioURL(evaluation.audio_url));
    } else {
      setShowFeedback(false);
      setCurrentEvaluation(null);
      setAudioURL(null);
    }
  };

  return (
    <div className="speak-detail-page">
      <aside className="sidebar-left">
        <h3 className="sidebar-title">{selectedTopic.title}</h3>
        <div className="questions-list">
          {selectedTopic.questions.map((q, index) => {
            const recorded = recordedQuestions.has(index);
            return (
              <div
                key={index}
                className={`question-item ${
                  index === currentQuestionIndex ? "active" : ""
                } ${recorded ? "recorded" : ""}`}
                onClick={() => handleQuestionClick(index)}
              >
                {recorded && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "green", marginRight: 5 }} />}
                Q{index + 1}. {q.text}
              </div>
            );
          })}
        </div>

        {allCompleted && !overallScore && (
          <button className="finalize-btn" onClick={handleFinalize}>
            🎯 Submit Final Score
          </button>
        )}

        {overallScore && (
          <div className="overall-score">
            <h4>✅ Overall Band: {overallScore.overall_band}</h4>
            <p>Pronunciation: {overallScore.pronunciation_score}</p>
            <p>Fluency: {overallScore.fluency_score}</p>
            <p>Grammar: {overallScore.grammar_score}</p>
            <p>Vocabulary: {overallScore.vocab_score}</p>
          </div>
        )}
      </aside>

      <main className="question-area">
        <div className="question-box">
          <p>{currentQuestion.text}</p>
          <button className="audio-btn" onClick={handleSpeak}>
            <FontAwesomeIcon icon={faVolumeUp} />
          </button>
        </div>

        <div className="nav-buttons">
          <button onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === selectedTopic.questions.length - 1}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        {audioURL && (
          <div className="playback" style={{ textAlign: "center", marginTop: "10px" }}>
            <h4>🔊 Listen to your answer:</h4>
            <audio 
              src={audioURL} 
              controls 
              onError={(e) => {
                console.error("❌ Audio load error:", e);
                toast("Cannot play audio. Please check your connection.");
              }}
              onLoadStart={() => console.log("⏳ Loading audio...")}
              onCanPlay={() => console.log("✅ Audio ready to play")}
            />
          </div>
        )}

        {showFeedback && currentEvaluation && (
          <div className="ai-feedback">
            <h3>AI Evaluation</h3>
            
            <p><strong>Transcript:</strong> {currentEvaluation.transcript}</p>

            <div className="scores">
              <span>Overall: {currentEvaluation.overall_band || currentEvaluation.ai_score}</span>
              <span>Pronunciation: {currentEvaluation.pronunciation_score}</span>
              <span>Fluency: {currentEvaluation.fluency_score}</span>
              <span>Grammar: {currentEvaluation.grammar_score}</span>
              <span>Vocabulary: {currentEvaluation.lexical_score || currentEvaluation.vocab_score}</span>
            </div>
            <p className="feedback-text">
              {typeof currentEvaluation.feedback === "string" 
                ? currentEvaluation.feedback 
                : JSON.stringify(currentEvaluation.feedback)}
            </p>
            
            {currentEvaluation.errors?.length > 0 && (
              <div className="errors">
                <h4>Errors Detected:</h4>
                {currentEvaluation.errors.map((err, i) => (
                  <div key={i} className="error-item">
                    <strong>{err.type}:</strong> "{err.text}" → {err.correction}
                    <p>{err.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {currentEvaluation.suggestions?.length > 0 && (
              <div className="suggestions">
                <h4>Suggestions:</h4>
                <ul>
                  {currentEvaluation.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <aside className="sidebar-right">
        <div className="note-box">
          <div className="note-header">
            Note <span>{note.length}/1000</span>
          </div>
          <textarea
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your notes here..."
          />
        </div>
      </aside>

      <div className="bottom-bar">
        {evaluating ? (
          <button className="record-btn evaluating" disabled>
            <FontAwesomeIcon icon={faSpinner} spin /> Analyzing...
          </button>
        ) : !recording ? (
          <button className="record-btn" onClick={handleStartRecording}>
            <FontAwesomeIcon icon={faMicrophone} /> {isRecorded ? "Re-record" : "Record your answer"}
          </button>
        ) : (
          <button className="record-btn stop" onClick={handleStopRecording}>
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default SpeakDetail;