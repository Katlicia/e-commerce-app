const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const dotenv = require('dotenv')
dotenv.config();
const authRoutes =  require('./routes/authRoutes')
const userRoutes =  require('./routes/userRoutes')

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

db();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send("API working.");
});

app.get('/api/message', (req, res) => {
    res.json({
        message: 'Sent from backend.'
    });
});

app.post('/api/message', (req, res) => {
    const {text} = req.body;

    res.json({
        message: `Backend got ${text}`
    });
});

app.listen(5000, () => console.log("Server started."));