import React, { useState } from "react";
import { Link } from "react-router-dom";
import SliderComponent from "../../component/SliderComponent/SliderComponent";
import "./HomePage.css";

const sliderImages = [
  "/assets/slider1.png",
  "/assets/slider2.png",
  "/assets/slider3.png",
  "/assets/slider4.png",
  "/assets/slider5.png",
];

const exercises = [
  { id: 1, title: "Listening Part 3 – Multiple Choice", skill: "L", difficulty: "Medium", duration: 30 },
  { id: 2, title: "Reading Passage 2 – True/False/Not Given", skill: "R", difficulty: "Hard", duration: 60 },
  { id: 3, title: "Writing Task 1 – Bar Chart", skill: "W", difficulty: "Easy", duration: 30 },
  { id: 4, title: "Speaking Part 2 – Cue Card Practice", skill: "S", difficulty: "Medium", duration: 15 },
  { id: 5, title: "Listening Part 4 – Note Completion", skill: "L", difficulty: "Hard", duration: 30 },
  { id: 6, title: "Reading Passage 3 – Matching Headings", skill: "R", difficulty: "Medium", duration: 45 },
  { id: 7, title: "Writing Task 2 – Opinion Essay", skill: "W", difficulty: "Hard", duration: 40 },
  { id: 8, title: "Speaking Part 3 – Discussion", skill: "S", difficulty: "Medium", duration: 20 },
];

const ITEMS_PER_PAGE = 4;

const HomePage = () => {
  const [skillFilter, setSkillFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExercises = exercises.filter((item) => {
    return (
      (skillFilter === "All" || item.skill === skillFilter) &&
      (difficultyFilter === "All" || item.difficulty === difficultyFilter) &&
      (durationFilter === "All" || item.duration === parseInt(durationFilter))
    );
  });

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentExercises = filteredExercises.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

        {/* Grid hiển thị bài tập */}
        <div className="exercise-grid">
          {currentExercises.map((item) => (
            <div key={item.id} className="exercise-card">
              <img src="/assets/listpic.jpg" alt="Exercise" className="exercise-image" />
              <h3>{item.title}</h3>
              <p><strong>Skill:</strong> {item.skill}</p>
              <p><strong>Difficulty:</strong> {item.difficulty}</p>
              <p><strong>Duration:</strong> {item.duration} mins</p>
              <button className="start-btn">Start</button>
            </div>
          ))}
          {currentExercises.length === 0 && <p>No exercises found.</p>}
        </div>

        {/* Phân trang */}
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
    </>
  );
};

export default HomePage;
