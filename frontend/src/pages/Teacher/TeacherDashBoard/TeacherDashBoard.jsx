import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import HeaderTeacher from "../../../component/HeaderTeacher/HeaderTeacher";
import {
  faEye,
  faPen,
  faTrash,
  faUserGraduate,
  faClock,
  faBookOpen,
  faCommentDots,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./TeacherDashBoard.css";

const Sparkline = ({ data = [] }) => {
  if (!data.length) return null;
  const w = 120;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="sparkline">
      <polyline
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const CircularProgress = ({ percent = 0, size = 72 }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="circular-progress">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#eee" strokeWidth="6" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#g1)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="14" fill="#333">
        {Math.round(percent)}%
      </text>
    </svg>
  );
};

const TeacherDashBoard = () => {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    upcomingSessions: 0,
    pendingReviews: 0,
    avgBandHistory: [],
  });
  const [classes, setClasses] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current teacher ID from localStorage or auth context
  const teacherId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log("🔍 Teacher ID:", teacherId);
      
      if (!teacherId) {
        console.error("❌ No teacher ID found in localStorage");
        setLoading(false);
        return;
      }

      try {
        // Fetch classes from API
        console.log("📡 Fetching classes...");
        const classesRes = await fetch("https://skillforge-99ct.onrender.com/api/admin/classes");
        const classesData = await classesRes.json();
        console.log("📦 All classes:", classesData);
        console.log("📦 Number of classes:", classesData.length);
        
        // Check if any class has teacherId field
        console.log("🔍 Sample class structure:", classesData[0]);
        
        // Filter classes by teacher (try multiple field names)
        let teacherClasses = classesData.filter(c => 
          c.teacherId === teacherId || 
          c.teacher_id === teacherId || 
          c.teacherName === teacherId
        );
        
        console.log("👨‍🏫 Teacher's classes:", teacherClasses);
        
        // If no classes found with teacher filter, use all classes for testing
        if (teacherClasses.length === 0) {
          console.warn("⚠️ No classes found for this teacher, showing all classes for debugging");
          teacherClasses = classesData.slice(0, 5); // Take first 5 for testing
        }
        
        // Format classes data
        const formattedClasses = teacherClasses.map((c, idx) => ({
          id: c.id,
          title: c.name,
          students: c.students?.length || 0,
          progress: Math.random() * 0.4 + 0.4, // Progress would come from actual course completion data
          nextSession: c.schedule ? new Date(c.schedule).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : "N/A",
        }));

        setClasses(formattedClasses);

        // Fetch bookings for upcoming sessions
        console.log("📡 Fetching bookings...");
        const bookingsRes = await fetch("https://skillforge-99ct.onrender.com/api/bookings");
        const bookingsData = await bookingsRes.json();
        console.log("📦 Bookings data:", bookingsData);
        
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
        console.log("📦 Bookings array:", bookingsArray.length, "bookings");
        
        // Filter and format upcoming sessions
        const now = new Date();
        const upcomingBookings = bookingsArray
          .filter(b => {
            const bookingDate = new Date(`${b.date} ${b.time}`);
            console.log("📅 Checking booking:", b.date, b.time, "->", bookingDate >= now);
            return bookingDate >= now;
          })
          .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))
          .slice(0, 3)
          .map(b => ({
            id: b.id,
            student: b.name,
            time: `${b.date} ${b.time}`,
            type: "1:1 Speaking",
            recordingSaved: false,
          }));

        console.log("📅 Upcoming bookings:", upcomingBookings);
        setUpcoming(upcomingBookings);

        // Fetch test results to calculate pending reviews and avg band
        console.log("📡 Fetching test results...");
        const writingSnapshot = await getDocs(collection(db, "writing_submissions"));
        const speakingSnapshot = await getDocs(collection(db, "speaking_question_submissions"));
        
        console.log("📝 Writing submissions:", writingSnapshot.size);
        console.log("🎤 Speaking submissions:", speakingSnapshot.size);
        
        let pendingCount = 0;
        const bandScores = [];

        // Count pending reviews and collect band scores
        writingSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.ai_feedback?.overall_band) {
            bandScores.push(parseFloat(data.ai_feedback.overall_band));
          } else {
            pendingCount++;
          }
        });

        speakingSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.feedback?.overall_band || data.feedback?.ai_score) {
            const score = parseFloat(data.feedback?.overall_band || data.feedback?.ai_score);
            bandScores.push(score);
          } else {
            pendingCount++;
          }
        });

        // Calculate average band history (last 7 periods)
        const avgBandHistory = bandScores.length > 0
          ? bandScores.slice(-7).map((_, idx) => {
              const subset = bandScores.slice(0, idx + 1);
              return subset.reduce((a, b) => a + b, 0) / subset.length;
            })
          : [5.2, 5.3, 5.4, 5.6, 5.7, 6.0, 6.1]; // Fallback

        // Fetch recent activities
        const recentActivities = [];
        
        // Get recent writing submissions
        const recentWriting = await getDocs(
          query(collection(db, "writing_submissions"))
        );
        
        for (const docSnap of recentWriting.docs.slice(0, 3)) {
          const data = docSnap.data();
          let username = "Unknown User";
          
          if (data.user_id) {
            const userRef = doc(db, "users", data.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              username = userData.userName || userData.username || "Unnamed";
            }
          }

          const timeAgo = getTimeAgo(data.created_at?.toDate() || new Date());
          recentActivities.push({
            id: docSnap.id,
            name: username,
            action: "submitted Writing Task",
            time: timeAgo,
          });
        }

        setActivities(recentActivities);

        // Calculate total unique students
        const uniqueStudents = new Set();
        teacherClasses.forEach(c => {
          if (c.students && Array.isArray(c.students)) {
            c.students.forEach(s => {
              uniqueStudents.add(s.id || s);
            });
          }
        });

        console.log("👥 Unique students:", uniqueStudents.size);

        // Update stats
        const newStats = {
          classes: teacherClasses.length,
          students: uniqueStudents.size,
          upcomingSessions: upcomingBookings.length,
          pendingReviews: pendingCount,
          avgBandHistory,
        };
        
        console.log("📊 Final stats:", newStats);
        setStats(newStats);

      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
        console.error("Error details:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacherId]);

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return "vừa xong";
  };

  if (loading) {
    return (
      <HeaderTeacher>
        <div className="dashboard-root">
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p>⏳ Loading dashboard data...</p>
          </div>
        </div>
      </HeaderTeacher>
    );
  }

  const avgBand = stats.avgBandHistory.length > 0
    ? stats.avgBandHistory[stats.avgBandHistory.length - 1].toFixed(1)
    : "0.0";

  const bandImprovement = stats.avgBandHistory.length >= 2
    ? (stats.avgBandHistory[stats.avgBandHistory.length - 1] - stats.avgBandHistory[0]).toFixed(1)
    : "0.0";

  return (
    <HeaderTeacher>
      <div className="dashboard-root">
        {/* Header area inside main */}
        <div className="db-top-row">
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-left">
                <div className="kpi-title">Classes</div>
                <div className="kpi-value">{stats.classes}</div>
              </div>
              <div className="kpi-right">
                <FontAwesomeIcon icon={faBookOpen} className="kpi-icon" />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <div className="kpi-title">Students</div>
                <div className="kpi-value">{stats.students}</div>
              </div>
              <div className="kpi-right">
                <FontAwesomeIcon icon={faUserGraduate} className="kpi-icon" />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <div className="kpi-title">Upcoming</div>
                <div className="kpi-value">{stats.upcomingSessions}</div>
              </div>
              <div className="kpi-right">
                <FontAwesomeIcon icon={faCalendarDays} className="kpi-icon" />
              </div>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-header">
              <div>
                <div className="trend-title">Average Band (last 7)</div>
                <div className="trend-sub">Overall class average trend</div>
              </div>
              <div className="trend-value">{avgBand}</div>
            </div>
            <div className="trend-body">
              <Sparkline data={stats.avgBandHistory} />
              <div className="trend-meta">
                <div>+{bandImprovement} since start</div>
                <div className="small-muted">Keep encouraging weekly practice</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle content: classes + upcoming */}
        <div className="db-mid-row">
          <section className="card classes-card">
            <div className="card-header">
              <h3>Recent Classes</h3>
            </div>

            <div className="classes-list">
              {classes.length > 0 ? (
                classes.slice(0, 3).map((c) => (
                  <div className="class-item" key={c.id}>
                    <div className="class-main">
                      <div className="class-title">{c.title}</div>
                      <div className="class-meta">{c.students} students</div>
                      <div className="class-next">Next: {c.nextSession}</div>
                    </div>
                    <div className="class-right">
                      <CircularProgress percent={c.progress * 100} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-muted">No classes found</p>
              )}
            </div>
          </section>

          <aside className="card upcoming-card">
            <div className="card-header">
              <h3>Upcoming Sessions</h3>
              <span className="small-muted">Today & next 3 days</span>
            </div>
            <div className="upcoming-list">
              {upcoming.length > 0 ? (
                upcoming.map((s) => (
                  <div className="up-item" key={s.id}>
                    <div>
                      <div className="up-title">{s.student}</div>
                      <div className="up-sub">{s.type}</div>
                      <div className="small-muted">{s.time}</div>
                    </div>
                    <div className="up-actions">
                      {s.recordingSaved ? (
                        <span className="badge saved">Saved</span>
                      ) : (
                        <span className="badge pending">No Rec</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-muted">No upcoming sessions</p>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom: activities and quick actions */}
        <div className="db-bottom-row">
          <section className="card activities-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
            </div>
            <ul className="activities-list">
              {activities.length > 0 ? (
                activities.map((a) => (
                  <li key={a.id} className="activity-item">
                    <div className="act-left">
                      <div className="act-name">{a.name}</div>
                      <div className="small-muted">{a.action}</div>
                    </div>
                    <div className="act-right small-muted">{a.time}</div>
                  </li>
                ))
              ) : (
                <li className="small-muted">No recent activities</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </HeaderTeacher>
  );
};

export default TeacherDashBoard;