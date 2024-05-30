const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const JOB_CHECK_URL = 'http://job-check:3000/check-word';

app.post('/check-word', async (req, res) => {
    const { word } = req.body;
    if (!word) {
        return res.status(400).json({ error: 'Word is required' });
    }

    try {
        const response = await axios.post(JOB_CHECK_URL, { word });
        return res.json(response.data);
    } catch (error) {
        console.error('Error occurred while checking the word:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});