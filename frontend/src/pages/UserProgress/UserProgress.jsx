import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./UserProgress.css";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

const UserProgress = () => {
  const [userScores, setUserScores] = useState([
    { skill: "Listening", score: 0 },
    { skill: "Reading", score: 0 },
    { skill: "Writing", score: 0 },
    { skill: "Speaking", score: 0 },
  ]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSubmissions, setAllSubmissions] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      console.log("🔍 Checking userId:", userId);
      console.log("🔍 User object:", user);
      
      if (!userId) {
        alert("Please login first!");
        setLoading(false);
        return;
      }

      const submissions = [];

      // Fetch Writing Submissions
      const writingQuery = query(
        collection(db, "writing_submissions"),
        where("user_id", "==", userId)
      );
      const writingSnapshot = await getDocs(writingQuery);
      console.log("✍️ Writing submissions:", writingSnapshot.size);
      writingSnapshot.forEach((doc) => {
        const data = doc.data();
        const overallBand = parseFloat(data.ai_feedback?.overall_band);
        if (overallBand && overallBand > 0) {
          submissions.push({
            skill: "writing",
            score: overallBand,
            date: data.created_at?.toDate() || new Date(),
            feedback: data.ai_feedback,
          });
        }
      });

      // Fetch Speaking Question Submissions
      const speakingQuery = query(
        collection(db, "speaking_question_submissions"),
        where("user_id", "==", userId)
      );
      const speakingSnapshot = await getDocs(speakingQuery);
      console.log("🎤 Speaking question submissions:", speakingSnapshot.size);
      speakingSnapshot.forEach((doc) => {
        const data = doc.data();
        let feedback = data.feedback;
        if (typeof feedback === "string") {
          try {
            feedback = JSON.parse(feedback);
          } catch (e) {
            console.warn("Could not parse feedback:", e);
          }
        }
        const score = parseFloat(feedback?.overall_band || feedback?.ai_score);
        if (score && score > 0) {
          submissions.push({
            skill: "speaking",
            score: score,
            date: data.created_at?.toDate() || new Date(),
            feedback: feedback,
          });
        }
      });

      // Fetch Speaking Topic Submissions
      const speakingTopicQuery = query(
        collection(db, "speaking_submissions"),
        where("user_id", "==", userId)
      );
      const speakingTopicSnapshot = await getDocs(speakingTopicQuery);
      console.log("🎤 Speaking topic submissions:", speakingTopicSnapshot.size);
      speakingTopicSnapshot.forEach((doc) => {
        const data = doc.data();
        const score = parseFloat(data.ai_score);
        if (score && score > 0) {
          submissions.push({
            skill: "speaking",
            score: score,
            date: data.submitted_at?.toDate() || new Date(),
            feedback: {
              overall_band: data.ai_score,
              pronunciation_score: data.pronunciation_score,
              fluency_score: data.fluency_score,
              grammar_score: data.grammar_score,
              lexical_score: data.vocab_score,
            },
          });
        }
      });

      // Fetch Listening Submissions
      const listeningQuery = query(
        collection(db, "listening_submissions"),
        where("user_id", "==", userId)
      );
      const listeningSnapshot = await getDocs(listeningQuery);
      console.log("🎧 Listening submissions:", listeningSnapshot.size);
      
      listeningSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("🎧 Listening doc data:", {
          id: doc.id,
          overband: data.overband,
          score: data.score,
          aiFeedback: data.aiFeedback,
        });
        
        // Ưu tiên overband, nếu không có thì dùng score
        const score = data.overband || data.score || 0;
        
        if (score > 0) {
          submissions.push({
            skill: "listening",
            score: parseFloat(score),
            date: data.submitted_at?.toDate() || data.created_at?.toDate() || new Date(),
            feedback: data.aiFeedback,
          });
        } else {
          console.warn("⚠️ Listening submission without valid score:", doc.id);
        }
      });

      // Fetch Reading Submissions
      const readingQuery = query(
        collection(db, "reading_submissions"),
        where("user_id", "==", userId)
      );
      const readingSnapshot = await getDocs(readingQuery);
      console.log("📖 Reading submissions:", readingSnapshot.size);
      
      readingSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📖 Reading doc data:", {
          id: doc.id,
          overband: data.overband,
          score: data.score,
          aiFeedback: data.aiFeedback,
        });
        
        // Ưu tiên overband, nếu không có thì dùng score
        const score = data.overband || data.score || 0;
        
        if (score > 0) {
          submissions.push({
            skill: "reading",
            score: parseFloat(score),
            date: data.submitted_at?.toDate() || data.created_at?.toDate() || new Date(),
            feedback: data.aiFeedback,
          });
        } else {
          console.warn("⚠️ Reading submission without valid score:", doc.id);
        }
      });

      // Sort by date
      submissions.sort((a, b) => a.date - b.date);
      console.log("📊 Total submissions:", submissions.length);
      console.log("📊 All submissions:", submissions);
      setAllSubmissions(submissions);

      // Calculate current scores (average of all attempts for each skill)
      calculateCurrentScores(submissions);

      // Generate quiz attempts data (last 5 attempts)
      generateQuizAttempts(submissions);

      // Generate weekly progress data
      generateWeeklyProgress(submissions);

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      alert("Failed to load your progress data: " + error.message);
      setLoading(false);
    }
  };

  const calculateCurrentScores = (submissions) => {
    const skillScores = {
      listening: [],
      reading: [],
      writing: [],
      speaking: [],
    };

    submissions.forEach((sub) => {
      if (sub.score > 0) {
        skillScores[sub.skill.toLowerCase()].push(sub.score);
      }
    });

    console.log("📊 Skill scores breakdown:", skillScores);

    const updatedScores = [
      {
        skill: "Listening",
        score: calculateAverage(skillScores.listening),
      },
      {
        skill: "Reading",
        score: calculateAverage(skillScores.reading),
      },
      {
        skill: "Writing",
        score: calculateAverage(skillScores.writing),
      },
      {
        skill: "Speaking",
        score: calculateAverage(skillScores.speaking),
      },
    ];

    console.log("📊 Updated scores:", updatedScores);
    setUserScores(updatedScores);
  };

  const calculateAverage = (scores) => {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return parseFloat((sum / scores.length).toFixed(1));
  };

  const generateQuizAttempts = (submissions) => {
    if (submissions.length === 0) {
      setQuizAttempts([]);
      return;
    }

    // Group submissions by date and calculate average for each day
    const attemptsByDate = {};
    
    submissions.forEach((sub) => {
      const dateKey = sub.date.toDateString();
      if (!attemptsByDate[dateKey]) {
        attemptsByDate[dateKey] = {
          listening: [],
          reading: [],
          writing: [],
          speaking: [],
          date: sub.date,
        };
      }
      attemptsByDate[dateKey][sub.skill.toLowerCase()].push(sub.score);
    });

    // Convert to array and get last 5 attempts
    const attempts = Object.values(attemptsByDate)
      .sort((a, b) => a.date - b.date)
      .map((attempt, index) => ({
        attempt: `Attempt ${index + 1}`,
        Listening: calculateAverage(attempt.listening),
        Reading: calculateAverage(attempt.reading),
        Writing: calculateAverage(attempt.writing),
        Speaking: calculateAverage(attempt.speaking),
        date: attempt.date,
      }))
      .slice(-5); // Get last 5 attempts

    setQuizAttempts(attempts);
  };

  const generateWeeklyProgress = (submissions) => {
    if (submissions.length === 0) {
      setProgressData([]);
      return;
    }

    // Calculate progress based on score improvements over time
    const weeks = [];
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const firstDate = submissions[0].date.getTime();
    const lastDate = submissions[submissions.length - 1].date.getTime();
    const totalWeeks = Math.ceil((lastDate - firstDate) / millisecondsPerWeek) || 1;

    for (let i = 0; i < Math.min(totalWeeks, 12); i++) {
      const weekStart = firstDate + i * millisecondsPerWeek;
      const weekEnd = weekStart + millisecondsPerWeek;

      const weekSubmissions = submissions.filter(
        (sub) => sub.date.getTime() >= weekStart && sub.date.getTime() < weekEnd
      );

      if (weekSubmissions.length > 0) {
        const avgScore = calculateAverage(weekSubmissions.map((s) => s.score));
        const progress = Math.min((avgScore / 9) * 100, 100); // Convert to percentage (9 is max IELTS score)

        weeks.push({
          week: `Week ${i + 1}`,
          progress: Math.round(progress),
        });
      }
    }

    // If no weekly data, create at least one entry
    if (weeks.length === 0 && submissions.length > 0) {
      const avgScore = calculateAverage(submissions.map((s) => s.score));
      weeks.push({
        week: "Week 1",
        progress: Math.round((avgScore / 9) * 100),
      });
    }

    setProgressData(weeks);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(userScores);
    const ws2 = XLSX.utils.json_to_sheet(quizAttempts);
    const ws3 = XLSX.utils.json_to_sheet(progressData);
    XLSX.utils.book_append_sheet(wb, ws1, "IELTS Scores");
    XLSX.utils.book_append_sheet(wb, ws2, "Attempts");
    XLSX.utils.book_append_sheet(wb, ws3, "Progress");
    XLSX.writeFile(wb, "IELTS_Progress.xlsx");
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Report Your IELTS Progress", 60, 15);

      autoTable(doc, {
        head: [["Skills", "Current Score"]],
        body: userScores.map((s) => [s.skill, s.score || "N/A"]),
        startY: 25,
      });

      if (quizAttempts.length > 0) {
        autoTable(doc, {
          head: [["Attempt", "Listening", "Reading", "Writing", "Speaking"]],
          body: quizAttempts.map((q) => [
            q.attempt,
            q.Listening || "N/A",
            q.Reading || "N/A",
            q.Writing || "N/A",
            q.Speaking || "N/A",
          ]),
          startY: doc.lastAutoTable.finalY + 10,
        });
      }

      if (progressData.length > 0) {
        autoTable(doc, {
          head: [["Week", "Progress (%)"]],
          body: progressData.map((p) => [p.week, p.progress]),
          startY: doc.lastAutoTable.finalY + 10,
        });
      }

      doc.save("IELTS_Progress.pdf");
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF! Please check console for details.");
    }
  };

  if (loading) {
    return (
      <div className="user-progress-page-userprogress">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>⏳ Loading your progress...</h2>
        </div>
      </div>
    );
  }

  if (allSubmissions.length === 0) {
    return (
      <div className="user-progress-page-userprogress">
        <h1 className="user-progress-title-userprogress">
          Report Your IELTS Progress
        </h1>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>📊 No test data yet</h2>
          <p>Start practicing to see your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-progress-page-userprogress">
      <h1 className="user-progress-title-userprogress">
        Report Your IELTS Progress
      </h1>

      {/* Current Scores */}
      <div className="score-card-userprogress">
        <h2 className="chart-title-userprogress">Current Average Scores</h2>
        <div className="score-card-grid-userprogress">
          {userScores.map((item, idx) => (
            <div className="score-item-userprogress" key={idx}>
              <p className="score-skill-userprogress">{item.skill}</p>
              <p className="score-value-userprogress">
                {item.score > 0 ? item.score : "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid-userprogress">
        {progressData.length > 0 && (
          <div className="chart-card-userprogress">
            <h2 className="chart-title-userprogress">Weekly Learning Progress</h2>
            <div className="chart-content-userprogress">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Progress %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="chart-card-userprogress">
          <h2 className="chart-title-userprogress">Score Ratio For Each Skill</h2>
          <div className="chart-content-userprogress">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userScores.filter((s) => s.score > 0)}
                  dataKey="score"
                  nameKey="skill"
                  outerRadius={80}
                  label
                >
                  {userScores.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {quizAttempts.length > 0 && (
        <div className="bar-section-userprogress">
          <div className="bar-card-userprogress">
            <h2 className="chart-title-userprogress">Compare Scores</h2>
            <div className="chart-content-userprogress">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quizAttempts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="attempt" />
                  <YAxis domain={[0, 9]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Listening" fill="#6366f1" />
                  <Bar dataKey="Reading" fill="#22c55e" />
                  <Bar dataKey="Writing" fill="#f59e0b" />
                  <Bar dataKey="Speaking" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="export-buttons-userprogress">
        <button
          className="export-btn-userprogress export-pdf-userprogress"
          onClick={exportToPDF}
        >
          <Download size={18} /> Export PDF
        </button>
        <button
          className="export-btn-userprogress export-excel-userprogress"
          onClick={exportToExcel}
        >
          <Download size={18} /> Export Excel
        </button>
      </div>
    </div>
  );
};

export default UserProgress;