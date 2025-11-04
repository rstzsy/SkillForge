import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import SliderComponent from "../../component/SliderComponent/SliderComponent";
import "./HomePage.css";


const sliderImages = [
  "/assets/slider1.png",
  "/assets/slider2.png",
  "/assets/slider3.png",
  "/assets/slider4.png",
  "/assets/slider5.png",
];

const services = [
    {
      icon: "/assets/ieltsTestService.png",
      title: "IELTS Tests",
      desc: "Access a bank of real IELTS tests and practice mock exams anytime.",
    },
    {
      icon: "/assets/aiService.png",
      title: "AI Scoring & Guidance",
      desc: "AI evaluates Speaking & Writing, analyzes Reading & Listening, and suggests a personalized study roadmap.",
    },
    {
      icon: "/assets/personalizedService.png",
      title: "Personalized Learning",
      desc: "Track your learning history, adapt exercises to your weak points, and get smarter recommendations.",
    },
    {
      icon: "/assets/reportService.png",
      title: "Reports & Statistics",
      desc: "View progress charts, compare with goals, and export detailed study reports as PDF or via email.",
    },
];

const ITEMS_PER_PAGE = 4;

const HomePage = () => {
  const [skillFilter, setSkillFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy các collection tương ứng
        const [speakSnap, writeSnap, readSnap, listenSnap] = await Promise.all([
          getDocs(collection(db, "speaking_practices")),
          getDocs(collection(db, "writing_practices")),
          getDocs(collection(db, "reading_practices")),
          getDocs(collection(db, "listening_practices")),
        ]);

        // Chuẩn hóa dữ liệu
        const allExercises = [
          ...speakSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().topic || "Untitled Speaking Task",
            skill: "S",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 15,
            type: "Speaking",
          })),
          ...writeSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().title || "Untitled Writing Task",
            skill: "W",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 30,
            type: "Writing",
          })),
          ...readSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().title || "Untitled Reading Task",
            skill: "R",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 45,
            type: "Reading",
          })),
          ...listenSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().title || "Untitled Listening Task",
            skill: "L",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 30,
            type: "Listening",
          })),
        ];

        setExercises(allExercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredExercises = exercises.filter((item) => {
    return (
      (skillFilter === "All" || item.skill === skillFilter) &&
      (difficultyFilter === "All" || item.difficulty === difficultyFilter) &&
      (durationFilter === "All" || item.duration === parseInt(durationFilter))
    );
  });

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentExercises = filteredExercises.slice(startIndex,startIndex + ITEMS_PER_PAGE);

  return (
    <>
      {/* Slider Section */}
      <div id="container1">
        <SliderComponent images={sliderImages} />
      </div>

      {/* Introduction Section */}
        <section className="intro-section">
            <div className="intro-left">
                <span className="intro-subtitle">IELTS MASTER HUB</span>
                <h1 className="intro-title">
                    Achieve Your <br /> Dream IELTS Score
                </h1>
                <p className="intro-text">
                    Our platform provides a personalized learning path, mock tests, and
                    expert tips to help you reach your target band faster and more
                    effectively. Whether you are aiming for IELTS Academic or General
                    Training, we’ve got you covered.
                </p>
                <img
                    src="/assets/intro1.png"
                    alt="IELTS Books"
                    className="intro-image-left"
                />
            </div>

            <div className="intro-right">
                <img
                    src="/assets/intro2.png"
                    alt="Study Room"
                    className="intro-image-right"
                />
                <div className="intro-detail">
                    <h2 className="intro-detail-title">Discover Your Personalized Plan</h2>
                    <p className="intro-detail-text">
                    We analyze your current level, strengths, and weaknesses to create
                    a customized roadmap that guides you step-by-step until you reach
                    your goal.
                    </p>
                    <ul className="intro-points">
                    <li>📌 Tailored Study Schedule</li>
                    <li>📌 Mock Tests with Instant Feedback</li>
                    <li>📌 Progress Tracking & Analytics</li>
                    </ul>
                </div>
            </div>
        </section>



        {/* Roadmap / Learning Journey Section */}
        <section className="roadmap-intro">
            <h2 className="roadmap-intro-title">IELTS Learning Journey</h2>
            <p className="roadmap-intro-subtitle">
                Follow a clear and guided path to boost your IELTS score step by step.
            </p>

            <div className="roadmap-steps">
                <div className="roadmap-step">
                    <img src="/assets/assessmentIcon.png" alt="Assessment" className="roadmap-icon" />
                    <h3 className="roadmap-step-title">Step 1: Assessment</h3>
                    <p className="roadmap-step-text">
                        Take a quick placement test to find out your current IELTS level.
                    </p>
                </div>

                <div className="roadmap-step">
                    <img src="/assets/personalizedPlan.png" alt="Personalized Plan" className="roadmap-icon" />
                    <h3 className="roadmap-step-title">Step 2: Personalized Plan</h3>
                    <p className="roadmap-step-text">
                        Receive a customized study roadmap that suits your timeline & goals.
                    </p>
                </div>

                <div className="roadmap-step">
                    <img src="/assets/practiceAndLearn.png" alt="Practice" className="roadmap-icon" />
                    <h3 className="roadmap-step-title">Step 3: Practice & Learn</h3>
                    <p className="roadmap-step-text">
                        Practice with mock tests, lessons, and feedback from IELTS experts.
                    </p>
                </div>

                <div className="roadmap-step">
                    <img src="/assets/goal.png" alt="Achieve Goal" className="roadmap-icon" />
                    <h3 className="roadmap-step-title">Step 4: Achieve Your Goal</h3>
                    <p className="roadmap-step-text">
                        Reach your target band score and feel confident for the real test.
                    </p>
                </div>
            </div>
        </section>

      {/* Suggested Exercises */}
      <section className="suggested-exercises">
        <div className="exercise-header">
          <h2 className="section-title">Suggested Exercises & Mock Tests</h2>

          <div className="exercise-filters">
            <select onChange={(e) => setSkillFilter(e.target.value)}>
              <option value="All">Skill</option>
              <option value="L">Listening</option>
              <option value="R">Reading</option>
              <option value="W">Writing</option>
              <option value="S">Speaking</option>
            </select>

            <select onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="All">Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select onChange={(e) => setDurationFilter(e.target.value)}>
              <option value="All">Duration</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading exercises...</p>
        ) : (
          <div className="exercise-grid">
            {currentExercises.map((item) => (
              <div
                key={item.id}
                className="exercise-card"
                onClick={() => navigate(`/${item.type.toLowerCase()}/${item.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src="/assets/listpic.jpg"
                  alt="Exercise"
                  className="exercise-image"
                />
                <h3>{item.title}</h3>
                <p>
                  <strong>Skill:</strong> {item.type}
                </p>
                <p>
                  <strong>Difficulty:</strong> {item.difficulty}
                </p>
                <p>
                  <strong>Duration:</strong> {item.duration} mins
                </p>
                <button className="start-btn">Start</button>
              </div>
            ))}
            {currentExercises.length === 0 && <p>No exercises found.</p>}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="nav-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="page-info">
              Page {currentPage} / {totalPages}
            </span>
            <button
              className="nav-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Video Call Section */}
        <section className="video-call-section">
            <div className="video-call-left">
                <img
                src="/assets/videoCall1.png"
                alt="Video Call with Teacher"
                className="video-call-image"
                />
            </div>

            <div className="video-call-right">
                <h2 className="video-call-title">
                    Book a <span className="highlight">1-on-1 Video Class</span> <br /> with IELTS Experts
                </h2>
                <p className="video-call-text">
                    Get personalized guidance from certified IELTS teachers. 
                    Practice speaking, receive instant feedback, and accelerate your progress 
                    with interactive video call sessions.
                </p>

                <ul className="video-call-points">
                    <li>
                        <img src="/assets/video.png" alt="Video Call" className="point-icon" />
                        Real-time speaking practice
                    </li>
                    <li>
                        <img src="/assets/schedule.png" alt="Calendar" className="point-icon" />
                        Flexible scheduling options
                    </li>
                    <li>
                        <img src="/assets/star.png" alt="Expert Feedback" className="point-icon" />
                        Expert feedback & tips
                    </li>
                </ul>


                <button className="book-btn">Book a Session</button>
            </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
            <h2 className="services-title">Our Services</h2>
            <div className="services-grid">
                {services.map((service, idx) => (
                    <div className="service-card" key={idx}>
                        <div className="service-icon">
                            <img src={service.icon} alt={service.title} />
                        </div>
                        <div className="service-content">
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-desc">{service.desc}</p>
                        </div>
                    </div>
                  
                  
                ))}
            </div>
        </section>
    </>
  );
};

export default HomePage;
