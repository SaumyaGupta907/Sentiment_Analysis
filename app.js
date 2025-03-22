const express = require("express");
const bodyParser = require("body-parser");

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

// Function to randomly select questions
function getRandomQuestions() {
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
}

// Sentiment Mapping
const sentimentMapping = {
    mood: { "Happy": 2, "Excited": 2, "Anxious": -1, "Tired": -1 },
    sleep: { "Very well": 2, "Okay": 1, "Not great": -1, "Terrible": -2 },
    stress: { "Not at all": 2, "A little": 1, "Moderate": -1, "Very stressed": -2 },
    physical: { "Very active": 2, "Somewhat active": 1, "Sedentary": -1, "Exhausted": -2 },
    diet: { "Very balanced": 2, "Somewhat balanced": 1, "Not great": -1, "Poor": -2 },
    hydration: { "Plenty": 2, "Enough": 1, "Not much": -1, "Very little": -2 }
};

// Recommendations based on specific conditions
const recommendations = {
    general: "Maintain a balanced routine with proper rest, hydration, and light physical activity.",
    positive: "You're doing great! Keep up with self-care, light exercise, and mindfulness.",
    neutral: "Try incorporating small relaxing activities like meditation or stretching. Listening to calming music or a pregnancy podcast can also help.",
    negative: "It seems like you're feeling overwhelmed. Consider reaching out to a friend, loved one, or a professional for support. A short prenatal yoga session or guided relaxation can be beneficial.",
    high_stress: "Your stress levels seem high. Deep breathing exercises, prenatal yoga, or talking to a healthcare provider could help. If you're feeling overwhelmed, please reach out to a professional."
};

const dailyTips = [
    "Drink plenty of water to stay hydrated and reduce fatigue.",
    "Incorporate short walks into your routine to boost circulation.",
    "Practice deep breathing exercises to manage stress and anxiety.",
    "Listen to calming music or nature sounds to enhance relaxation.",
    "Maintain a balanced diet rich in fruits, vegetables, and whole grains."
];

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
    let highStress = false;

    for (const q of allQuestions) {
        let answer = req.body[q.id];
        if (answer) {
            let score = sentimentMapping[q.id][answer];
            totalScore += score;
        }
    }

    let overallMood = totalScore >= 2 ? "positive" : totalScore <= -2 ? "negative" : "neutral";
    let suggestion = highStress ? recommendations.high_stress : recommendations[overallMood];
    let randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

    res.send(`<html><head><title>Suggestions</title></head><body>
        <h2>Your Personalized Pregnancy Well-being Advice</h2>
        <p>${suggestion}</p>
        <h3>Recommended Podcasts:</h3>${podcastSuggestions[overallMood]}
        <h3>Prenatal Yoga Exercises:</h3>${yogaSuggestions[overallMood]}
        <h3>Daily Well-being Tip:</h3><p>${randomTip}</p>
        <button onclick="window.location.href='/quiz'">Take Quiz Again</button>
    </body></html>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
