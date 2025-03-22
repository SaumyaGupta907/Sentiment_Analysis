const express = require("express");
const bodyParser = require("body-parser");
const vader = require("vader-sentiment");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Questions List
const questions = [
    { id: "mood", question: "How are you feeling today?", options: ["Happy", "Anxious", "Tired", "Excited"] },
    { id: "sleep", question: "How well did you sleep last night?", options: ["Very well", "Okay", "Not great", "Terrible"] },
    { id: "stress", question: "Are you experiencing any stress?", options: ["Not at all", "A little", "Moderate", "Very stressed"] },
    { id: "physical", question: "How active have you been today?", options: ["Very active", "Somewhat active", "Sedentary", "Exhausted"] }
];

// Quiz Page
app.get("/quiz", (req, res) => {
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

// Recommendations based on sentiment score
const recommendations = {
    positive: "You're doing great! Keep up with light exercise, hydration, and mindfulness.",
    neutral: "Maintain a balanced routine with adequate rest and self-care.",
    negative: "Consider relaxation techniques, reaching out to loved ones, or consulting a healthcare provider if needed."
};

// Process Sentiment & Get Personalized Suggestion
app.post("/analyze", (req, res) => {
    let sentimentScores = {};

    // Analyze each answer with Sentiment Analysis
    for (const q of questions) {
        let answer = req.body[q.id];
        let sentimentResult = vader.SentimentIntensityAnalyzer.polarity_scores(answer);
        sentimentScores[q.id] = sentimentResult.compound;
    }

    // Calculate Overall Sentiment Score
    let totalScore = Object.values(sentimentScores).reduce((acc, score) => acc + score, 0);
    let overallMood = totalScore >= 1 ? "positive" : totalScore <= -1 ? "negative" : "neutral";

    res.send(`
        <html>
            <head><title>Suggestions</title></head>
            <body>
                <h2>Your Personalized Pregnancy Well-being Advice</h2>
                <p>${recommendations[overallMood]}</p>
                <button onclick="window.location.href='/quiz'">Take Quiz Again</button>
            </body>
        </html>
    `);
});

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
