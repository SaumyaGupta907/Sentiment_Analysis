const express = require("express");
const cors = require("cors"); // ✅ Allow frontend to access backend
const bodyParser = require("body-parser");




/*const express = require("express");
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

// Question Pool
const allQuestions = [
    { id: "mood", question: "How are you feeling today?", options: ["Happy", "Anxious", "Tired", "Excited"] },
    { id: "sleep", question: "How well did you sleep last night?", options: ["Very well", "Okay", "Not great", "Terrible"] },
    { id: "stress", question: "Are you experiencing any stress?", options: ["Not at all", "A little", "Moderate", "Very stressed"] },
    { id: "physical", question: "How active have you been today?", options: ["Very active", "Somewhat active", "Sedentary", "Exhausted"] },
    { id: "diet", question: "How balanced was your diet today?", options: ["Very balanced", "Somewhat balanced", "Not great", "Poor"] },
    { id: "hydration", question: "How much water have you had today?", options: ["Plenty", "Enough", "Not much", "Very little"] }
];

// Utility to pick random 4 questions
function getRandomQuestions() {
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
}

// Utility to convert answer to sentiment level
function mapAnswerToSentiment(questionId, answer) {
    const mappings = {
        hydration: {
            "Plenty": "positive",
            "Enough": "neutral",
            "Not much": "neutral",
            "Very little": "negative"
        },
        diet: {
            "Very balanced": "positive",
            "Somewhat balanced": "neutral",
            "Not great": "neutral",
            "Poor": "negative"
        },
        physical: {
            "Very active": "positive",
            "Somewhat active": "neutral",
            "Sedentary": "neutral",
            "Exhausted": "negative"
        }
    };
    return mappings[questionId]?.[answer] || "neutral";
}

// Static recommendations
const recommendations = {
    general: "Maintain a balanced routine with proper rest, hydration, and light physical activity.",
    positive: "You're doing great! Keep up with self-care, light exercise, and mindfulness.",
    neutral: "Try incorporating small relaxing activities like meditation or stretching. Listening to calming music or a pregnancy podcast can also help.",
    negative: "It seems like you're feeling overwhelmed. Consider reaching out to a friend, loved one, or a professional for support. A short prenatal yoga session or guided relaxation can be beneficial.",
    high_stress: "Your stress levels seem high. Deep breathing exercises, prenatal yoga, or talking to a healthcare provider could help. If you're feeling overwhelmed, please reach out to a professional."
};

const hydrationSuggestions = {
    positive: "You're staying well-hydrated! Keep drinking plenty of water throughout the day to stay energized.",
    neutral: "Make sure to drink more water, especially if you're feeling tired or experiencing dry skin.",
    negative: "You might be dehydrated. Try to drink more water to keep your body and skin healthy, especially during pregnancy."
};

const dietSuggestions = {
    positive: "Great job on maintaining a healthy and balanced diet! Keep including a variety of fruits, vegetables, and whole grains.",
    neutral: "Consider incorporating more fruits and vegetables into your meals for better energy and nutrition.",
    negative: "Your diet might need some improvement. Try focusing on a more balanced approach with whole foods, and avoid processed meals."
};

const physicalActivitySuggestions = {
    positive: "You're staying active, keep it up! Light exercise and walks are great for your well-being.",
    neutral: "Try to incorporate light physical activity like walking or gentle stretching into your routine for better circulation and energy.",
    negative: "It's important to stay moving, even if it's just a short walk or some light stretching. Speak to your healthcare provider for safe exercises."
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

// Analyze Route
app.post("/analyze", (req, res) => {
    let totalScore = 0;
    let responses = [];
    let mood = "neutral";
    let stressLevel = "neutral";
    let hydration = req.body.hydration;
    let diet = req.body.diet;
    let physical = req.body.physical;

    // Analyze sentiment
    allQuestions.forEach(q => {
        let answer = req.body[q.id];
        if (answer) {
            const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(answer);
            const score = sentiment.compound;
            totalScore += score;
            responses.push({ question: q.question, answer: answer, sentimentScore: score });
        }
    });

    // Mood based on score
    if (totalScore >= 0.2) mood = "positive";
    else if (totalScore <= -0.2) mood = "negative";

    // Stress level
    if (req.body.stress === "Moderate") stressLevel = "moderate";
    else if (req.body.stress === "Very stressed") stressLevel = "high";

    // Specific tips
    const hydrationMood = mapAnswerToSentiment("hydration", hydration);
    const dietMood = mapAnswerToSentiment("diet", diet);
    const physicalMood = mapAnswerToSentiment("physical", physical);

    const hydrationSuggestion = hydration ? hydrationSuggestions[hydrationMood] : "";
    const dietSuggestion = diet ? dietSuggestions[dietMood] : "";
    const physicalActivitySuggestion = physical ? physicalActivitySuggestions[physicalMood] : "";

    const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
    const extraStressTip = stressLevel === "high" ? `<h3>High Stress Advice:</h3><p>${recommendations["high_stress"]}</p>` : "";

    res.send(`<html><head><title>Suggestions</title></head><body>
        <h2>Your Personalized Pregnancy Well-being Advice</h2>
        <p>${recommendations[mood]}</p>
        ${hydration ? `<h3>Hydration Tip:</h3><p>${hydrationSuggestion}</p>` : ""}
        ${diet ? `<h3>Diet Tip:</h3><p>${dietSuggestion}</p>` : ""}
        ${physical ? `<h3>Physical Activity Tip:</h3><p>${physicalActivitySuggestion}</p>` : ""}
        ${extraStressTip}
        <h3>Recommended Podcasts:</h3>${podcastSuggestions[mood]}
        <h3>Prenatal Yoga Exercises:</h3>${yogaSuggestions[mood]}
        <h3>Daily Well-being Tip:</h3><p>${randomTip}</p>
        <h3>Your Responses and Sentiment Analysis:</h3>
        <ul>${responses.map(r => `<li><b>${r.question}</b>: ${r.answer} (Sentiment Score: ${r.sentimentScore.toFixed(2)})</li>`).join('')}</ul>
        <button onclick="window.location.href='/quiz'">Take the Quiz Again</button>
    </body></html>`);
});


/*app.get("/test", (req, res) => {
    res.json({ message: "Frontend connected to Backend successfully!", status: "success" });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/



const app = express();
app.use(cors()); // ✅ Allow frontend to access backend
app.use(bodyParser.json());

// ✅ Updated API to return JSON-formatted questions
app.get("/api/quiz", (req, res) => {
    const allQuestions = [
        { id: "mood", question: "How are you feeling today?", options: ["Happy", "Anxious", "Tired", "Excited"] },
        { id: "sleep", question: "How well did you sleep last night?", options: ["Very well", "Okay", "Not great", "Terrible"] },
        { id: "stress", question: "Are you experiencing any stress?", options: ["Not at all", "A little", "Moderate", "Very stressed"] },
        { id: "physical", question: "How active have you been today?", options: ["Very active", "Somewhat active", "Sedentary", "Exhausted"] },
        { id: "diet", question: "How balanced was your diet today?", options: ["Very balanced", "Somewhat balanced", "Not great", "Poor"] },
        { id: "hydration", question: "How much water have you had today?", options: ["Plenty", "Enough", "Not much", "Very little"] }
    ];

    // ✅ Send 4 random questions as JSON
    const selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
    res.json({ questions: selectedQuestions });
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
