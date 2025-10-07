import React, { useState, useEffect } from "react";
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

const mockStats = {
  classes: 8,
  students: 124,
  upcomingSessions: 3,
  pendingReviews: 5,
  avgBandHistory: [5.2, 5.3, 5.4, 5.6, 5.7, 6.0, 6.1],
};

const mockClasses = [
  {
    id: "C101",
    title: "IELTS Speaking - Advanced",
    students: 12,
    progress: 0.62,
    nextSession: "2025-10-12 09:30",
  },
  {
    id: "C302",
    title: "IELTS Writing - Task 2",
    students: 8,
    progress: 0.44,
    nextSession: "2025-10-10 14:00",
  },
  {
    id: "C210",
    title: "General IELTS Practice",
    students: 20,
    progress: 0.78,
    nextSession: "2025-10-09 17:00",
  },
];

const mockUpcoming = [
  {
    id: "S-001",
    student: "Nguyễn Văn A",
    time: "2025-10-09 17:00",
    type: "1:1 Speaking",
    recordingSaved: true,
  },
  {
    id: "S-002",
    student: "Trần Thị B",
    time: "2025-10-10 14:00",
    type: "Writing Review",
    recordingSaved: false,
  },
  {
    id: "S-003",
    student: "Pham C",
    time: "2025-10-12 09:30",
    type: "Group Speaking",
    recordingSaved: false,
  },
];

const mockActivities = [
  { id: 1, name: "Lê Minh", action: "submitted Writing Task 2", time: "2 giờ trước" },
  { id: 2, name: "Hoàng Y", action: "completed Listening practice", time: "4 giờ trước" },
  { id: 3, name: "Mai K", action: "booked a 1:1 session", time: "1 ngày trước" },
];

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
  const [stats, setStats] = useState(mockStats);
  const [classes, setClasses] = useState(mockClasses);
  const [upcoming, setUpcoming] = useState(mockUpcoming);
  const [activities, setActivities] = useState(mockActivities);

  useEffect(() => {
    // Nếu bạn có API, call ở đây để load dữ liệu thật.
    // fetch('/api/teacher/dashboard').then(...)
  }, []);

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

            <div className="kpi-card">
              <div className="kpi-left">
                <div className="kpi-title">Pending Reviews</div>
                <div className="kpi-value">{stats.pendingReviews}</div>
              </div>
              <div className="kpi-right">
                <FontAwesomeIcon icon={faCommentDots} className="kpi-icon" />
              </div>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-header">
              <div>
                <div className="trend-title">Average Band (last 7)</div>
                <div className="trend-sub">Overall class average trend</div>
              </div>
              <div className="trend-value">6.1</div>
            </div>
            <div className="trend-body">
              <Sparkline data={stats.avgBandHistory} />
              <div className="trend-meta">
                <div>+0.9 since start</div>
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
              <button className="btn-small">See all</button>
            </div>

            <div className="classes-list">
              {classes.map((c) => (
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
              ))}
            </div>
          </section>

          <aside className="card upcoming-card">
            <div className="card-header">
              <h3>Upcoming Sessions</h3>
              <span className="small-muted">Today & next 3 days</span>
            </div>
            <div className="upcoming-list">
              {upcoming.map((s) => (
                <div className="up-item" key={s.id}>
                  <div>
                    <div className="up-title">{s.student}</div>
                    <div className="up-sub">{s.type}</div>
                    <div className="small-muted">{s.time}</div>
                  </div>
                  <div className="up-actions">
                    {s.recordingSaved ? <span className="badge saved">Saved</span> : <span className="badge pending">No Rec</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer">
              <button className="btn-primary">Open Calendar</button>
            </div>
          </aside>
        </div>

        {/* Bottom: activities and quick actions */}
        <div className="db-bottom-row">
          <section className="card activities-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              <button className="btn-small">Clear</button>
            </div>
            <ul className="activities-list">
              {activities.map((a) => (
                <li key={a.id} className="activity-item">
                  <div className="act-left">
                    <div className="act-name">{a.name}</div>
                    <div className="small-muted">{a.action}</div>
                  </div>
                  <div className="act-right small-muted">{a.time}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card quick-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>

            <div className="quick-grid">
              <button className="quick-btn">
                <FontAwesomeIcon icon={faEye} /> View Students
              </button>
              <button className="quick-btn">
                <FontAwesomeIcon icon={faPen} /> Grade Submissions
              </button>
              <button className="quick-btn">
                <FontAwesomeIcon icon={faClock} /> Schedule Session
              </button>
              <button className="quick-btn">
                <FontAwesomeIcon icon={faTrash} /> Remove Draft
              </button>
            </div>
          </section>
        </div>
      </div>
    </HeaderTeacher>
  );
};

export default TeacherDashBoard;
