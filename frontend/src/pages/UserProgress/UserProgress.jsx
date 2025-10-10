import React, { useState } from "react";
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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./UserProgress.css";
// npm install recharts xlsx jspdf jspdf-autotable lucide-react

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

const UserProgress = () => {
  const [userScores] = useState([
    { skill: "Listening", score: 7.0 },
    { skill: "Reading", score: 7.5 },
    { skill: "Writing", score: 6.5 },
    { skill: "Speaking", score: 6.0 },
  ]);

  const [quizAttempts] = useState([
    {
      attempt: "Attempt 1",
      Listening: 6.0,
      Reading: 6.5,
      Writing: 6.0,
      Speaking: 5.5,
    },
    {
      attempt: "Attempt 2",
      Listening: 6.5,
      Reading: 7.0,
      Writing: 6.0,
      Speaking: 5.5,
    },
    {
      attempt: "Attempt 3",
      Listening: 7.0,
      Reading: 7.5,
      Writing: 6.5,
      Speaking: 6.0,
    },
  ]);

  const [progressData] = useState([
    { week: "Week 1", progress: 25 },
    { week: "Week 2", progress: 45 },
    { week: "Week 3", progress: 70 },
    { week: "Week 4", progress: 90 },
  ]);

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
        head: [["Skills", "Current GPA"]],
        body: userScores.map((s) => [s.skill, s.score]),
        startY: 25,
      });

      autoTable(doc, {
        head: [["Attempt", "Listening", "Reading", "Writing", "Speaking"]],
        body: quizAttempts.map((q) => [
          q.attempt,
          q.Listening,
          q.Reading,
          q.Writing,
          q.Speaking,
        ]),
        startY: doc.lastAutoTable.finalY + 10,
      });

      autoTable(doc, {
        head: [["Week", "Progress (%)"]],
        body: progressData.map((p) => [p.week, p.progress]),
        startY: doc.lastAutoTable.finalY + 10,
      });

      doc.save("IELTS_Progress.pdf");
    } catch (err) {
      console.error("Lỗi khi xuất PDF:", err);
      alert(
        "Xuất PDF thất bại! Vui lòng kiểm tra console để xem chi tiết lỗi."
      );
    }
  };

  return (
    <div className="user-progress-page-userprogress">
      <h1 className="user-progress-title-userprogress">
        Report Your IELTS Progress
      </h1>

      {/* gpaa */}
      <div className="score-card-userprogress">
        <h2 className="chart-title-userprogress">Current GPA</h2>
        <div className="score-card-grid-userprogress">
          {userScores.map((item, idx) => (
            <div className="score-item-userprogress" key={idx}>
              <p className="score-skill-userprogress">{item.skill}</p>
              <p className="score-value-userprogress">{item.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* graph */}
      <div className="chart-grid-userprogress">
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card-userprogress">
          <h2 className="chart-title-userprogress">Score Ratio For Each Skill</h2>
          <div className="chart-content-userprogress">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userScores}
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* bar chart */}
      <div className="bar-section-userprogress">
        <div className="bar-card-userprogress">
          <h2 className="chart-title-userprogress">
            Compare Scores
          </h2>
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

      {/* Export */}
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
