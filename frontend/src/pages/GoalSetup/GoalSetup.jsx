import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config"; 
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
  const [currentBand, setCurrentBand] = useState("-");
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapWarning, setRoadmapWarning] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const band = localStorage.getItem("currentBand");
    if (storedUser) {
      console.log("Logged-in user:", storedUser);
      setName(storedUser.userName || "");
      setEmail(storedUser.email || "");
      setUserId(storedUser.id || "");
      if (band) setCurrentBand(band);
    } else {
      console.warn("No user found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetch(`https://skillforge-99ct.onrender.com/api/roadmaps/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched roadmap:", data);
          setRoadmap(data);
        })
        .catch((err) => console.error("Error fetching roadmap:", err));
    }
  }, [userId]);

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
    
    // Kiểm tra ngày không được trong quá khứ
    const selectedDate = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return setMessage("Target date cannot be in the past.");
    }

    const payload = {
      user_id: userId,
      name: name.trim(),
      email: email.trim(),
      target_band: targetBand,
      target_date: targetDate,
      priority_skills: prioritySkills.join(","),
      notes,
      current_band: currentBand,
    };

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save goal");

      const data = await res.json();
      localStorage.setItem("userGoal", JSON.stringify(data));
      setSavedAt(data.saved_at || new Date().toISOString());
      setMessage("Your goal has been saved successfully!");

      const goalId = data.data?.id || data.data?.goal_id || data.id || data.goal_id;
      console.log("Extracted goalId:", goalId);

      // ✅ VALIDATE Ở FRONTEND TRƯỚC KHI GỌI API
      const validation = validateGoalFeasibilityFrontend(
        parseFloat(currentBand),
        parseFloat(targetBand),
        daysUntil()
      );

      console.log("🔍 Frontend Validation:", validation);

      // ✅ NẾU MỤC TIÊU KHÔNG REALISTIC, HIỂN THỊ WARNING NGAY
      if (!validation.realistic) {
        setRoadmapWarning({
          isRealistic: false,
          message: validation.warning,
          feasibilityScore: validation.score,
          recommendedTarget: validation.suggestedTarget,
          recommendedTimeline: validation.suggestedTimeline,
          studyHoursPerDay: validation.studyHoursPerDay,
          monthsNeeded: validation.monthsNeeded
        });
        
        // ✅ VẪN GỌI API ĐỂ TẠO ROADMAP (NẾU CẦN), NHƯNG KHÔNG HIỂN THỊ
        setRoadmap(null); // Không set roadmap để không hiển thị steps
        
        console.warn("⚠️ Goal is unrealistic, showing warning instead of roadmap");
        return; // ✅ DỪNG TẠI ĐÂY, KHÔNG GỌI API ROADMAP
      }

      // ✅ NẾU REALISTIC, TIẾP TỤC GỌI API ROADMAP
      try {
        const roadmapPayload = {
          ...payload,
          goal_id: goalId,
        };

        const roadmapRes = await fetch("https://skillforge-99ct.onrender.com/api/roadmaps/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roadmapPayload),
        });

        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          
          console.log("🔍 Roadmap Data:", roadmapData);
          
          // ✅ Thêm validation data vào roadmap response
          const enrichedRoadmap = {
            ...roadmapData,
            is_realistic: validation.realistic,
            feasibility_score: validation.score,
            study_hours_per_day: validation.studyHoursPerDay,
            months_needed: validation.monthsNeeded,
            warning_message: validation.warning
          };
          
          setRoadmap(enrichedRoadmap);
          setRoadmapWarning(null); // Clear warning nếu realistic
          
          console.log("✅ Goal is realistic, roadmap generated successfully");
        } else {
          console.error("Failed to generate roadmap");
        }
      } catch (err) {
        console.error("Error generating roadmap:", err);
      }

    } catch (error) {
      console.error("Error saving goal:", error);
      setMessage("Failed to save goal. Please try again later.");
    }
  };

  // ✅ THÊM HÀM VALIDATE Ở FRONTEND (COPY TỪ BACKEND LOGIC)
  const validateGoalFeasibilityFrontend = (currentBand, targetBand, daysAvailable) => {
    const bandGap = targetBand - currentBand;
    const monthsAvailable = daysAvailable / 30;
    const current = currentBand;
    
    // Điều chỉnh hệ số khó dựa trên level hiện tại
    let difficultyMultiplier = 1.0;
    if (current >= 7.0) difficultyMultiplier = 1.5;
    else if (current >= 6.0) difficultyMultiplier = 1.3;
    else if (current >= 5.0) difficultyMultiplier = 1.2;
    else difficultyMultiplier = 1.0;
    
    // Tính thời gian cần thiết thực tế (tháng)
    const monthsNeeded = (bandGap * 4) * difficultyMultiplier;
    
    // Tính study intensity cần thiết (giờ/ngày)
    const hoursNeeded = bandGap * 200 * difficultyMultiplier;
    const studyHoursPerDay = hoursNeeded / daysAvailable;
    
    let realistic = true;
    let score = 10;
    let warning = "";
    let suggestedTarget = targetBand;
    let suggestedTimeline = "";

    // === RULE 1: Mục tiêu không hợp lệ ===
    if (bandGap <= 0) {
      realistic = false;
      score = 0;
      warning = `Your target band (${targetBand}) must be higher than your current band (${currentBand}). Please set a higher target to create a meaningful improvement plan.`;
    }
    
    // === RULE 2: Mục tiêu cực kỳ phi thực tế (>5h/ngày) ===
    else if (studyHoursPerDay > 5) {
      realistic = false;
      score = 1;
      const realisticMonths = Math.ceil(monthsNeeded);
      suggestedTarget = (current + bandGap * 0.4).toFixed(1);
      suggestedTimeline = `${realisticMonths} months`;
      warning = `This goal requires ${studyHoursPerDay.toFixed(1)} hours of intensive daily study, which is extremely difficult to maintain. We strongly recommend either targeting band ${suggestedTarget} in ${Math.round(monthsAvailable)} months, or planning ${suggestedTimeline} to reach band ${targetBand} with sustainable daily practice (2-3 hours).`;
    }
    
    // === RULE 3: Rất khó (4-5h/ngày) ===
    else if (studyHoursPerDay > 4) {
      realistic = false;
      score = 3;
      const realisticMonths = Math.ceil(monthsNeeded * 0.8);
      suggestedTarget = (current + bandGap * 0.6).toFixed(1);
      suggestedTimeline = `${realisticMonths} months`;
      warning = `This timeline requires ${studyHoursPerDay.toFixed(1)} hours of daily study - very intensive and difficult to sustain long-term. For a more balanced approach, consider targeting band ${suggestedTarget} in your current timeframe, or allow ${suggestedTimeline} to reach band ${targetBand} with 2-3 hours of daily practice.`;
    }
    
    // === RULE 4: Khó nhưng có thể (3-4h/ngày) ===
    else if (studyHoursPerDay > 3) {
      realistic = false;
      score = 5;
      const realisticMonths = Math.ceil(monthsNeeded * 0.9);
      suggestedTarget = (current + bandGap * 0.75).toFixed(1);
      suggestedTimeline = `${realisticMonths} months`;
      warning = `Achieving this goal requires approximately ${studyHoursPerDay.toFixed(1)} hours of focused daily study - challenging but possible with strong commitment and excellent discipline. For better work-life balance and sustainable progress, consider band ${suggestedTarget} in your timeframe, or extend your timeline to ${suggestedTimeline} for band ${targetBand}.`;
    }
    
    // === RULE 5: Căng thẳng (2.5-3h/ngày) ===
    else if (studyHoursPerDay > 2.5) {
      realistic = true;
      score = 6;
      warning = `This is an ambitious but achievable timeline requiring approximately ${studyHoursPerDay.toFixed(1)} hours of focused study daily. Maintain consistency with your practice schedule and prioritize your weak areas for best results!`;
    }
    
    // === RULE 6: Hợp lý (2-2.5h/ngày) ===
    else if (studyHoursPerDay >= 2) {
      realistic = true;
      score = 8;
      warning = "";
    }
    
    // === RULE 7: Thoải mái (1.5-2h/ngày) ===
    else if (studyHoursPerDay >= 1.5) {
      realistic = true;
      score = 9;
      warning = "";
    }
    
    // === RULE 8: Rất thoải mái (<1.5h/ngày) ===
    else {
      realistic = true;
      score = 10;
      warning = "";
    }

    return {
      realistic,
      score,
      warning,
      suggestedTarget: realistic ? targetBand.toFixed(1) : suggestedTarget,
      suggestedTimeline,
      studyHoursPerDay: studyHoursPerDay.toFixed(1),
      monthsNeeded: monthsNeeded.toFixed(1)
    };
  };

  const clearSaved = () => {
    localStorage.removeItem("userGoal");
    setName(""); 
    setEmail(""); 
    setTargetBand("6.5"); 
    setTargetDate("");
    setPrioritySkills(["Speaking"]); 
    setNotes(""); 
    setSavedAt(null);
    setRoadmap(null); // ✅ Clear roadmap
    setRoadmapWarning(null); // ✅ Clear warning
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
                min={new Date().toISOString().split('T')[0]}
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
                <p><strong>Current band:</strong> {currentBand}</p>
                <p><strong>Target band:</strong> {targetBand}</p>
                <p><strong>Target date:</strong> {targetDate || "—"}</p>
                <p><strong>Days left:</strong> {daysUntil() !== null ? `${daysUntil()} days` : "—"}</p>
                <p><strong>Priority:</strong> {prioritySkills.join(", ")}</p>
                
                {/* ✅ Hiển thị study intensity nếu có roadmap */}
                {roadmap && roadmap.study_hours_per_day && (
                  <p style={{ marginTop: '0.5rem', color: '#fe5d01', fontWeight: 'bold' }}>
                    📚 Required study: {roadmap.study_hours_per_day}h/day
                  </p>
                )}
                
                <p className="goalsetup-suggestion">{progressSuggestion()}</p>
              </div>
            ) : (
              <p>No goal saved yet. Fill the form to create your personalized plan.</p>
            )}
          </aside>
        </div>
      </section>

      {/* ✅ Warning Section - Chỉ hiển thị khi roadmapWarning.isRealistic === false */}
      {roadmapWarning && roadmapWarning.isRealistic === false && (
        <section className="goalsetup-warning">
          <div className="goalsetup-warning-container">
            <div className="goalsetup-warning-icon">⚠️</div>
            <div className="goalsetup-warning-content">
              <h3 className="goalsetup-warning-title">
                Goal Feasibility Alert (Score: {roadmapWarning.feasibilityScore}/10)
              </h3>
              <p className="goalsetup-warning-message">{roadmapWarning.message}</p>
              
              {/* ✅ Hiển thị study intensity */}
              {roadmapWarning.studyHoursPerDay && (
                <p style={{ marginTop: '1rem', color: '#ff5722', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  📊 This goal requires <strong>{roadmapWarning.studyHoursPerDay} hours of intensive daily study</strong>, which is extremely challenging to maintain consistently.
                </p>
              )}
              
              {roadmapWarning.recommendedTarget && (
                <div className="goalsetup-warning-suggestions">
                  <p><strong>💡 Recommended Option 1:</strong> Target band {roadmapWarning.recommendedTarget} with your current timeline ({daysUntil()} days)</p>
                  {roadmapWarning.recommendedTimeline && (
                    <p><strong>💡 Recommended Option 2:</strong> Keep band {targetBand} but extend timeline to {roadmapWarning.recommendedTimeline}</p>
                  )}
                </div>
              )}
              
              <button 
                className="goalsetup-warning-adjust-btn"
                onClick={() => {
                  if (window.confirm(`Would you like to adjust your target band to ${roadmapWarning.recommendedTarget}?`)) {
                    setTargetBand(roadmapWarning.recommendedTarget);
                    setRoadmapWarning(null);
                    // ✅ Auto-submit form sau khi adjust
                    setTimeout(() => {
                      document.querySelector('.goalsetup-save-btn').click();
                    }, 100);
                  }
                }}
              >
                Adjust My Goal to Band {roadmapWarning.recommendedTarget}
              </button>
            </div>
          </div>
        </section>
      )}

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

      {/* ✅ Roadmap Section */}
      <section className="goalsetup-roadmap">
        <h2 className="goalsetup-roadmap-title">🎯 Suggested Roadmap</h2>
        
        {roadmapWarning && roadmapWarning.isRealistic === false ? (
          // ✅ Hiển thị khi mục tiêu không thực tế
          <div className="goalsetup-roadmap-unrealistic">
            <p className="goalsetup-roadmap-subtitle" style={{ color: '#ff9800', fontWeight: 'bold', fontSize: '1.2rem' }}>
              ⚠️ Your current goal requires {roadmapWarning.studyHoursPerDay}h of daily study, which may be too intensive for most learners. Please review the warning above and adjust your goal for a more realistic and sustainable roadmap.
            </p>
            <div className="goalsetup-roadmap-unrealistic-content">
              <img src="/assets/goal.png" alt="Adjust Goal" style={{ width: '200px', opacity: 0.6 }} />
              <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '1rem' }}>
                A personalized roadmap will be generated once you set a realistic and achievable goal that fits your lifestyle.
              </p>
              <button 
                className="goalsetup-warning-adjust-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ marginTop: '1.5rem' }}
              >
                Adjust My Goal Now
              </button>
            </div>
          </div>
        ) : (
          // ✅ Hiển thị roadmap bình thường
          <>
            <p className="goalsetup-roadmap-subtitle">
              A personalized step-by-step guide designed to help you achieve your dream IELTS band with confidence.
              {roadmap && roadmap.study_hours_per_day && (
                <span style={{ color: '#fe5d01', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                  (Requires ~{roadmap.study_hours_per_day}h/day)
                </span>
              )}
            </p>

            <div className="goalsetup-roadmap-steps">
              {roadmap && roadmap.steps?.length > 0 ? (
                roadmap.steps.map((step, index) => (
                  <div key={index} className="goalsetup-roadmap-step">
                    <img
                      src={step.icon || "/assets/goal.png"}
                      alt={step.title}
                      className="goalsetup-roadmap-icon"
                    />
                    <h3 className="goalsetup-roadmap-step-title">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="goalsetup-roadmap-step-text">{step.description}</p>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Duration: ~{step.estimated_duration_days} days
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="goalsetup-roadmap-step">
                    <img src="/assets/assessmentIcon.png" alt="Start" className="goalsetup-roadmap-icon" />
                    <h3 className="goalsetup-roadmap-step-title">Step 1: Diagnostic Test</h3>
                    <p className="goalsetup-roadmap-step-text">
                      Begin with a short diagnostic test to understand your current strengths and weaknesses across all four skills.
                    </p>
                  </div>

                  <div className="goalsetup-roadmap-step">
                    <img src="/assets/personalizedPlan.png" alt="Plan" className="goalsetup-roadmap-icon" />
                    <h3 className="goalsetup-roadmap-step-title">Step 2: Smart Study Plan</h3>
                    <p className="goalsetup-roadmap-step-text">
                      Get a weekly plan tailored to your target band, focusing on your priority skills and available study time.
                    </p>
                  </div>

                  <div className="goalsetup-roadmap-step">
                    <img src="/assets/practiceAndLearn.png" alt="Practice" className="goalsetup-roadmap-icon" />
                    <h3 className="goalsetup-roadmap-step-title">Step 3: Practice & Feedback</h3>
                    <p className="goalsetup-roadmap-step-text">
                      Engage in interactive exercises, receive instant AI feedback, and improve through realistic speaking sessions.
                    </p>
                  </div>

                  <div className="goalsetup-roadmap-step">
                    <img src="/assets/goal.png" alt="Track Progress" className="goalsetup-roadmap-icon" />
                    <h3 className="goalsetup-roadmap-step-title">Step 4: Progress Review</h3>
                    <p className="goalsetup-roadmap-step-text">
                      Track your improvement through monthly mock tests and adjust your strategy for maximum score gain.
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>

      {/* 🆕 Suggested Exercises từ Firebase */}
      <SuggestedExercisesGoal prioritySkills={prioritySkills} targetBand={targetBand} />
    </div>
  );
};

// 🆕 Component gợi ý bài tập từ Firebase
const SuggestedExercisesGoal = ({ prioritySkills, targetBand }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);

        const [speakSnap, writeSnap, readSnap, listenSnap] = await Promise.all([
          getDocs(collection(db, "speaking_practices")),
          getDocs(collection(db, "writing_practices")),
          getDocs(collection(db, "reading_practices")),
          getDocs(collection(db, "listening_practices")),
        ]);

        const allExercises = [
          ...speakSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().topic || "Untitled Speaking Task",
            skill: "S",
            skillName: "Speaking",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 15,
            route: "speak",
          })),
          ...writeSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().title || "Untitled Writing Task",
            skill: "W",
            skillName: "Writing",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 30,
            route: "write",
          })),
          ...readSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().title || "Untitled Reading Task",
            skill: "R",
            skillName: "Reading",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 45,
            route: "read",
          })),
          ...listenSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().title || "Untitled Listening Task",
            skill: "L",
            skillName: "Listening",
            difficulty: d.data().difficulty || "Medium",
            duration: d.data().duration || 30,
            route: "listen",
          })),
        ];

        // 🎯 Ưu tiên bài tập theo priority skills
        const prioritized = allExercises.sort((a, b) => {
          const aIsPriority = prioritySkills.includes(a.skillName);
          const bIsPriority = prioritySkills.includes(b.skillName);
          if (aIsPriority && !bIsPriority) return -1;
          if (!aIsPriority && bIsPriority) return 1;
          return 0;
        });

        setExercises(prioritized);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [prioritySkills]);

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
        <h2 className="goal-exercises-title">📚 Personalized Exercises for You</h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Based on your priority: <strong>{prioritySkills.join(", ")}</strong>
        </p>
        <div className="goal-exercises-filters">
          <select onChange={(e) => setSkillFilter(e.target.value)}>
            <option value="All">All Skills</option>
            <option value="L">Listening</option>
            <option value="R">Reading</option>
            <option value="W">Writing</option>
            <option value="S">Speaking</option>
          </select>

          <select onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="All">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select onChange={(e) => setDurationFilter(e.target.value)}>
            <option value="All">All Duration</option>
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
        <div className="goal-exercises-grid">
          {currentExercises.map((item) => (
            <div key={item.id} className="goal-exercise-card">
              <img src="/assets/listpic.jpg" alt="Exercise" className="goal-exercise-image" />
              <h3>{item.title}</h3>
              <p><strong>Skill:</strong> {item.skillName}</p>
              <p><strong>Difficulty:</strong> {item.difficulty}</p>
              <p><strong>Duration:</strong> {item.duration} mins</p>
              <button 
                className="goal-exercise-start-btn"
                onClick={() => window.location.href = `/${item.route}/${item.id}`}
              >
                Start
              </button>
            </div>
          ))}
          {currentExercises.length === 0 && <p>No exercises found.</p>}
        </div>
      )}

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