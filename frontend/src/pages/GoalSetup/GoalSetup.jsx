import React, { useState, useEffect } from "react";
import "./GoalSetup.css";

const BAND_OPTIONS = ["4.5","5.0","5.5","6.0","6.5","7.0","7.5","8.0","8.5","9.0"];
const SKILLS = ["Listening","Reading","Writing","Speaking"];

const readSaved = () => {
  try {
    const raw = localStorage.getItem("userGoal");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const GoalSetup = () => {
  const saved = readSaved();

  const [name, setName] = useState(saved?.name || "");
  const [email, setEmail] = useState(saved?.email || "");
  const [targetBand, setTargetBand] = useState(saved?.targetBand || "6.5");
  const [targetDate, setTargetDate] = useState(saved?.targetDate || "");
  const [prioritySkills, setPrioritySkills] = useState(saved?.prioritySkills || ["Speaking"]);
  const [notes, setNotes] = useState(saved?.notes || "");
  const [savedAt, setSavedAt] = useState(saved?.savedAt || null);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      console.log("Logged-in user:", storedUser);
      setName(storedUser.userName || "");
      setEmail(storedUser.email || "");
      setUserId(storedUser.id || "");
    } else {
      console.warn("No user found in localStorage");
    }
  }, []);

  const toggleSkill = (skill) => {
    setPrioritySkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const validateEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setMessage("Please enter your name.");
    if (!validateEmail(email)) return setMessage("Please enter a valid email.");
    if (!targetDate) return setMessage("Please choose a target date.");

    const payload = {
      user_id: userId,
      name: name.trim(),
      email: email.trim(),
      target_band: targetBand,
      target_date: targetDate,
      priority_skills: prioritySkills.join(","),
      notes,
    };

    try {
      const res = await fetch("http://localhost:3002/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save goal");

      const data = await res.json();
      localStorage.setItem("userGoal", JSON.stringify(data));
      setSavedAt(data.saved_at || new Date().toISOString());
      setMessage("Your goal has been saved successfully!");
    } catch (error) {
      console.error("Error saving goal:", error);
      setMessage("Failed to save goal. Please try again later.");
    }
  };



  const clearSaved = () => {
    localStorage.removeItem("userGoal");
    setName(""); setEmail(""); setTargetBand("6.5"); setTargetDate("");
    setPrioritySkills(["Speaking"]); setNotes(""); setSavedAt(null);
    setMessage("Cleared saved goal.");
  };

  const daysUntil = () => {
    if (!targetDate) return null;
    const now = new Date();
    const t = new Date(targetDate);
    const diff = Math.ceil((t - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  };

  const progressSuggestion = () => {
    const days = daysUntil();
    if (days === null) return "Set a target date to get personalized plan.";
    if (days < 14) return "Short-term: intensive weekly speaking practice, daily 20–30 minutes.";
    if (days < 60) return "Medium-term: weekly 1:1 sessions + 3 practice lessons per week.";
    return "Long-term: consistent weekly lessons, monthly mock tests and progressive targets.";
  };

  return (
    <div className="goalsetup-root">
      <section className="goalsetup-intro" aria-labelledby="goalsetup-title">
        <div className="goalsetup-left">
          <div className="goalsetup-subtitle">Personalized Learning</div>
          <h2 id="goalsetup-title" className="goalsetup-title">Set your IELTS Goal</h2>
          <p className="goalsetup-text">
            Tell us your target band, deadline and which skills you want to prioritize.
            We'll create a focused roadmap and suggest exercises tailored for your success.
          </p>

          <div className="goalsetup-info">
            <h3 className="goalsetup-info-title">Why set a goal?</h3>
            <p className="goalsetup-info-text">
              A clear target helps create a personalized plan, recommend speaking partners, and suggest focused lessons.
            </p>
            <ul className="goalsetup-points">
              <li>Personalized study path</li>
              <li>Recommended speaking drills</li>
              <li>Progress tracking & reminders</li>
            </ul>
          </div>

            <div className="goalsetup-image-container">
                <img
                src="/assets/ieltsgoal.png"
                alt="IELTS Goal Illustration"
                className="goalsetup-image"
                />
            </div>
        </div>

        <div className="goalsetup-right">
          <form className="goalsetup-form" onSubmit={handleSubmit} aria-label="Goal setup form">
            <h3 style={{marginTop: 0, color: "#fe5d01"}}>Your profile & goal</h3>

            <label>
              <div className="goalsetup-label">Full name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Nguyen"
                required
              />
            </label>

            <label>
              <div className="goalsetup-label">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <div className="goalsetup-label">Target band</div>
              <select value={targetBand} onChange={(e) => setTargetBand(e.target.value)}>
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>

            <label>
              <div className="goalsetup-label">Target date</div>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </label>

            <label>
              <div className="goalsetup-label">Priority skills</div>
              <div className="goalsetup-checkboxes">
                {SKILLS.map((s) => (
                  <label key={s} className="goalsetup-checkbox-item">
                    <input
                      type="checkbox"
                      checked={prioritySkills.includes(s)}
                      onChange={() => toggleSkill(s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </label>

            <label>
              <div className="goalsetup-label">Notes / Special requests</div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. prefer evening lessons, need pronunciation focus..."
              />
            </label>

            <div className="goalsetup-buttons">
              <button type="submit" className="goalsetup-save-btn">Save my goal</button>
              <button type="button" onClick={clearSaved} className="goalsetup-clear-btn">Clear</button>
            </div>

            {message && <p className="goalsetup-message">{message}</p>}
          </form>

          <aside className="goalsetup-summary">
            <h4 className="goalsetup-info-title">Goal summary</h4>
            {savedAt || name || email ? (
              <div>
                <p><strong>Name:</strong> {name || "—"}</p>
                <p><strong>Email:</strong> {email || "—"}</p>
                <p><strong>Target band:</strong> {targetBand}</p>
                <p><strong>Target date:</strong> {targetDate || "—"}</p>
                <p><strong>Days left:</strong> {daysUntil() !== null ? `${daysUntil()} days` : "—"}</p>
                <p><strong>Priority:</strong> {prioritySkills.join(", ")}</p>
                <p className="goalsetup-suggestion">{progressSuggestion()}</p>
              </div>
            ) : (
              <p>No goal saved yet. Fill the form to create your personalized plan.</p>
            )}
          </aside>
        </div>
      </section>

      {/* Level Check Section */}
      <section className="goalsetup-levelcheck">
        <div className="goalsetup-levelcheck-content">
          <img
            src="/assets/placementtest.png"
            alt="Placement Test"
            className="goalsetup-levelcheck-img"
          />
          <div className="goalsetup-levelcheck-text">
            <h2>✨ Know your current level</h2>
            <p>
              Want to find out your current English proficiency and estimated IELTS band score?
              Take our quick placement test now and get instant feedback!
            </p>
            <button
              className="goalsetup-levelcheck-btn"
              onClick={() => (window.location.href = "/placement_test")}
            >
              Take your placement test
            </button>
          </div>
        </div>
      </section>


      <section className="goalsetup-roadmap">
        <h2 className="goalsetup-roadmap-title">🎯 Suggested Roadmap</h2>
        <p className="goalsetup-roadmap-subtitle">
          A personalized step-by-step guide designed to help you achieve your dream IELTS band with confidence.
        </p>

        <div className="goalsetup-roadmap-steps">
          <div className="goalsetup-roadmap-step">
            <img
              src="/assets/assessmentIcon.png"
              alt="Start"
              className="goalsetup-roadmap-icon"
            />
            <h3 className="goalsetup-roadmap-step-title">Step 1: Diagnostic Test</h3>
            <p className="goalsetup-roadmap-step-text">
              Begin with a short diagnostic test to understand your current strengths and weaknesses across all four skills.
            </p>
          </div>

          <div className="goalsetup-roadmap-step">
            <img
              src="/assets/personalizedPlan.png"
              alt="Plan"
              className="goalsetup-roadmap-icon"
            />
            <h3 className="goalsetup-roadmap-step-title">Step 2: Smart Study Plan</h3>
            <p className="goalsetup-roadmap-step-text">
              Get a weekly plan tailored to your target band, focusing on your priority skills and available study time.
            </p>
          </div>

          <div className="goalsetup-roadmap-step">
            <img
              src="/assets/practiceAndLearn.png"
              alt="Practice"
              className="goalsetup-roadmap-icon"
            />
            <h3 className="goalsetup-roadmap-step-title">Step 3: Practice & Feedback</h3>
            <p className="goalsetup-roadmap-step-text">
              Engage in interactive exercises, receive instant AI feedback, and improve through realistic speaking sessions.
            </p>
          </div>

          <div className="goalsetup-roadmap-step">
            <img
              src="/assets/goal.png"
              alt="Track Progress"
              className="goalsetup-roadmap-icon"
            />
            <h3 className="goalsetup-roadmap-step-title">Step 4: Progress Review</h3>
            <p className="goalsetup-roadmap-step-text">
              Track your improvement through monthly mock tests and adjust your strategy for maximum score gain.
            </p>
          </div>
        </div>
      </section>

      {/* Suggested Exercises Section */}
      <SuggestedExercisesGoal />
    </div>
  );
};

// Suggested Exercises Component
const SuggestedExercisesGoal = () => {
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

  const [skillFilter, setSkillFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 4;

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
    <section className="goal-exercises">
      <div className="goal-exercises-header">
        <h2 className="goal-exercises-title">Suggested Exercises & Mock Tests</h2>
        <div className="goal-exercises-filters">
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

      <div className="goal-exercises-grid">
        {currentExercises.map((item) => (
          <div key={item.id} className="goal-exercise-card">
            <img src="/assets/listpic.jpg" alt="Exercise" className="goal-exercise-image" />
            <h3>{item.title}</h3>
            <p><strong>Skill:</strong> {item.skill}</p>
            <p><strong>Difficulty:</strong> {item.difficulty}</p>
            <p><strong>Duration:</strong> {item.duration} mins</p>
            <button className="goal-exercise-start-btn">Start</button>
          </div>
        ))}
        {currentExercises.length === 0 && <p>No exercises found.</p>}
      </div>

      {totalPages > 1 && (
        <div className="goal-exercises-pagination">
          <button
            className="goal-exercises-nav-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="goal-exercises-page-info">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="goal-exercises-nav-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default GoalSetup;