import { createContext, useContext, useState, useEffect } from "react";

const NP_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

const translations = {
  // App title
  app_title: { en: "हाम्रो विद्यार्थी", np: "हाम्रो विद्यार्थी" },
  app_subtitle: { en: "Keeping student wellbeing first", np: "विद्यार्थीको भलाइ सर्वोपरि" },

  // Roles
  role_student: { en: "Student", np: "विद्यार्थी" },
  role_teacher: { en: "Teacher", np: "शिक्षक" },
  role_counselor: { en: "Counselor", np: "परामर्शदाता" },
  role_admin: { en: "Admin", np: "प्रशासक" },
  role_student_desc: { en: "Daily check-ins and creative tasks with your buddy", np: "दैनिक चेक-इन र साथीसँग रचनात्मक कार्य" },
  role_teacher_desc: { en: "Log behavioral observations for your students", np: "विद्यार्थीको व्यवहार अवलोकन गर्नुहोस्" },
  role_counselor_desc: { en: "Monitor wellbeing, risks, and manage interventions", np: "भलाइ, जोखिम र हस्तक्षेप व्यवस्थापन" },

  // Navigation
  nav_checkin: { en: "Check In", np: "चेक इन" },
  nav_creative: { en: "Creative Task", np: "रचनात्मक कार्य" },
  nav_observe: { en: "Log Observation", np: "अवलोकन" },
  nav_dashboard: { en: "Dashboard", np: "ड्यासबोर्ड" },
  nav_admin: { en: "Admin", np: "प्रशासक" },
  nav_class_trends: { en: "Class Trends", np: "कक्षा प्रवृत्ति" },
  nav_switch_role: { en: "Switch role", np: "भूमिका बदल्नुहोस्" },
  nav_sign_out: { en: "Sign out", np: "साइन आउट" },
  nav_lang_toggle_np: { en: "नेपाली", np: "नेपाली" },
  nav_lang_toggle_en: { en: "English", np: "English" },

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
  dash_my_class: { en: "My Class", np: "मेरो कक्षा" },
  dash_top_risk: { en: "Top At-Risk Students", np: "उच्च जोखिममा रहेका विद्यार्थी" },
  dash_class_comparison: { en: "Class Comparison", np: "कक्षा तुलना" },
  dash_overview: { en: "Overview", np: "सिंहावलोकन" },
  dash_students_count: { en: "students", np: "विद्यार्थी" },
  dash_ai_summary: { en: "AI Wellbeing Summary", np: "AI भलाइ सारांश" },
  dash_filter_all: { en: "All", np: "सबै" },
  dash_filter_today: { en: "Today", np: "आज" },
  dash_filter_week: { en: "7 Days", np: "७ दिन" },
  dash_filter_month: { en: "30 Days", np: "३० दिन" },
  dash_new_checkins: { en: "new check-in(s) received", np: "नयाँ चेक-इन प्राप्त भयो" },
  dash_alert_acknowledged: { en: "Alert acknowledged", np: "चेतावनी स्वीकार गरियो" },
  dash_alert_history: { en: "Alert History", np: "चेतावनी इतिहास" },
  dash_acknowledged: { en: "Acknowledged", np: "स्वीकार गरिएको" },
  dash_active: { en: "Active", np: "सक्रिय" },
  dash_no_watchlist: { en: "No students on watchlist", np: "निगरानी सूचीमा विद्यार्थी छैन" },
  dash_no_watchlist_desc: { en: "Students flagged as at-risk will appear here for monitoring", np: "जोखिममा रहेका विद्यार्थी यहाँ देखिनेछन्" },
  dash_no_students: { en: "No students found", np: "विद्यार्थी भेटिएन" },
  dash_no_students_desc: { en: "No students in the system yet", np: "प्रणालीमा अझै विद्यार्थी छैन" },
  dash_no_results: { en: "No results for", np: "कुनै नतिजा भेटिएन" },

  // AI Summary insights
  ai_crisis_attention: { en: "in crisis need immediate attention", np: "संकटमा तत्काल ध्यान चाहिन्छ" },
  ai_high_risk: { en: "flagged as high risk", np: "उच्च जोखिममा चिन्हित" },
  ai_low_mood: { en: "reported low mood recently", np: "हालै कम मुड रिपोर्ट गरेको" },
  ai_worst_class: { en: "has the most at-risk students — consider class-level intervention", np: "मा सबैभन्दा बढी जोखिममा रहेका विद्यार्थी छन् — कक्षा-स्तरीय हस्तक्षेप विचार गर्नुहोस्" },
  ai_on_watchlist: { en: "on the watchlist", np: "निगरानी सूचीमा" },
  ai_all_clear: { en: "All students are within healthy ranges. No immediate concerns detected.", np: "सबै विद्यार्थी स्वस्थ दायरामा छन्। तत्काल कुनै चिन्ता पत्ता लागेन।" },

  // Table headers
  th_name: { en: "Name", np: "नाम" },
  th_class: { en: "Class", np: "कक्षा" },
  th_last_mood: { en: "Last Mood", np: "अन्तिम मुड" },
  th_risk: { en: "Risk", np: "जोखिम" },
  th_last_checkin: { en: "Last Check-in", np: "अन्तिम चेक-इन" },
  th_score: { en: "Score", np: "अंक" },
  th_reason: { en: "Reason", np: "कारण" },
  th_mood: { en: "Mood", np: "मुड" },

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
  energy_label: { en: "energy", np: "ऊर्जा" },

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
  profile_risk_score: { en: "Risk Score", np: "जोखिम अंक" },
  profile_confidence: { en: "Confidence", np: "विश्वास" },
  profile_age: { en: "Age", np: "उमेर" },
  profile_risk_word: { en: "risk", np: "जोखिम" },
  profile_jump_student: { en: "Jump to student...", np: "विद्यार्थीमा जानुहोस्..." },
  profile_search_students: { en: "Search students...", np: "विद्यार्थी खोज्नुहोस्..." },
  profile_no_students_found: { en: "No students found", np: "विद्यार्थी भेटिएन" },
  profile_print_report: { en: "Print Report", np: "रिपोर्ट प्रिन्ट" },
  profile_no_checkins: { en: "No check-ins recorded", np: "कुनै चेक-इन रेकर्ड भएको छैन" },

  // Intervention form
  intv_log: { en: "Log Intervention", np: "हस्तक्षेप लेख्नुहोस्" },
  intv_log_new: { en: "Log New Intervention", np: "नयाँ हस्तक्षेप लेख्नुहोस्" },
  intv_success: { en: "Intervention logged successfully", np: "हस्तक्षेप सफलतापूर्वक रेकर्ड भयो" },
  intv_type: { en: "Type", np: "प्रकार" },
  intv_notes: { en: "Notes", np: "टिप्पणी" },
  intv_notes_placeholder: { en: "Describe the intervention, actions taken, and follow-up plan...", np: "हस्तक्षेप, लिइएका कदमहरू र फलो-अप योजना वर्णन गर्नुहोस्..." },
  intv_counseling: { en: "Counseling Session", np: "परामर्श सत्र" },
  intv_parent: { en: "Parent Contact", np: "अभिभावक सम्पर्क" },
  intv_peer: { en: "Peer Support", np: "साथी सहयोग" },
  intv_referral: { en: "External Referral", np: "बाह्य रेफरल" },
  intv_followup: { en: "Follow Up", np: "फलो अप" },
  intv_in_progress: { en: "in progress", np: "प्रगतिमा" },
  intv_completed: { en: "completed", np: "सम्पन्न" },

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
  crisis_helpline: { en: "Nepal Crisis Helpline: 1166", np: "नेपाल संकट हेल्पलाइन: ११६६" },
  crisis_view: { en: "View Details", np: "विवरण हेर्नुहोस्" },
  crisis_dismiss: { en: "Acknowledge", np: "स्वीकार गर्नुहोस्" },
  crisis_keyword: { en: "Keyword", np: "शब्द" },
  crisis_pattern: { en: "Pattern", np: "ढाँचा" },
  crisis_confirm_title: { en: "Acknowledge Crisis Alert", np: "संकट चेतावनी स्वीकार गर्नुहोस्" },
  crisis_confirm_msg: { en: "Are you sure you want to acknowledge this crisis alert? Make sure appropriate action has been taken for the student.", np: "के तपाईं यो संकट चेतावनी स्वीकार गर्न चाहनुहुन्छ? विद्यार्थीको लागि उचित कदम चालिएको सुनिश्चित गर्नुहोस्।" },

  // General
  loading: { en: "Loading...", np: "लोड हुँदैछ..." },
  never: { en: "Never", np: "कहिल्यै नभएको" },
  submitting: { en: "Submitting...", np: "पेश गर्दै..." },
  back: { en: "Back", np: "पछाडि" },
  cancel: { en: "Cancel", np: "रद्द गर्नुहोस्" },
  confirm: { en: "Confirm", np: "पुष्टि गर्नुहोस्" },
  no_data: { en: "No data yet", np: "अझै डाटा छैन" },
  who_are_you: { en: "Who are you?", np: "तिमी को हौ?" },
  select_name: { en: "Select your name to continue", np: "जारी राख्न आफ्नो नाम छान्नुहोस्" },
  export_csv: { en: "Export CSV", np: "CSV डाउनलोड" },

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

  // Auth - Login
  auth_enter_otp: { en: "Enter OTP", np: "OTP प्रविष्ट गर्नुहोस्" },
  auth_otp_sent_sms: { en: "A 6-digit code has been sent to your phone", np: "तपाईंको फोनमा ६ अंकको कोड पठाइएको छ" },
  auth_otp_generated: { en: "A 6-digit code has been generated for you", np: "तपाईंको लागि ६ अंकको कोड बनाइएको छ" },
  auth_check_phone: { en: "Check your phone for the SMS verification code", np: "SMS प्रमाणिकरण कोडको लागि फोन जाँच गर्नुहोस्" },
  auth_demo_otp: { en: "Demo mode — your OTP is:", np: "डेमो मोड — तपाईंको OTP:" },
  auth_verifying: { en: "Verifying...", np: "प्रमाणित गर्दै..." },
  auth_verify: { en: "Verify", np: "प्रमाणित गर्नुहोस्" },
  auth_back_signin: { en: "Back to sign in", np: "साइन इनमा फर्कनुहोस्" },
  auth_email: { en: "Email", np: "इमेल" },
  auth_email_placeholder: { en: "you@school.edu.np", np: "you@school.edu.np" },
  auth_password: { en: "Password", np: "पासवर्ड" },
  auth_password_placeholder: { en: "Enter your password", np: "आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्" },
  auth_signing_in: { en: "Signing in...", np: "साइन इन हुँदैछ..." },
  auth_sign_in: { en: "Sign in", np: "साइन इन" },
  auth_no_account: { en: "Don't have an account?", np: "खाता छैन?" },
  auth_register: { en: "Register", np: "दर्ता गर्नुहोस्" },

  // Auth - Register
  reg_submitted: { en: "Registration submitted", np: "दर्ता पेश गरियो" },
  reg_pending: { en: "Your account is pending admin approval. You'll be able to sign in once approved.", np: "तपाईंको खाता प्रशासक स्वीकृतिको प्रतीक्षामा छ। स्वीकृत भएपछि साइन इन गर्न सक्नुहुनेछ।" },
  reg_create: { en: "Create account", np: "खाता बनाउनुहोस्" },
  reg_needs_approval: { en: "Your account will need admin approval", np: "तपाईंको खातालाई प्रशासक स्वीकृति चाहिन्छ" },
  reg_full_name: { en: "Full name", np: "पूरा नाम" },
  reg_name_placeholder: { en: "Ram Kumar Shrestha", np: "राम कुमार श्रेष्ठ" },
  reg_phone: { en: "Phone number", np: "फोन नम्बर" },
  reg_phone_placeholder: { en: "+977 98XXXXXXXX", np: "+९७७ ९८XXXXXXXX" },
  reg_phone_hint: { en: "OTP will be sent to this number via SMS", np: "यो नम्बरमा SMS मार्फत OTP पठाइनेछ" },
  reg_password_hint: { en: "At least 6 characters", np: "कम्तिमा ६ अक्षर" },
  reg_i_am_a: { en: "I am a", np: "म हुँ" },
  reg_registering: { en: "Submitting...", np: "पेश गर्दै..." },
  reg_submit: { en: "Register", np: "दर्ता गर्नुहोस्" },
  reg_has_account: { en: "Already have an account?", np: "पहिले नै खाता छ?" },

  // Admin Panel
  admin_title: { en: "Admin Panel", np: "प्रशासक प्यानल" },
  admin_subtitle: { en: "Manage users, approvals, and class assignments", np: "प्रयोगकर्ता, स्वीकृति र कक्षा असाइनमेन्ट व्यवस्थापन" },
  admin_pending: { en: "Pending Approvals", np: "स्वीकृति बाँकी" },
  admin_wants_role: { en: "wants to be", np: "बन्न चाहन्छ" },
  admin_approve: { en: "Approve", np: "स्वीकृत" },
  admin_reject: { en: "Reject", np: "अस्वीकृत" },
  admin_all_staff: { en: "All Staff", np: "सबै कर्मचारी" },
  admin_pick_class: { en: "Pick class", np: "कक्षा छान्नुहोस्" },
  admin_assign: { en: "Assign", np: "असाइन गर्नुहोस्" },
  admin_assign_class: { en: "Assign class", np: "कक्षा असाइन गर्नुहोस्" },

  // OTP Gate
  otp_verification_required: { en: "Verification required", np: "प्रमाणिकरण आवश्यक" },
  otp_sensitive_data: { en: "This section contains sensitive student data. Enter an OTP to continue.", np: "यो खण्डमा संवेदनशील विद्यार्थी डाटा छ। जारी राख्न OTP प्रविष्ट गर्नुहोस्।" },
  otp_sending: { en: "Sending...", np: "पठाउँदै..." },
  otp_send: { en: "Send OTP", np: "OTP पठाउनुहोस्" },
  otp_demo: { en: "Demo — OTP:", np: "डेमो — OTP:" },
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

  // Convert numbers to Nepali digits when in Nepali mode
  function n(num) {
    if (num === null || num === undefined) return "";
    const str = String(num);
    if (lang !== "np") return str;
    return str.replace(/[0-9]/g, (d) => NP_DIGITS[parseInt(d)]);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, n }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
