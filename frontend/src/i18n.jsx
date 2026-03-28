import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  // App title
  app_title: { en: "हाम्रो विद्यार्थी", np: "हाम्रो विद्यार्थी" },
  app_subtitle: { en: "Keeping student wellbeing first", np: "विद्यार्थीको भलाइ सर्वोपरि" },

  // Roles
  role_student: { en: "Student", np: "विद्यार्थी" },
  role_teacher: { en: "Teacher", np: "शिक्षक" },
  role_counselor: { en: "Counselor", np: "परामर्शदाता" },
  role_student_desc: { en: "Daily check-ins and creative tasks with your buddy", np: "दैनिक चेक-इन र साथीसँग रचनात्मक कार्य" },
  role_teacher_desc: { en: "Log behavioral observations for your students", np: "विद्यार्थीको व्यवहार अवलोकन गर्नुहोस्" },
  role_counselor_desc: { en: "Monitor wellbeing, risks, and manage interventions", np: "भलाइ, जोखिम र हस्तक्षेप व्यवस्थापन" },

  // Navigation
  nav_checkin: { en: "Check In", np: "चेक इन" },
  nav_creative: { en: "Creative Task", np: "रचनात्मक कार्य" },
  nav_observe: { en: "Log Observation", np: "अवलोकन" },
  nav_dashboard: { en: "Dashboard", np: "ड्यासबोर्ड" },
  nav_class_trends: { en: "Class Trends", np: "कक्षा प्रवृत्ति" },
  nav_switch_role: { en: "Switch role", np: "भूमिका बदल्नुहोस्" },

  // Dashboard
  dash_title: { en: "Dashboard", np: "ड्यासबोर्ड" },
  dash_subtitle: { en: "Overview of student wellbeing", np: "विद्यार्थी भलाइको सिंहावलोकन" },
  dash_total: { en: "Total Students", np: "जम्मा विद्यार्थी" },
  dash_attention: { en: "Needs Attention", np: "ध्यान आवश्यक" },
  dash_high_risk: { en: "High Risk", np: "उच्च जोखिम" },
  dash_healthy: { en: "Healthy", np: "स्वस्थ" },
  dash_watchlist: { en: "Watchlist", np: "निगरानी सूची" },
  dash_all_students: { en: "All Students", np: "सबै विद्यार्थी" },
  dash_search: { en: "Search...", np: "खोज्नुहोस्..." },

  // Table headers
  th_name: { en: "Name", np: "नाम" },
  th_class: { en: "Class", np: "कक्षा" },
  th_last_mood: { en: "Last Mood", np: "अन्तिम मुड" },
  th_risk: { en: "Risk", np: "जोखिम" },
  th_last_checkin: { en: "Last Check-in", np: "अन्तिम चेक-इन" },

  // Check-in
  checkin_mood_title: { en: "How are you feeling today?", np: "आज तिमीलाई कस्तो लाग्छ?" },
  checkin_mood_subtitle: { en: "There are no wrong answers", np: "कुनै गलत उत्तर छैन" },
  checkin_energy_title: { en: "How is your energy?", np: "तिम्रो ऊर्जा कस्तो छ?" },
  checkin_energy_subtitle: { en: "Think about how you feel right now", np: "अहिले कस्तो महसुस भइरहेको छ सोच" },
  checkin_note_title: { en: "Anything you want to share?", np: "केही भन्न चाहन्छौ?" },
  checkin_note_subtitle: { en: "Completely optional — write in any language", np: "ऐच्छिक — जुनसुकै भाषामा लेख्नुहोस्" },
  checkin_submit: { en: "Submit check-in", np: "चेक-इन पेश गर्नुहोस्" },
  checkin_thanks: { en: "Thanks for checking in", np: "चेक-इन गरेकोमा धन्यवाद" },
  checkin_recorded: { en: "Your response has been recorded", np: "तिम्रो उत्तर रेकर्ड गरियो" },
  checkin_again: { en: "Check in again", np: "फेरि चेक-इन गर्नुहोस्" },

  // Moods
  mood_1: { en: "Struggling", np: "गाह्रो भइरहेको छ" },
  mood_2: { en: "Not great", np: "ठीक छैन" },
  mood_3: { en: "Okay", np: "ठिकै छ" },
  mood_4: { en: "Good", np: "राम्रो छ" },
  mood_5: { en: "Great", np: "एकदमै राम्रो" },

  // Energy
  energy_low: { en: "Low", np: "कम" },
  energy_medium: { en: "Medium", np: "मध्यम" },
  energy_high: { en: "High", np: "उच्च" },

  // Observation
  obs_title: { en: "Log Observation", np: "अवलोकन लेख्नुहोस्" },
  obs_subtitle: { en: "Record behavioral observations for a student", np: "विद्यार्थीको व्यवहार अवलोकन रेकर्ड गर्नुहोस्" },
  obs_teacher_label: { en: "Your name / subject", np: "तपाईंको नाम / विषय" },
  obs_student_label: { en: "Student", np: "विद्यार्थी" },
  obs_select_student: { en: "Select a student", np: "विद्यार्थी छान्नुहोस्" },
  obs_what_noticed: { en: "What did you notice?", np: "के देख्नुभयो?" },
  obs_notes_label: { en: "Additional notes", np: "थप टिप्पणी" },
  obs_notes_optional: { en: "(optional)", np: "(ऐच्छिक)" },
  obs_notes_placeholder: { en: "Any context that might help the counselor...", np: "परामर्शदातालाई सहयोग हुने कुनै सन्दर्भ..." },
  obs_submit: { en: "Submit observation", np: "अवलोकन पेश गर्नुहोस्" },
  obs_recorded: { en: "Observation recorded", np: "अवलोकन रेकर्ड भयो" },
  obs_thanks: { en: "Thank you for looking out for your students", np: "विद्यार्थीहरूको हेरचाह गरेकोमा धन्यवाद" },
  obs_another: { en: "Log another observation", np: "अर्को अवलोकन लेख्नुहोस्" },

  // Student Profile
  profile_back: { en: "Back to dashboard", np: "ड्यासबोर्डमा फर्कनुहोस्" },
  profile_run_ai: { en: "Run AI Analysis", np: "AI विश्लेषण चलाउनुहोस्" },
  profile_analyzing: { en: "Analyzing...", np: "विश्लेषण गर्दै..." },
  profile_avg_mood: { en: "Recent Avg. Mood", np: "हालको औसत मुड" },
  profile_trend: { en: "Trend", np: "प्रवृत्ति" },
  profile_checkins_14d: { en: "Check-ins (14d)", np: "चेक-इन (१४ दिन)" },
  profile_mood_history: { en: "Mood History", np: "मुड इतिहास" },
  profile_ai_assessment: { en: "AI Risk Assessment", np: "AI जोखिम मूल्याङ्कन" },
  profile_ai_unavailable: { en: "AI analysis unavailable — showing rule-based assessment", np: "AI विश्लेषण उपलब्ध छैन — नियम-आधारित मूल्याङ्कन देखाउँदै" },
  profile_concerns: { en: "Concerns", np: "चिन्ताहरू" },
  profile_recommended: { en: "Recommended Action", np: "सिफारिस गरिएको कदम" },
  profile_reasoning: { en: "Reasoning", np: "तर्क" },
  profile_starters: { en: "Conversation Starters", np: "कुराकानी सुरु गर्ने" },
  profile_generate: { en: "Generate", np: "बनाउनुहोस्" },
  profile_generating: { en: "Generating...", np: "बनाउँदै..." },
  profile_starters_hint: { en: "Click Generate to get AI-powered conversation openers for this student.", np: "यो विद्यार्थीको लागि AI कुराकानी सुरुवातकर्ता प्राप्त गर्न बनाउनुहोस् क्लिक गर्नुहोस्।" },
  profile_recent_checkins: { en: "Recent Check-ins", np: "हालका चेक-इनहरू" },
  profile_observations: { en: "Teacher Observations", np: "शिक्षक अवलोकन" },
  profile_interventions: { en: "Interventions", np: "हस्तक्षेपहरू" },

  // Trend
  trend_declining: { en: "Declining", np: "घट्दो" },
  trend_improving: { en: "Improving", np: "बढ्दो" },
  trend_stable: { en: "Stable", np: "स्थिर" },

  // Creative Task
  creative_title: { en: "Creative Task", np: "रचनात्मक कार्य" },
  creative_subtitle: { en: "A fun activity for you and your buddy to do together", np: "तिमी र तिम्रो साथीले मिलेर गर्ने रमाइलो गतिविधि" },
  creative_this_week: { en: "This week's activity", np: "यो हप्ताको गतिविधि" },
  creative_new_task: { en: "New task", np: "नयाँ कार्य" },
  creative_get_task: { en: "Get our task", np: "हाम्रो कार्य पाउनुहोस्" },
  creative_youll_need: { en: "You'll need", np: "तिमीलाई चाहिन्छ" },
  creative_bonus: { en: "Bonus challenge", np: "बोनस चुनौती" },
  creative_your_interests: { en: "Your interests", np: "तिम्रो रुचिहरू" },
  creative_ready: { en: "Ready to get creative", np: "रचनात्मक हुन तयार" },
  creative_pick_activity: { en: "We'll pick an activity based on both your interests", np: "दुवैको रुचि अनुसार गतिविधि छान्नेछौं" },

  // Class Trends
  trends_title: { en: "Class Trends", np: "कक्षा प्रवृत्ति" },
  trends_subtitle: { en: "Mood and wellbeing trends by class", np: "कक्षा अनुसार मुड र भलाइ प्रवृत्ति" },
  trends_avg_mood: { en: "Avg Mood", np: "औसत मुड" },
  trends_students: { en: "Students", np: "विद्यार्थी" },
  trends_checkins: { en: "Check-ins", np: "चेक-इनहरू" },
  trends_no_data: { en: "No data", np: "डाटा छैन" },

  // Crisis
  crisis_alert: { en: "Crisis Alert", np: "संकट चेतावनी" },
  crisis_banner: { en: "students need immediate attention", np: "विद्यार्थीलाई तत्काल ध्यान चाहिन्छ" },
  crisis_helpline: { en: "Contact helpline 1166 or take to nearest health post", np: "हेल्पलाइन ११६६ मा सम्पर्क गर्नुहोस् वा नजिकको स्वास्थ्य चौकीमा लैजानुहोस्" },
  crisis_view: { en: "View Details", np: "विवरण हेर्नुहोस्" },
  crisis_dismiss: { en: "Acknowledge", np: "स्वीकार गर्नुहोस्" },

  // General
  loading: { en: "Loading...", np: "लोड हुँदैछ..." },
  never: { en: "Never", np: "कहिल्यै नभएको" },
  submitting: { en: "Submitting...", np: "पेश गर्दै..." },
  back: { en: "Back", np: "पछाडि" },
  who_are_you: { en: "Who are you?", np: "तिमी को हौ?" },
  select_name: { en: "Select your name to continue", np: "जारी राख्न आफ्नो नाम छान्नुहोस्" },

  // Risk levels
  risk_low: { en: "low", np: "कम" },
  risk_moderate: { en: "moderate", np: "मध्यम" },
  risk_high: { en: "high", np: "उच्च" },
  risk_crisis: { en: "crisis", np: "संकट" },

  // Observation tags
  tag_grade_drop: { en: "Grade drop", np: "ग्रेड घट्यो" },
  tag_distracted: { en: "Distracted", np: "विचलित" },
  tag_withdrawn: { en: "Withdrawn", np: "अलग बसेको" },
  tag_absent: { en: "Absent", np: "अनुपस्थित" },
  tag_aggressive: { en: "Aggressive", np: "आक्रामक" },
  tag_tearful: { en: "Tearful", np: "रोएको" },
  tag_isolated: { en: "Isolated", np: "एक्लो" },
  tag_disruptive: { en: "Disruptive", np: "अवरोधकारी" },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  function t(key) {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
