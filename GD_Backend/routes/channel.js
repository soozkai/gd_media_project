const express = require('express');
const router = express.Router();
const connection = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/authMiddleware');

// Configure multer for image uploads with disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'TVLauncher/livetv/';
        fs.mkdirSync(dir, { recursive: true }); // Ensure directory exists
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

// GET route to fetch channels
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `SELECT id, name, image, url, port FROM channels WHERE user_id = ?`;
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// POST route for adding a new channel
router.post('/add', authenticateToken, upload.single('image'), (req, res) => {
    const { name, url, port } = req.body;
    if (!name || !url || !port) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const image = req.file ? req.file.filename : null; // Get the uploaded image filename
    const userId = req.user.id;

    const query = 'INSERT INTO channels (name, image, url, port, user_id) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [name, image, url, port, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Channel added successfully', channel: { id: results.insertId, name, image, url, port } });
    });
});

// PUT route for updating a channel
router.put('/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, url, port } = req.body;
    if (!name || !url || !port) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const image = req.file ? req.file.filename : null;
    const userId = req.user.id;

    let query = 'UPDATE channels SET name = ?, url = ?, port = ?';
    const params = [name, url, port];

    if (image) {
        query += ', image = ?';
        params.push(image);
    }

    query += ' WHERE id = ? AND user_id = ?';
    params.push(id, userId);

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        res.json({ message: 'Channel updated successfully' });
    });
});

// DELETE route for deleting a channel
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // First, retrieve the channel to delete the image from the filesystem
    connection.query('SELECT image FROM channels WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        const channel = results[0];
        if (channel.image) {
            const filePath = path.join(__dirname, '..', 'TVLauncher', 'livetv', channel.image);

            // Delete the image from the filesystem
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Error deleting image:', err);
                } else {
                    console.log('Image deleted:', filePath);
                }
            });
        }

        // Then, delete the channel record from the database
        connection.query('DELETE FROM channels WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Channel deleted successfully' });
        });
    });
});

module.exports = router;
