const express = require('express');
const router = express.Router();
const connection = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// GET all groups for the logged-in user
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    connection.query('SELECT id, name, user_id FROM `user_groups` WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// POST route to add a new group
router.post('/', authenticateToken, (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    connection.query('INSERT INTO `user_groups` (name, user_id) VALUES (?, ?)', [name, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Group added successfully', group: { id: results.insertId, name, userId } });
    });
});
// PUT route to update a group
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    connection.query('UPDATE `user_groups` SET name = ? WHERE id = ? AND user_id = ?', [name, id, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json({ message: 'Group updated successfully', group: { id, name } });
    });
});

// DELETE route to delete a group
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    connection.query('DELETE FROM `user_groups` WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json({ message: 'Group deleted successfully' });
    });
});

module.exports = router;
