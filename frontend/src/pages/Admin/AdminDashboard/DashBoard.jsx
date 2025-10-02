import { useState, useEffect } from 'react';
import AdminHeader from "../../../component/HeaderAdmin/HeaderAdmin";
import './DashBoard.css';
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4CAF50", "#FF9800", "#F44336"]; // Completed, In Progress, Dropped

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        learningPath: [],
        userJoins: 0,
        monthlyTests: [],
        avgScores: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for IELTS admin dashboard
        const fakeDashboard = {
            learningPath: [
                { name: "Completed", value: 180 },
                { name: "In Progress", value: 95 },
                { name: "Dropped", value: 40 },
            ],
            userJoins: 257,
            monthlyTests: [
                { month: "Jan", tests: 120 },
                { month: "Feb", tests: 150 },
                { month: "Mar", tests: 180 },
                { month: "Apr", tests: 160 },
                { month: "May", tests: 200 },
            ],
            avgScores: [
                { skill: "Listening", score: 6.8 },
                { skill: "Reading", score: 6.5 },
                { skill: "Writing", score: 6.0 },
                { skill: "Speaking", score: 6.7 },
            ]
        };

        setTimeout(() => {
            setDashboardData(fakeDashboard);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return <div className="loading">Loading dashboard data...</div>;
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader />

            <div className="chart-container">
                {/* Learning Path Completion */}
                <div className="chart-wrapper-large">
                    <h3 className="chart-title">Learning Path Completion</h3>
                    <div className="chart-wrapper">
                        <PieChart width={220} height={220}>
                            <Pie 
                                data={dashboardData.learningPath} 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={80} 
                                dataKey="value"
                            >
                                {dashboardData.learningPath.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </div>

                {/* New Users */}
                <div className="chart-wrapper-large user-join-card">
                    <h3 className="chart-title">User Registrations</h3>
                    <div className="chart-wrapper">
                        <div className="user-join-content">
                            <div className="user-join-number">
                                {dashboardData.userJoins}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Tests */}
                <div className="chart-wrapper-large">
                    <h3 className="chart-title">Monthly Test Attempts</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width={250} height={250}>
                            <BarChart data={dashboardData.monthlyTests}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="tests" fill="#2196F3" name="Tests" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Average Scores */}
            <div className="chart-slider-container">
            <div className="bar-chart-container">
                <h2>Average Score by Skill</h2>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart 
                        data={dashboardData.avgScores} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        barCategoryGap="30%"  // giãn khoảng cách cột
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="skill" angle={-20} textAnchor="end" interval={0} /> 
                        <YAxis domain={[0, 9]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" name="Band Score">
                            {dashboardData.avgScores.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
