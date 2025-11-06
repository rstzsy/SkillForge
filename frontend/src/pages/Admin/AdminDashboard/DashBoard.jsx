// AdminDashboard.jsx - Updated with real Firebase data
import { useState, useEffect } from 'react';
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, TrendingUp, BookOpen, Award } from 'lucide-react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/config";
import './DashBoard.css';

const COLORS = {
  primary: ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"],
  status: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
  gradient: ["#667eea", "#764ba2", "#f093fb", "#4facfe"]
};

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        learningPath: [],
        userJoins: 0,
        monthlyTests: [],
        avgScores: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Đếm tổng số users
                const usersSnapshot = await getDocs(collection(db, "users"));
                const totalUsers = usersSnapshot.size;

                // 2. Lấy tất cả submissions để phân tích
                const [writingSnap, speakingQSnap, speakingSnap, listeningSnap, readingSnap] = await Promise.all([
                    getDocs(collection(db, "writing_submissions")),
                    getDocs(collection(db, "speaking_question_submissions")),
                    getDocs(collection(db, "speaking_submissions")),
                    getDocs(collection(db, "listening_submissions")),
                    getDocs(collection(db, "reading_submissions"))
                ]);

                // 3. Tính số lượng test attempts theo skill (cho Pie Chart)
                const skillCounts = {
                    Writing: writingSnap.size,
                    Speaking: speakingQSnap.size + speakingSnap.size,
                    Listening: listeningSnap.size,
                    Reading: readingSnap.size
                };

                const learningPathData = [
                    { name: "Writing", value: skillCounts.Writing },
                    { name: "Speaking", value: skillCounts.Speaking },
                    { name: "Listening", value: skillCounts.Listening },
                    { name: "Reading", value: skillCounts.Reading }
                ];

                // 4. Tính monthly tests (Line Chart) - 5 tháng gần nhất
                const allSubmissions = [
                    ...writingSnap.docs.map(doc => ({ ...doc.data(), skill: 'writing' })),
                    ...speakingQSnap.docs.map(doc => ({ ...doc.data(), skill: 'speaking' })),
                    ...speakingSnap.docs.map(doc => ({ ...doc.data(), skill: 'speaking' })),
                    ...listeningSnap.docs.map(doc => ({ ...doc.data(), skill: 'listening' })),
                    ...readingSnap.docs.map(doc => ({ ...doc.data(), skill: 'reading' }))
                ];

                // Nhóm theo tháng
                const monthlyData = {};
                const now = new Date();
                
                // Tạo 5 tháng gần nhất
                for (let i = 4; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthKey = date.toLocaleString('en-US', { month: 'short' });
                    monthlyData[monthKey] = { month: monthKey, tests: 0, growth: 0 };
                }

                // Đếm số tests mỗi tháng
                allSubmissions.forEach(sub => {
                    let date;
                    if (sub.created_at?.toDate) {
                        date = sub.created_at.toDate();
                    } else if (sub.submitted_at?.toDate) {
                        date = sub.submitted_at.toDate();
                    } else {
                        return;
                    }

                    const monthKey = date.toLocaleString('en-US', { month: 'short' });
                    if (monthlyData[monthKey]) {
                        monthlyData[monthKey].tests++;
                    }
                });

                // Tính growth (so với tháng trước)
                const monthKeys = Object.keys(monthlyData);
                monthKeys.forEach((key, index) => {
                    if (index > 0) {
                        const prevMonth = monthlyData[monthKeys[index - 1]].tests;
                        const currentMonth = monthlyData[key].tests;
                        monthlyData[key].growth = prevMonth > 0 
                            ? Math.round((currentMonth / prevMonth) * 100)
                            : currentMonth * 100;
                    } else {
                        monthlyData[key].growth = 100;
                    }
                });

                const monthlyTestsData = Object.values(monthlyData);

                // 5. Tính average scores theo skill (Bar Chart)
                const calculateAvgScore = (submissions, scoreField) => {
                    if (submissions.length === 0) return 0;
                    
                    const scores = submissions
                        .map(doc => {
                            const data = doc.data();
                            // Xử lý các field score khác nhau
                            if (scoreField === 'writing') {
                                return parseFloat(data.ai_feedback?.overall_band) || 0;
                            } else if (scoreField === 'speaking') {
                                return parseFloat(data.feedback?.overall_band || data.feedback?.ai_score || data.ai_score) || 0;
                            } else { // listening/reading
                                return parseFloat(data.overband) || 0;
                            }
                        })
                        .filter(score => score > 0);
                    
                    if (scores.length === 0) return 0;
                    const sum = scores.reduce((acc, score) => acc + score, 0);
                    return (sum / scores.length).toFixed(1);
                };

                const avgScoresData = [
                    { skill: "Writing", score: parseFloat(calculateAvgScore(writingSnap.docs, 'writing')) },
                    { skill: "Speaking", score: parseFloat(calculateAvgScore([...speakingQSnap.docs, ...speakingSnap.docs], 'speaking')) },
                    { skill: "Listening", score: parseFloat(calculateAvgScore(listeningSnap.docs, 'listening')) },
                    { skill: "Reading", score: parseFloat(calculateAvgScore(readingSnap.docs, 'reading')) }
                ];

                // 6. Tính overall average score
                const allScores = avgScoresData.map(item => item.score).filter(s => s > 0);
                const overallAvg = allScores.length > 0 
                    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
                    : "0.0";

                setDashboardData({
                    learningPath: learningPathData,
                    userJoins: totalUsers,
                    monthlyTests: monthlyTestsData,
                    avgScores: avgScoresData,
                    overallAvg
                });

            } catch (error) {
                console.error("❌ Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">
                        {payload[0].name}: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="loading-container">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <AdminHeader />
            <div className="dashboard-content">
                {/* Header */}
                <h1 className="dashboard-title">
                    Dashboard
                </h1>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-card-purple">
                        <div className="stat-card-content">
                            <div>
                                <p className="stat-label">Total Users</p>
                                <h2 className="stat-value">{dashboardData.userJoins}</h2>
                            </div>
                            <Users size={48} className="stat-icon" />
                        </div>
                    </div>

                    <div className="stat-card stat-card-pink">
                        <div className="stat-card-content">
                            <div>
                                <p className="stat-label">Total Tests</p>
                                <h2 className="stat-value">
                                    {dashboardData.learningPath.reduce((sum, item) => sum + item.value, 0)}
                                </h2>
                            </div>
                            <TrendingUp size={48} className="stat-icon" />
                        </div>
                    </div>

                    <div className="stat-card stat-card-cyan">
                        <div className="stat-card-content">
                            <div>
                                <p className="stat-label">Avg. Score</p>
                                <h2 className="stat-value">{dashboardData.overallAvg}</h2>
                            </div>
                            <Award size={48} className="stat-icon" />
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    {/* Test Attempts Pie Chart */}
                    <div className="chart-card">
                        <h3 className="chart-title">Test Attempts by Skill</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={dashboardData.learningPath} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={70}
                                    outerRadius={100} 
                                    dataKey="value"
                                    paddingAngle={5}
                                >
                                    {dashboardData.learningPath.map((entry, i) => (
                                        <Cell 
                                            key={`cell-${i}`} 
                                            fill={COLORS.status[i % COLORS.status.length]}
                                            className="pie-cell"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Tests Chart */}
                    <div className="chart-card">
                        <h3 className="chart-title">Monthly Test Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData.monthlyTests}>
                                <defs>
                                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="tests" 
                                    stroke="#667eea" 
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: '#667eea', strokeWidth: 2, stroke: 'white' }}
                                    activeDot={{ r: 8 }}
                                    fillOpacity={1}
                                    fill="url(#colorTests)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Bar Chart */}
                <div className="chart-card chart-card-full">
                    <h3 className="chart-title">Average Band Score by Skill</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart 
                            data={dashboardData.avgScores} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <defs>
                                {dashboardData.avgScores.map((entry, index) => (
                                    <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.primary[index]} stopOpacity={1}/>
                                        <stop offset="100%" stopColor={COLORS.primary[index]} stopOpacity={0.6}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="skill"
                                stroke="#6b7280"
                                style={{ fontSize: '14px', fontWeight: 500 }}
                            />
                            <YAxis 
                                domain={[0, 9]}
                                stroke="#6b7280"
                                style={{ fontSize: '12px', fontWeight: 500 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="score" 
                                radius={[12, 12, 0, 0]}
                                maxBarSize={80}
                            >
                                {dashboardData.avgScores.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={`url(#barGradient${index})`}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;