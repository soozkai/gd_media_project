const express = require('express');
const router = express.Router();
const connection = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET all apps for the logged-in user
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    connection.query('SELECT id, packageName, user_id FROM `apps` WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// POST route to add a new app
router.post('/add', authenticateToken, (req, res) => {
    const { packageName } = req.body;
    const userId = req.user.id;

    if (!packageName) {
        return res.status(400).json({ error: 'Package name is required' });
    }

    connection.query('INSERT INTO `apps` (packageName, user_id) VALUES (?, ?)', [packageName, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'App added successfully', app: { id: results.insertId, packageName, userId } });
    });
});

// PUT route to update an app
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { packageName } = req.body;
    const userId = req.user.id;

    if (!packageName) {
        return res.status(400).json({ error: 'Package name is required' });
    }

    connection.query('UPDATE `apps` SET packageName = ? WHERE id = ? AND user_id = ?', [packageName, id, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'App not found' });
        }
        res.json({ message: 'App updated successfully', app: { id, packageName } });
    });
});

// DELETE route to delete an app
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    connection.query('DELETE FROM `apps` WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'App not found' });
        }
        res.json({ message: 'App deleted successfully' });
    });
});

module.exports = router;