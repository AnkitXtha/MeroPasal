const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken')

// Token Generation Function
function generateTokens(email, time) {
    const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: `${time}s` });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN);
    return { accessToken, refreshToken };
}

//Generate Refresh Token
function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if(token == null) return res.status(405).json({message: "Token cannot be empty"})

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if(err) return res.status(410).json({message: "Token Expired, Forbidden access"});

        user.email = user;
        next();
    })
}

//Register user
router.post('/register', async (req, res) => {
    const { fullName, email, password, confirmPassword, mobileNo, dateOfBirth } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(401).json({ message: 'User already exists!' });
        }

        if (password !== confirmPassword) {
            return res.status(405).json({ message: 'Passwords do not match' });
        }

        const user = new User({
            fullName,
            email,
            password,
            confirmPassword,
            mobileNo,
            dateOfBirth,
        });

        const newUser = await user.save();

        res.status(200).json({status: 'SUCCESS', message: 'Successfully Registered!' });
    } catch (error) {
        res.status(400).json({ error: error.message, message: 'Server Error' });
    }
});


// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (existingUser.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const { accessToken, refreshToken } = generateTokens(email, 15);

        existingUser.token = accessToken;
        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        const responseData = {
            _id: existingUser._id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            token: existingUser.token,
            refreshToken: existingUser.refreshToken
        };

        res.status(200).json({ data: responseData, message: 'Login Successful!' });
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Server error' });
    }
});

//Logout
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // Assuming req.body.email is set in the authenticateToken middleware
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Clear the token and refreshToken fields
        user.token = null;
        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Server error' });
    }
});

// Refresh Token
router.post('/refreshToken', (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) return res.status(400).json({ error: 'No token found' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });

        const accessToken = generateTokens(user.email, 120).accessToken;

        res.status(200).json({ accessToken });
    });
});

module.exports = authenticateToken
module.exports = router