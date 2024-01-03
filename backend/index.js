require('dotenv').config();
const express = require('express')
const app = express()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

mongoose.connect("mongodb://localhost:27017/MeroPasal")

const db = mongoose.connection
db.on('error', (error) => console.log('Error', error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

const authRouter = require('./router/auth')

app.use('/', authRouter)

const posts = [
    {
        username: "Ram",
        title: "Post 1"
    },
    {
        username: "Shyam",
        title: "Post 2"
    },
]

let refreshTokens = []
app.post("/refreshTokens", (req, res) => {
    const refreshToken = req.body.token;
    if(refreshToken == null) return res.statusMessage("No token");
    if(!refreshTokens.includes(refreshToken)) return res.statusMessage("Invalid token")
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
        if(err) return res.statusMessage("ERROR TOKEN")
        const accessToken = generateAccessToken({ name: user.name }, 120)
    res.json({ accessToken: accessToken })
    })
})

app.get("/posts", authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

app.post('/logins', (req, res) => {

    const username = req.body.username;
    const user = { name: username }
    const accessToken = generateAccessToken(user, 15);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN);
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.delete("/logouts", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.statusMessage("Logout")
})

function generateAccessToken(user, time){
    return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: `${time}s` })
}

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if(err) return res.sendStatus(403);

        req.user = user;
        next();
    })
}

app.listen(8001, () => {
    console.log('Listening to port 8001');
})