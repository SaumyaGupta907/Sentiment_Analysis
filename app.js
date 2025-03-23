const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const vader = require("vader-sentiment");

const app = express();
app.use(cors());
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

// ✅ Pick 4 Random Questions
function getRandomQuestions() {
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
}

// ✅ Convert Answer to Sentiment Score
function getSentimentScore(answer) {
    return vader.SentimentIntensityAnalyzer.polarity_scores(`I feel ${answer}.`).compound;
}

// ✅ Classify Sentiment Scores into Categories
function classifySentiment(score) {
    if (score > 0.5) return "very positive";
    if (score > 0.2) return "positive";
    if (score > -0.2) return "neutral";
    if (score > -0.5) return "negative";
    return "very negative";
}

// ✅ General Well-being Recommendations
const recommendations = {
    "very positive": "You're in a great mood! Keep following your healthy routine.",
    "positive": "You're doing well! Stay consistent with self-care and healthy habits.",
    "neutral": "You're doing okay, but small changes like better sleep or relaxation could help.",
    "negative": "You're feeling a little low. Try mindfulness exercises and self-care.",
    "very negative": "It seems like you're struggling. Consider reaching out to a friend or professional for support."
};

// ✅ Suggestions for each category
const suggestions = {
    sleep: {
        "very positive": "You're getting great sleep! Keep up with your bedtime habits.",
        "positive": "You're doing well, but sticking to a sleep schedule could improve rest.",
        "neutral": "Try to improve sleep quality with a bedtime routine and limited screen time.",
        "negative": "Your sleep could be better. Consider relaxing activities before bed.",
        "very negative": "Poor sleep can impact well-being. Try deep breathing before sleep."
    },
    stress: {
        "very positive": "You're managing stress well! Keep practicing relaxation techniques.",
        "positive": "Your stress levels are under control. Maintain balance in your routine.",
        "neutral": "Try light exercises like walking or yoga to manage daily stress.",
        "negative": "You're feeling stressed. Consider guided meditation or journaling.",
        "very negative": "High stress detected! Reach out for support and prioritize self-care."
    },
    hydration: {
        "very positive": "You're staying well-hydrated! Keep drinking water throughout the day.",
        "positive": "Good hydration! Try adding herbal teas or infused water for variety.",
        "neutral": "Make sure you're drinking enough water, especially if feeling tired.",
        "negative": "Drink more water! Dehydration can cause fatigue and headaches.",
        "very negative": "You're not drinking enough water. Carry a bottle with you as a reminder!"
    },
    diet: {
        "very positive": "You're eating a well-balanced diet! Keep up with nutritious choices.",
        "positive": "Good job! Try adding more leafy greens and protein for extra energy.",
        "neutral": "Consider reducing processed foods and adding more fresh fruits & veggies.",
        "negative": "Your diet could be improved. Focus on whole foods and home-cooked meals.",
        "very negative": "Your diet is lacking essential nutrients. Prioritize balanced meals."
    },
    physical: {
        "very positive": "You're super active! Keep up your workouts and movement habits.",
        "positive": "You're doing well! Regular movement like walking is great for health.",
        "neutral": "Try adding light physical activities like stretching or short walks.",
        "negative": "Your activity level is low. Even 10-minute workouts can be beneficial.",
        "very negative": "You need more movement. Try yoga or simple exercises at home."
    }
};

// ✅ Podcasts & Yoga Based on Mood
const podcastSuggestions = {
    "very positive": `<ul><li><a href="https://pregnancypodcast.com/">Pregnancy Podcast</a></li><li><a href="https://thebirthhour.com/">The Birth Hour</a></li></ul>`,
    "positive": `<ul><li><a href="https://www.birthful.com/podcast/">The Birthful Podcast</a></li></ul>`,
    "neutral": `<ul><li><a href="https://www.themotherkindpodcast.com/">The Motherkind Podcast</a></li></ul>`,
    "negative": `<ul><li><a href="https://www.headspace.com/">Headspace Meditation Podcast</a></li></ul>`,
    "very negative": `<ul><li><a href="https://www.mindfulmamamentor.com/mindful-mama-podcast/">Mindful Mama Podcast</a></li></ul>`
};

const yogaSuggestions = {
    "very positive": `<ul><li><a href="https://www.youtube.com/watch?v=k2V07H1vVnM">Advanced Prenatal Yoga</a></li></ul>`,
    "positive": `<ul><li><a href="https://www.youtube.com/watch?v=NLDXr9pxV38">Gentle Yoga for Pregnancy</a></li></ul>`,
    "neutral": `<ul><li><a href="https://www.yogajournal.com/">Pregnancy Yoga Poses</a></li></ul>`,
    "negative": `<ul><li><a href="https://www.youtube.com/watch?v=qD4CjMUFKSM">Yoga for Stress Relief</a></li></ul>`,
    "very negative": `<ul><li><a href="https://www.youtube.com/watch?v=4C-gxOE0j7s">Meditation for Deep Relaxation</a></li></ul>`
};

// ✅ Daily Tips
const dailyTips = [
    "Stay hydrated throughout the day.",
    "Incorporate light stretching exercises.",
    "Listen to calming music before bed.",
    "Practice deep breathing to reduce stress.",
    "Maintain a balanced diet with fresh fruits and vegetables."
];

// ✅ Fetch Questions API
app.get("/api/quiz", (req, res) => {
    res.json({ questions: getRandomQuestions() });
});

// ✅ Analyze Answers & Provide Insights
app.post("/api/analyze", (req, res) => {
    const answers = req.body.answers;
    const mood = classifySentiment(getSentimentScore(answers.mood));

    res.json({
        recommendations: recommendations[mood],
        stressSuggestion: suggestions.stress[classifySentiment(getSentimentScore(answers.stress))],
        sleepSuggestion: suggestions.sleep[classifySentiment(getSentimentScore(answers.sleep))],
        hydrationSuggestion: suggestions.hydration[classifySentiment(getSentimentScore(answers.hydration))],
        dietSuggestion: suggestions.diet[classifySentiment(getSentimentScore(answers.diet))],
        physicalActivitySuggestion: suggestions.physical[classifySentiment(getSentimentScore(answers.physical))],
        podcastSuggestions: podcastSuggestions[mood],
        yogaSuggestions: yogaSuggestions[mood],
        randomTip: dailyTips[Math.floor(Math.random() * dailyTips.length)]
    });
});

// ✅ Start Server
app.listen(5001, () => console.log(`✅ Server running on port 5001`));
