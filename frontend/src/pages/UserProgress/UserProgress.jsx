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
import html2canvas from "html2canvas";
import "./UserProgress.css";
import { useToast } from "../../component/Toast/ToastContainer";


const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];


// Helper function to convert image to base64
const getImageBase64 = (imgPath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = imgPath;
  });
};

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
  const toast = useToast();


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
        toast("Please login first!");
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

      // Calculate current scores
      calculateCurrentScores(submissions);
      generateQuizAttempts(submissions);
      generateWeeklyProgress(submissions);

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      toast("Failed to load your progress data: " + error.message);
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
      .slice(-5);

    setQuizAttempts(attempts);
  };

  const generateWeeklyProgress = (submissions) => {
    if (submissions.length === 0) {
      setProgressData([]);
      return;
    }

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
        const progress = Math.min((avgScore / 9) * 100, 100);

        weeks.push({
          week: `Week ${i + 1}`,
          progress: Math.round(progress),
        });
      }
    }

    if (weeks.length === 0 && submissions.length > 0) {
      const avgScore = calculateAverage(submissions.map((s) => s.score));
      weeks.push({
        week: "Week 1",
        progress: Math.round((avgScore / 9) * 100),
      });
    }

    setProgressData(weeks);
  };

  const captureChartAsImage = async (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`Error capturing ${elementId}:`, error);
      return null;
    }
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // === HEADER WITH LOGO ===
      // Background color matching header
      doc.setFillColor(255, 251, 222); // #FFFBDE
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Load and add logo
      try {
        const logoBase64 = await getImageBase64('/assets/logo2.png');
        doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
      } catch (error) {
        console.warn('Logo loading failed, using fallback');
        // Fallback: Draw a styled circle with "SF" text if logo fails
        doc.setFillColor(213, 163, 10); // #d5a30a
        doc.circle(25, 20, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('SF', 20, 23);
      }
      
      // Title
      doc.setTextColor(213, 163, 10); // #d5a30a
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('SkillForge', 40, 18);
      
      doc.setFontSize(18);
      doc.setTextColor(254, 93, 1); // #fe5d01
      doc.text('IELTS Progress Report', 40, 28);
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth - 15, 20, { align: 'right' });
      
      let currentY = 50;

      // === USER INFO SECTION ===
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.name || user.email) {
        doc.setFillColor(255, 245, 192); // #fff5c0
        doc.roundedRect(15, currentY, pageWidth - 30, 20, 3, 3, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(213, 163, 10);
        doc.setFont(undefined, 'bold');
        if (user.name) {
          doc.text(`Student: ${user.name}`, 20, currentY + 8);
        }
        if (user.email) {
          doc.text(`Email: ${user.email}`, 20, currentY + 15);
        }
        currentY += 30;
      }

      // === CURRENT SCORES SECTION ===
      // Draw icon circle
      doc.setFillColor(99, 102, 241); // Blue
      doc.circle(20, currentY + 5, 3, 'F');
      
      doc.setFillColor(255, 220, 104); // Matching theme
      doc.roundedRect(15, currentY, pageWidth - 30, 10, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setTextColor(213, 163, 10);
      doc.setFont(undefined, 'bold');
      doc.text('Current Average Scores', 25, currentY + 7);
      currentY += 15;

      // Scores table with styled header
      autoTable(doc, {
        head: [['Skill', 'Average Score', 'Level']],
        body: userScores.map((s) => {
          const score = s.score || 0;
          let level = 'Beginner';
          if (score >= 7) level = 'Advanced';
          else if (score >= 5.5) level = 'Intermediate';
          return [s.skill, score > 0 ? score.toFixed(1) : 'N/A', level];
        }),
        startY: currentY,
        theme: 'striped',
        headStyles: {
          fillColor: [213, 163, 10], // #d5a30a
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [255, 251, 222], // #FFFBDE
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [254, 93, 1] }, // #fe5d01
          1: { halign: 'center', fontStyle: 'bold' },
          2: { halign: 'center' },
        },
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // === OVERALL BAND SCORE ===
      const overallScore = calculateAverage(userScores.map(s => s.score).filter(s => s > 0));
      if (overallScore > 0) {
        doc.setFillColor(250, 214, 114); // #fad672
        doc.roundedRect(15, currentY, pageWidth - 30, 15, 3, 3, 'F');
        doc.setFontSize(12);
        doc.setTextColor(254, 93, 1);
        doc.setFont(undefined, 'bold');
        doc.text(`Overall IELTS Band Score: ${overallScore.toFixed(1)}`, pageWidth / 2, currentY + 10, { align: 'center' });
        currentY += 25;
      }

      // === QUIZ ATTEMPTS SECTION ===
      if (quizAttempts.length > 0) {
        // Check if we need a new page
        if (currentY > pageHeight - 80) {
          doc.addPage();
          currentY = 20;
        }

        // Draw icon
        doc.setFillColor(34, 197, 94); // Green
        doc.circle(20, currentY + 5, 3, 'F');
        
        doc.setFillColor(255, 220, 104);
        doc.roundedRect(15, currentY, pageWidth - 30, 10, 2, 2, 'F');
        doc.setFontSize(14);
        doc.setTextColor(213, 163, 10);
        doc.text('Recent Test Attempts', 25, currentY + 7);
        currentY += 15;

        autoTable(doc, {
          head: [['Attempt', 'Listening', 'Reading', 'Writing', 'Speaking']],
          body: quizAttempts.map((q) => [
            q.attempt,
            q.Listening > 0 ? q.Listening.toFixed(1) : 'N/A',
            q.Reading > 0 ? q.Reading.toFixed(1) : 'N/A',
            q.Writing > 0 ? q.Writing.toFixed(1) : 'N/A',
            q.Speaking > 0 ? q.Speaking.toFixed(1) : 'N/A',
          ]),
          startY: currentY,
          theme: 'grid',
          headStyles: {
            fillColor: [213, 163, 10],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
          },
          styles: {
            fontSize: 9,
            cellPadding: 4,
            halign: 'center',
          },
          columnStyles: {
            0: { fontStyle: 'bold' },
          },
        });

        currentY = doc.lastAutoTable.finalY + 15;
      }

      // === PROGRESS DATA ===
      if (progressData.length > 0) {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = 20;
        }

        // Draw icon
        doc.setFillColor(245, 158, 11); // Orange
        doc.circle(20, currentY + 5, 3, 'F');
        
        doc.setFillColor(255, 220, 104);
        doc.roundedRect(15, currentY, pageWidth - 30, 10, 2, 2, 'F');
        doc.setFontSize(14);
        doc.setTextColor(213, 163, 10);
        doc.text('Weekly Progress', 25, currentY + 7);
        currentY += 15;

        autoTable(doc, {
          head: [['Week', 'Progress (%)']],
          body: progressData.map((p) => [p.week, `${p.progress}%`]),
          startY: currentY,
          theme: 'plain',
          headStyles: {
            fillColor: [213, 163, 10],
            textColor: [255, 255, 255],
            fontSize: 10,
          },
          styles: {
            fontSize: 9,
            cellPadding: 4,
          },
          columnStyles: {
            1: { halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
          },
        });
      }

      // === FOOTER ===
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(255, 251, 222);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `SkillForge IELTS - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
        doc.text(
          `© ${new Date().getFullYear()} SkillForge. All rights reserved.`,
          pageWidth / 2,
          pageHeight - 4,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`SkillForge_IELTS_Progress_${new Date().toISOString().split('T')[0]}.pdf`);
      
      console.log("✅ PDF exported successfully!");
    } catch (err) {
      console.error("❌ Error exporting PDF:", err);
      toast("Failed to export PDF! Please check console for details.");
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Current Scores
    const ws1 = XLSX.utils.json_to_sheet(userScores.map(s => ({
      Skill: s.skill,
      'Average Score': s.score > 0 ? s.score.toFixed(1) : 'N/A',
      Level: s.score >= 7 ? 'Advanced' : s.score >= 5.5 ? 'Intermediate' : 'Beginner'
    })));
    
    // Sheet 2: Attempts
    const ws2 = XLSX.utils.json_to_sheet(quizAttempts.map(q => ({
      Attempt: q.attempt,
      Listening: q.Listening > 0 ? q.Listening.toFixed(1) : 'N/A',
      Reading: q.Reading > 0 ? q.Reading.toFixed(1) : 'N/A',
      Writing: q.Writing > 0 ? q.Writing.toFixed(1) : 'N/A',
      Speaking: q.Speaking > 0 ? q.Speaking.toFixed(1) : 'N/A',
    })));
    
    // Sheet 3: Progress
    const ws3 = XLSX.utils.json_to_sheet(progressData.map(p => ({
      Week: p.week,
      'Progress (%)': p.progress
    })));
    
    XLSX.utils.book_append_sheet(wb, ws1, "Current Scores");
    XLSX.utils.book_append_sheet(wb, ws2, "Test Attempts");
    XLSX.utils.book_append_sheet(wb, ws3, "Weekly Progress");
    
    XLSX.writeFile(wb, `SkillForge_IELTS_Progress_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <div className="chart-card-userprogress" id="progress-chart">
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

        <div className="chart-card-userprogress" id="pie-chart">
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
          <div className="bar-card-userprogress" id="bar-chart">
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