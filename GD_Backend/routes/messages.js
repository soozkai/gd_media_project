const express = require('express');
const router = express.Router();
const connection = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/authMiddleware');

// Configure multer for multiple file uploads with disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
    }
});

const upload = multer({ storage: storage });

// GET route to fetch messages with user group names
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT m.id, m.title, m.description, m.start_date, m.end_date, m.file_type, m.content, m.selected_rooms,
        GROUP_CONCAT(r.room_number) as room_numbers, ug.name as group_name, m.group_id
        FROM messages m
        LEFT JOIN rooms r ON JSON_CONTAINS(m.selected_rooms, CAST(r.id AS JSON), '$')
        LEFT JOIN user_groups ug ON m.group_id = ug.id
        WHERE m.user_id = ?
        GROUP BY m.id
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Parse the content and selected_rooms fields
        results = results.map((message) => ({
            ...message,
            content: typeof message.content === 'string' && message.content.startsWith('[')
                ? JSON.parse(message.content)
                : message.content,
            selected_rooms: typeof message.selected_rooms === 'string' && message.selected_rooms.startsWith('[')
                ? JSON.parse(message.selected_rooms)
                : message.selected_rooms,
        }));

        res.json(results);
    });
});

// POST route for adding a new message with multiple files, selected rooms, and group
router.post('/add', authenticateToken, upload.array('content', 5), (req, res) => {
    const { title, description, start_date, end_date, file_type, selectedRooms, group_id } = req.body;
    const files = req.files.map(file => file.filename); 
    const content = JSON.stringify(files); 
    const userId = req.user.id;

    const query = 'INSERT INTO messages (title, description, start_date, end_date, file_type, content, user_id, selected_rooms, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [title, description, start_date, end_date, file_type, content, userId, selectedRooms, group_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Message added successfully', message: { id: results.insertId, ...req.body, content: files } });
    });
});

// PUT route for updating a message with multiple files, selected rooms, and group
router.put('/:id', authenticateToken, upload.array('content', 5), (req, res) => {
    const { id } = req.params;
    const { title, description, start_date, end_date, file_type, selectedRooms, group_id } = req.body;
    const userId = req.user.id;

    let content;
    if (req.files.length > 0) {
        const files = req.files.map(file => file.filename);
        content = JSON.stringify(files); // Store filenames as a JSON string
    }

    let query = 'UPDATE messages SET title = ?, description = ?, start_date = ?, end_date = ?, file_type = ?, selected_rooms = ?, group_id = ?';
    const params = [title, description, start_date, end_date, file_type, selectedRooms, group_id];

    if (content) {
        query += ', content = ?';
        params.push(content);
    }

    query += ' WHERE id = ? AND user_id = ?';
    params.push(id, userId);

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ message: 'Message updated successfully', results });
    });
});

// DELETE route for deleting a message and its associated files
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // First, retrieve the message to delete the files from the filesystem
    connection.query('SELECT content FROM messages WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const message = results[0];
        let files = [];
        if (message.content) {
            try {
                const contentString = typeof message.content === 'string' ? message.content.replace(/'/g, '"') : JSON.stringify(message.content);
                files = JSON.parse(contentString);
            } catch (parseError) {
                console.error('Error parsing content:', parseError, 'Content:', message.content);
                files = []; // Fallback to an empty array if parsing fails
            }

            files.forEach(file => {
                const filePath = path.join(__dirname, '..', 'uploads', file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File deleted:', filePath);
                    }
                });
            });
        }

        // Then, delete the message record from the database
        connection.query('DELETE FROM messages WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Message deleted successfully' });
        });
    });
});

module.exports = router;
