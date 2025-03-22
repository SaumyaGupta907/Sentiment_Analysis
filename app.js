const express = require("express");
const bodyParser = require("body-parser");
const vader = require("vader-sentiment");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // For static files

// Questions List (MCQ format)
const questions = [
    { id: "mood", question: "How are you feeling today?", options: ["Happy", "Anxious", "Tired", "Excited"] },
    { id: "sleep", question: "How well did you sleep last night?", options: ["Very well", "Okay", "Not great", "Terrible"] },
    { id: "stress", question: "Are you experiencing any stress?", options: ["Not at all", "A little", "Moderate", "Very stressed"] },
    { id: "physical", question: "How active have you been today?", options: ["Very active", "Somewhat active", "Sedentary", "Exhausted"] }
];

// Home Page
app.get("/", (req, res) => {
    res.send(`
        <html>
            <head><title>Home</title></head>
            <body>
                <h2>Welcome to MomBack Support!</h2>
                <button onclick="window.location.href='/quiz'">Start Quiz</button>
            </body>
        </html>
    `);
});

// Quiz Page - Asks all questions
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

// Analyze Sentiment & Get Safe Suggestions
app.post("/analyze", async (req, res) => {
    let sentimentScores = {};
    
    // Process each answer using Sentiment Analysis
    for (const q of questions) {
        let answer = req.body[q.id];
        let sentimentResult = vader.SentimentIntensityAnalyzer.polarity_scores(answer);
        sentimentScores[q.id] = sentimentResult.compound;
    }

    // Categorizing Mood based on aggregated score
    let overallMood = "neutral";
    let totalScore = Object.values(sentimentScores).reduce((acc, score) => acc + score, 0);
    
    if (totalScore >= 1) overallMood = "positive";
    else if (totalScore <= -1) overallMood = "negative";

    // Call Safe Medical API for Suggestions
    try {
        let response = await axios.post("http://localhost:5000/suggestions", { mood: overallMood, sentimentScores });
        res.send(`
            <html>
                <head><title>Suggestions</title></head>
                <body>
                    <h2>Personalized Recommendations</h2>
                    <p>${response.data.suggestion}</p>
                    <button onclick="window.location.href='/'">Back Home</button>
                </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send("Error fetching safe recommendations");
    }
});

// Safe Suggestions API (Using an External API for Medical-Grade Advice)
app.post("/suggestions", async (req, res) => {
    const { mood, sentimentScores } = req.body;

    let query = "pregnancy self-care"; // Default
    if (mood === "negative") query = "pregnancy stress relief";
    else if (mood === "positive") query = "pregnancy fitness tips";

    try {
        let medicalAPIResponse = await axios.get(`https://api.healthline.com/pregnancy-care?query=${query}`);

        let suggestion = medicalAPIResponse.data.recommendations[0] || "Please consult your doctor for detailed guidance.";

        res.json({ suggestion });
    } catch (error) {
        res.json({ suggestion: "Stay hydrated, eat healthy, and take rest when needed. If stress persists, consult a doctor." });
    }
});

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
