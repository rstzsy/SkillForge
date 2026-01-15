import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const aiRoadmapGeminiService = {
  async generateRoadmap({ userName, currentBand, targetBand, targetDate, prioritySkills }) {
    // Tính số ngày còn lại
    const today = new Date();
    const deadline = new Date(targetDate);
    const daysAvailable = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    // Tính band improvement cần thiết
    const bandGap = parseFloat(targetBand) - parseFloat(currentBand);

    const model = "gemini-2.0-flash";
    const prompt = `
You are an expert IELTS learning planner AI with deep knowledge of IELTS scoring and realistic preparation timelines.

**Student Information:**
- Name: ${userName}
- Current Band: ${currentBand}
- Target Band: ${targetBand}
- Days Available: ${daysAvailable} days
- Band Improvement Needed: ${bandGap} bands
- Priority Skills: ${prioritySkills.join(", ")}

**Important Context:**
- Improving 0.5 band typically requires 100-200 hours of focused study (roughly 2-4 months with 2h/day)
- Improving 1.0 band typically requires 200-400 hours (roughly 4-6 months with 2h/day)
- Improving 1.5 bands typically requires 400-600 hours (roughly 7-10 months with 2h/day)
- Improving 2.0+ bands typically requires 600-800+ hours (roughly 10-14 months with 2h/day)
- Progress is slower at higher bands (7.0+) - add 30-50% more time
- Sustainable study: 2-3 hours/day is realistic, 4+ hours/day is very intensive

**Your Task:**
1. Calculate required study hours per day: (band_gap × 200) / days_available
2. Evaluate feasibility based on study intensity:
   - <1.5h/day: Very comfortable (score 10)
   - 1.5-2h/day: Comfortable (score 9)
   - 2-2.5h/day: Reasonable (score 8)
   - 2.5-3h/day: Ambitious (score 6)
   - 3-4h/day: Very challenging (score 5, set is_realistic=false)
   - 4-5h/day: Extremely difficult (score 3, set is_realistic=false)
   - >5h/day: Nearly impossible (score 1, set is_realistic=false)
3. If unrealistic (score <6), provide clear warning and alternatives
4. Create a personalized 4-step roadmap

**Response Format (JSON only, no markdown):**
{
  "is_realistic": true/false,
  "feasibility_score": 1-10,
  "warning_message": "If unrealistic, explain required study hours and suggest alternatives. If realistic, leave empty string.",
  "summary": "Short overview of the student's plan (one sentence)",
  "recommended_target_band": "If unrealistic, suggest a more achievable target band",
  "recommended_timeline": "If unrealistic, suggest realistic timeline in months",
  "study_hours_per_day": "X.X",
  "months_needed": "X.X",
  "steps": [
    {
      "step_order": 1,
      "title": "Clear, motivating title",
      "description": "Concise description, 25-35 words, one sentence only",
      "estimated_duration_days": number
    },
    // ... 3 more steps
  ]
}

**Examples of UNREALISTIC goals (>3h/day required):**
- Current 5.0 → Target 7.5 in 60 days (2.5 bands = 500h ÷ 60 days = 8.3h/day) ❌
- Current 6.0 → Target 8.0 in 90 days (2.0 bands = 400h ÷ 90 days = 4.4h/day) ❌
- Current 4.5 → Target 7.0 in 120 days (2.5 bands = 500h ÷ 120 days = 4.2h/day) ❌

**Examples of REALISTIC goals (<3h/day required):**
- Current 6.0 → Target 6.5 in 90 days (0.5 bands = 100h ÷ 90 days = 1.1h/day) ✅
- Current 5.5 → Target 6.5 in 180 days (1.0 bands = 200h ÷ 180 days = 1.1h/day) ✅
- Current 2.8 → Target 4.5 in 183 days (1.7 bands = 340h ÷ 183 days = 1.9h/day) ✅

**Critical Rules:**
- Be mathematically precise with study hours calculation
- Set is_realistic=false if >3h/day is required
- Provide concrete alternatives: lower target OR longer timeline
- Always include study_hours_per_day and months_needed in response
    `;

    try {
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      let rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      // Làm sạch markdown
      rawText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const parsed = JSON.parse(rawText);
      
      // ✅ Thêm validation để đảm bảo consistency
      const validation = this.validateGoalFeasibility(currentBand, targetBand, daysAvailable);
      
      // Thêm thông tin bổ sung
      parsed.days_available = daysAvailable;
      parsed.band_gap = bandGap;
      parsed.study_hours_per_day = validation.studyHoursPerDay;
      parsed.months_needed = validation.monthsNeeded;
      
      // ✅ Đảm bảo fallback nếu Gemini không trả về đầy đủ hoặc sai
      if (parsed.is_realistic === undefined || parsed.feasibility_score === undefined) {
        parsed.is_realistic = validation.realistic;
        parsed.feasibility_score = validation.score;
        parsed.warning_message = validation.warning;
        parsed.recommended_target_band = validation.suggestedTarget;
        parsed.recommended_timeline = validation.suggestedTimeline;
      }
      
      // ✅ Double-check: Nếu validation logic khác với Gemini, ưu tiên validation logic
      if (validation.realistic !== parsed.is_realistic) {
        console.warn("⚠️ Gemini và validation logic không đồng bộ, ưu tiên validation logic");
        parsed.is_realistic = validation.realistic;
        parsed.feasibility_score = validation.score;
        parsed.warning_message = validation.warning;
        parsed.recommended_target_band = validation.suggestedTarget;
        parsed.recommended_timeline = validation.suggestedTimeline;
      }
      
      return parsed;
    } catch (error) {
      console.error("⚠️ Gemini API error:", error);
      
      // Fallback validation logic
      const validation = this.validateGoalFeasibility(currentBand, targetBand, daysAvailable);
      
      return {
        is_realistic: validation.realistic,
        feasibility_score: validation.score,
        warning_message: validation.warning,
        recommended_target_band: validation.suggestedTarget,
        recommended_timeline: validation.suggestedTimeline,
        study_hours_per_day: validation.studyHoursPerDay,
        months_needed: validation.monthsNeeded,
        summary: validation.realistic 
          ? `Achievable goal requiring approximately ${validation.studyHoursPerDay} hours of daily study.`
          : "This goal may be too ambitious for your timeline. Please review alternatives.",
        days_available: daysAvailable,
        band_gap: bandGap,
        steps: [
          {
            step_order: 1,
            title: "Diagnostic Test & Goal Setup",
            description: "Take a comprehensive IELTS diagnostic test to identify your current strengths and weaknesses across all four skills.",
            estimated_duration_days: Math.max(7, Math.floor(daysAvailable * 0.05)),
          },
          {
            step_order: 2,
            title: "Targeted Skill Development",
            description: "Focus intensively on your priority skills through structured daily practice, exercises, and personalized feedback sessions.",
            estimated_duration_days: Math.floor(daysAvailable * 0.35),
          },
          {
            step_order: 3,
            title: "Mock Tests & Performance Analysis",
            description: "Take regular full-length mock tests under timed conditions and analyze your performance to refine strategies.",
            estimated_duration_days: Math.floor(daysAvailable * 0.40),
          },
          {
            step_order: 4,
            title: "Final Review & Test Preparation",
            description: "Polish exam techniques, review weak areas, practice time management, and build confidence for your test day.",
            estimated_duration_days: Math.floor(daysAvailable * 0.20),
          },
        ],
      };
    }
  },

  // ✅ Helper function để validate feasibility với logic chính xác
  validateGoalFeasibility(currentBand, targetBand, daysAvailable) {
    const bandGap = parseFloat(targetBand) - parseFloat(currentBand);
    const monthsAvailable = daysAvailable / 30;
    const current = parseFloat(currentBand);
    
    // Điều chỉnh hệ số khó dựa trên level hiện tại
    let difficultyMultiplier = 1.0;
    if (current >= 7.0) difficultyMultiplier = 1.5;      // Advanced: +50% time
    else if (current >= 6.0) difficultyMultiplier = 1.3; // Upper-intermediate: +30% time
    else if (current >= 5.0) difficultyMultiplier = 1.2; // Intermediate: +20% time
    else difficultyMultiplier = 1.0;                      // Foundation: normal time
    
    // Tính thời gian cần thiết thực tế (tháng)
    const monthsNeeded = (bandGap * 4) * difficultyMultiplier;
    
    // Tính study intensity cần thiết (giờ/ngày)
    const hoursNeeded = bandGap * 200 * difficultyMultiplier; // Adjusted for difficulty
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
      suggestedTarget: realistic ? targetBand : suggestedTarget,
      suggestedTimeline,
      studyHoursPerDay: studyHoursPerDay.toFixed(1),
      monthsNeeded: monthsNeeded.toFixed(1)
    };
  }
};