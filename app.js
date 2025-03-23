
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const vader = require("vader-sentiment");

const app = express();
app.use(cors()); // ✅ Allow frontend to access backend
app.use(bodyParser.json());

// ✅ Question Pool
const allQuestions = [
    { id: "mood", question: "How are you feeling today?", options: ["Happy", "Anxious", "Tired", "Excited"] },
    { id: "sleep", question: "How well did you sleep last night?", options: ["Very well", "Okay", "Not great", "Terrible"] },
    { id: "stress", question: "Are you experiencing any stress?", options: ["Not at all", "A little", "Moderate", "Very stressed"] },
    { id: "physical", question: "How active have you been today?", options: ["Very active", "Somewhat active", "Sedentary", "Exhausted"] },
    { id: "diet", question: "How balanced was your diet today?", options: ["Very balanced", "Somewhat balanced", "Not great", "Poor"] },
    { id: "hydration", question: "How much water have you had today?", options: ["Plenty", "Enough", "Not much", "Very little"] }
];

// ✅ Utility to pick random 4 questions
function getRandomQuestions() {
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
}

// ✅ Utility to convert answer to sentiment
function mapAnswerToSentiment(questionId, answer) {
    const mappings = {
        sleep: { "Very well": "positive", "Okay": "neutral", "Not great": "neutral", "Terrible": "negative" },
        hydration: { "Plenty": "positive", "Enough": "neutral", "Not much": "neutral", "Very little": "negative" },
        diet: { "Very balanced": "positive", "Somewhat balanced": "neutral", "Not great": "neutral", "Poor": "negative" },
        physical: { "Very active": "positive", "Somewhat active": "neutral", "Sedentary": "neutral", "Exhausted": "negative" }
    };
    return mappings[questionId]?.[answer] || "neutral";
}

// ✅ Static recommendations
const recommendations = {
    general: "Maintain a balanced routine with proper rest, hydration, and light physical activity.",
    positive: "You're doing great! Keep up with self-care, light exercise, and mindfulness.",
    neutral: "Try incorporating small relaxing activities like meditation or stretching.",
    negative: "You're feeling overwhelmed. Consider reaching out to a friend or professional.",
    high_stress: "Deep breathing exercises, prenatal yoga, or talking to a healthcare provider could help."
};

// ✅ Sleep, Hydration, Diet & Physical Activity Suggestions
const sleepSuggestions = {
    positive: "Great sleep! A well-rested body is essential for well-being.",
    neutral: "An okay sleep is good, but try to create a bedtime routine for better rest.",
    negative: "Poor sleep can impact your health. Try relaxing before bed and reducing screen time."
};

const hydrationSuggestions = {
    positive: "You're staying well-hydrated! Keep drinking plenty of water.",
    neutral: "Drink more water, especially if you're feeling tired.",
    negative: "Try to drink more water to keep your body and skin healthy."
};

const dietSuggestions = {
    positive: "Great job! Keep including a variety of fruits and vegetables.",
    neutral: "Consider incorporating more fruits and vegetables into your meals.",
    negative: "Try focusing on a balanced approach with whole foods and less processed food."
};

const physicalActivitySuggestions = {
    positive: "You're staying active, keep it up! Light exercise is great.",
    neutral: "Try to incorporate light physical activity like walking into your routine.",
    negative: "It's important to stay moving, even if it's just light stretching."
};

// ✅ Podcasts & Yoga Recommendations
const podcastSuggestions = {
    positive: `<ul><li><a href="https://pregnancypodcast.com/">Pregnancy Podcast</a></li><li><a href="https://www.themotherkindpodcast.com/">The Motherkind Podcast</a></li></ul>`,
    neutral: `<ul><li><a href="https://www.birthful.com/podcast/">The Birthful Podcast</a></li><li><a href="https://pregnancypodcast.com/">Pregnancy Podcast</a></li></ul>`,
    negative: `<ul><li><a href="https://www.themotherkindpodcast.com/">The Motherkind Podcast</a></li><li><a href="https://www.mindfulmamamentor.com/mindful-mama-podcast/">Mindful Mama Podcast</a></li></ul>`
};

const yogaSuggestions = {
    positive: `<ul><li><a href="https://www.youtube.com/watch?v=9Qj7uY5GGeU">Prenatal Yoga for Beginners</a></li></ul>`,
    neutral: `<ul><li><a href="https://www.youtube.com/watch?v=NLDXr9pxV38">Gentle Yoga for Pregnancy</a></li></ul>`,
    negative: `<ul><li><a href="https://www.yogajournal.com/poses/yoga-by-benefit/poses-for-pregnancy/">Yoga Journal - Pregnancy Yoga Poses</a></li></ul>`
};

const dailyTips = [
    "Drink plenty of water to stay hydrated.",
    "Incorporate short walks into your routine.",
    "Practice deep breathing exercises to manage stress.",
    "Listen to calming music or nature sounds.",
    "Maintain a balanced diet rich in fruits and whole grains."
];

// ✅ Fetch 4 random quiz questions
app.get("/api/quiz", (req, res) => {
    const questions = getRandomQuestions();
    res.json({ questions });
});

// ✅ Analyze quiz answers & return insights
app.post("/api/analyze", (req, res) => {
    let totalScore = 0;
    let responses = [];
    let mood = "neutral";
    let stressLevel = "neutral";
    let { answers } = req.body;

    // ✅ Analyze sentiment of answers
    /*Object.entries(answers).forEach(([questionId, answer]) => {
        const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(answer);
        const score = sentiment.compound;
        totalScore += score;
        responses.push({ question: allQuestions.find(q => q.id === questionId)?.question, answer, sentimentScore: score });
    });*/

    // ✅ Determine Mood
    if (totalScore >= 0.2) mood = "positive";
    else if (totalScore <= -0.2) mood = "negative";

    // ✅ Determine Stress Level
    if (answers.stress === "Moderate") stressLevel = "moderate";
    else if (answers.stress === "Very stressed") stressLevel = "high";

    // ✅ Generate Suggestions
    const sleepSuggestion = sleepSuggestions[mapAnswerToSentiment("sleep", answers.sleep)];
    const hydrationSuggestion = hydrationSuggestions[mapAnswerToSentiment("hydration", answers.hydration)];
    const dietSuggestion = dietSuggestions[mapAnswerToSentiment("diet", answers.diet)];
    const physicalActivitySuggestion = physicalActivitySuggestions[mapAnswerToSentiment("physical", answers.physical)];
    const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
    const extraStressTip = stressLevel === "high" ? recommendations["high_stress"] : "";

    // ✅ Return JSON Response
    res.json({
        recommendations: recommendations[mood],
        sleepSuggestion,
        hydrationSuggestion,
        dietSuggestion,
        physicalActivitySuggestion,
        highStressAdvice: extraStressTip,
        podcastSuggestions: podcastSuggestions[mood],
        yogaSuggestions: yogaSuggestions[mood],
        randomTip,
        responses
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
