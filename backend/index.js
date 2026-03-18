const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send("API working.");
});

app.get('/api/message', (req, res) => {
    res.json({
        message: 'Sent from backend.'
    })
})

app.listen(5000, () => console.log("Server started."));