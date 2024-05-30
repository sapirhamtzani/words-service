const express = require('express');
const axios = require('axios');
const connectToMongo = require('./db');

const API_URL_EN = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const COLLECTION_NAME = 'words';

const app = express();
app.use(express.json());


// Middleware to ensure MongoDB connection is ready
async function mongoMiddleware(req, res, next) {
    try {
        req.db = await connectToMongo;
        next();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        res.status(500).send('Error connecting to MongoDB.');
    }
}

// Endpoint to check the word
app.post('/check-word', mongoMiddleware, async (req, res) => {
    const { word } = req.body;
    if (!word) {
        return res.status(400).json({ error: 'Word is required' });
    }

    try {
        const wordsCollection = req.db.collection(COLLECTION_NAME);
        // Check if the word exists in MongoDB
        const existingWord = await wordsCollection.findOne({ word });

        if (existingWord) {
            return res.json({ word, valid: true, source: 'database' });
        }

        // Check the word using the external API
        try {
            const response = await axios.get(`${API_URL_EN}/${word}`);

            if (response.data && response.data.length > 0) {
                // Word is valid, insert it into MongoDB
                await wordsCollection.insertOne({ word });

                return res.json({ word, valid: true, source: 'api' });
            }
        } catch (apiError) {
            // Word is not valid according to the external API
            return res.json({ word, valid: false });
        }
    } catch (error) {
        console.error('Error occurred while checking the word:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});