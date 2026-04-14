const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Send a message
router.post('/send', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(201).send(message);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all messages
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send();
    }
});

module.exports = router;