const express = require("express");
const bodyParser = require("body-parser");
const vader = require("vader-sentiment");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Home Page
app.get("/", (req, res) => {
    res.send(`<html><head><title>Home</title></head><body>
        <h1>Welcome to the Pregnancy Well-being App</h1>
        <p>Take a short quiz to get personalized well-being suggestions.</p>
        <button onclick="window.location.href='/quiz'">Start Quiz</button>
    </body></html>`);
});

// Larger pool of questions
const allQuestions = [
    { id: "mood", question: "How are you feeling today?", options: ["Happy", "Anxious", "Tired", "Excited"] },
    { id: "sleep", question: "How well did you sleep last night?", options: ["Very well", "Okay", "Not great", "Terrible"] },
    { id: "stress", question: "Are you experiencing any stress?", options: ["Not at all", "A little", "Moderate", "Very stressed"] },
    { id: "physical", question: "How active have you been today?", options: ["Very active", "Somewhat active", "Sedentary", "Exhausted"] },
    { id: "diet", question: "How balanced was your diet today?", options: ["Very balanced", "Somewhat balanced", "Not great", "Poor"] },
    { id: "hydration", question: "How much water have you had today?", options: ["Plenty", "Enough", "Not much", "Very little"] }
];

// Function to randomly select 4 questions
function getRandomQuestions() {
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
}

// Sentiment Analysis using vader-sentiment
function getSentiment(text) {
    const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    return sentiment;
}

// Recommendations based on specific conditions
const recommendations = {
    general: "Maintain a balanced routine with proper rest, hydration, and light physical activity.",
    positive: "You're doing great! Keep up with self-care, light exercise, and mindfulness.",
    neutral: "Try incorporating small relaxing activities like meditation or stretching. Listening to calming music or a pregnancy podcast can also help.",
    negative: "It seems like you're feeling overwhelmed. Consider reaching out to a friend, loved one, or a professional for support. A short prenatal yoga session or guided relaxation can be beneficial.",
    high_stress: "Your stress levels seem high. Deep breathing exercises, prenatal yoga, or talking to a healthcare provider could help. If you're feeling overwhelmed, please reach out to a professional."
};

// Dynamic Suggestions for Diet, Hydration, Physical Activity
const dietSuggestions = {
    positive: "Great job on maintaining a healthy and balanced diet! Keep including a variety of fruits, vegetables, and whole grains.",
    neutral: "Consider incorporating more fruits and vegetables into your meals for better energy and nutrition.",
    negative: "Your diet might need some improvement. Try focusing on a more balanced approach with whole foods, and avoid processed meals."
};

const hydrationSuggestions = {
    positive: "You're staying well-hydrated! Keep drinking plenty of water throughout the day to stay energized.",
    neutral: "Make sure to drink more water, especially if you're feeling tired or experiencing dry skin.",
    negative: "You might be dehydrated. Try to drink more water to keep your body and skin healthy, especially during pregnancy."
};

const physicalActivitySuggestions = {
    positive: "You're staying active, keep it up! Light exercise and walks are great for your well-being.",
    neutral: "Try to incorporate light physical activity like walking or gentle stretching into your routine for better circulation and energy.",
    negative: "It's important to stay moving, even if it's just a short walk or some light stretching. Speak to your healthcare provider for safe exercises."
};

// Define daily well-being tips
const dailyTips = [
    "Drink plenty of water to stay hydrated and reduce fatigue.",
    "Incorporate short walks into your routine to boost circulation.",
    "Practice deep breathing exercises to manage stress and anxiety.",
    "Listen to calming music or nature sounds to enhance relaxation.",
    "Maintain a balanced diet rich in fruits, vegetables, and whole grains."
];

// Define podcast and yoga suggestions based on mood
const podcastSuggestions = {
    positive: `<ul><li><a href="https://pregnancypodcast.com/" target="_blank">Pregnancy Podcast</a></li><li><a href="https://www.themotherkindpodcast.com/" target="_blank">The Motherkind Podcast</a></li></ul>`,
    neutral: `<ul><li><a href="https://www.birthful.com/podcast/" target="_blank">The Birthful Podcast</a></li><li><a href="https://pregnancypodcast.com/" target="_blank">Pregnancy Podcast</a></li></ul>`,
    negative: `<ul><li><a href="https://www.themotherkindpodcast.com/" target="_blank">The Motherkind Podcast</a></li><li><a href="https://www.mindfulmamamentor.com/mindful-mama-podcast/" target="_blank">Mindful Mama Podcast</a></li></ul>`
};

const yogaSuggestions = {
    positive: `<ul><li><a href="https://www.youtube.com/watch?v=9Qj7uY5GGeU" target="_blank">Prenatal Yoga for Beginners</a></li></ul>`,
    neutral: `<ul><li><a href="https://www.youtube.com/watch?v=NLDXr9pxV38" target="_blank">Gentle Yoga for Pregnancy</a></li></ul>`,
    negative: `<ul><li><a href="https://www.yogajournal.com/poses/yoga-by-benefit/poses-for-pregnancy/" target="_blank">Yoga Journal - Pregnancy Yoga Poses</a></li></ul>`
};

// Quiz Page
app.get("/quiz", (req, res) => {
    const questions = getRandomQuestions();
    let quizForm = `<h2>Pregnancy Well-being Quiz</h2><form action="/analyze" method="POST">`;

    questions.forEach(q => {
        quizForm += `<p>${q.question}</p>`;
        q.options.forEach(option => {
            quizForm += `<input type="radio" name="${q.id}" value="${option}" required> ${option}<br>`;
        });
    });

    quizForm += `<button type="submit">Submit</button></form>`;
    res.send(`<html><head><title>Quiz</title></head><body>${quizForm}</body></html>`);
});

// Process Quiz and Provide Suggestions
app.post("/analyze", (req, res) => {
    let totalScore = 0;
    let responses = [];
    let mood = "neutral"; // Default mood
    let stressLevel = "neutral"; // Default stress level
    let hydration = req.body.hydration;
    let diet = req.body.diet;
    let physical = req.body.physical;

    // Analyze responses with VADER Sentiment
    allQuestions.forEach(q => {
        let answer = req.body[q.id];
        if (answer) {
            const sentiment = getSentiment(answer);
            const sentimentScore = sentiment.compound; // VADER compound score
            totalScore += sentimentScore;
            responses.push({ question: q.question, answer: answer, sentimentScore: sentimentScore });
        }
    });

    // Determine mood based on sentiment score
    if (totalScore >= 0.2) {
        mood = "positive";
    } else if (totalScore <= -0.2) {
        mood = "negative";
    }

    // Determine stress level based on the response to the "stress" question
    if (req.body.stress === "Moderate") {
        stressLevel = "moderate";
    } else if (req.body.stress === "Very stressed") {
        stressLevel = "high";
    }

    // Generate dynamic suggestions based on mood, hydration, diet, and physical activity
    let moodSuggestion = recommendations[mood] || recommendations["general"];
    let hydrationSuggestion = hydration ? hydrationSuggestions[mood] || hydrationSuggestions["neutral"] : "";
    let dietSuggestion = diet ? dietSuggestions[mood] || dietSuggestions["neutral"] : "";
    let physicalActivitySuggestion = physical ? physicalActivitySuggestions[mood] || physicalActivitySuggestions["neutral"] : "";

    let randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

    res.send(`<html><head><title>Suggestions</title></head><body>
        <h2>Your Personalized Pregnancy Well-being Advice</h2>
        <p>${moodSuggestion}</p>
        ${hydration ? `<h3>Hydration Tip:</h3><p>${hydrationSuggestion}</p>` : ""}
        ${diet ? `<h3>Diet Tip:</h3><p>${dietSuggestion}</p>` : ""}
        ${physical ? `<h3>Physical Activity Tip:</h3><p>${physicalActivitySuggestion}</p>` : ""}
        <h3>Recommended Podcasts:</h3>${podcastSuggestions[mood] || podcastSuggestions["positive"]}
        <h3>Prenatal Yoga Exercises:</h3>${yogaSuggestions[mood] || yogaSuggestions["positive"]}
        <h3>Daily Well-being Tip:</h3><p>${randomTip}</p>
        <h3>Your Responses and Sentiment Analysis:</h3>
        <ul>${responses.map(r => `<li><b>${r.question}</b>: ${r.answer} (Sentiment Score: ${r.sentimentScore})</li>`).join('')}</ul>
        <button onclick="window.location.href='/quiz'">Take the Quiz Again</button>
    </body></html>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
