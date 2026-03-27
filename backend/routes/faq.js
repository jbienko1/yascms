const express = require('express');
const { all, run, get } = require('../db');

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get('/faq', async (req, res) => {
  try {
    const rows = await all(
      'SELECT * FROM faq WHERE is_published = 1 ORDER BY sort_order, id'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/faq', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM faq ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/faq', async (req, res) => {
  try {
    const {
      question,
      answer,
      sort_order = 0,
      is_published = 1,
      show_on_home = 0
    } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }
    const result = await run(
      'INSERT INTO faq (question, answer, sort_order, is_published, show_on_home) VALUES (?, ?, ?, ?, ?)',
      [question, answer, sort_order, is_published ? 1 : 0, show_on_home ? 1 : 0]
    );
    const created = await get('SELECT * FROM faq WHERE id = ?', [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      answer,
      sort_order = 0,
      is_published = 1,
      show_on_home
    } = req.body;
    const existing = await get('SELECT * FROM faq WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }
    await run(
      'UPDATE faq SET question = ?, answer = ?, sort_order = ?, is_published = ?, show_on_home = ? WHERE id = ?',
      [
        question ?? existing.question,
        answer ?? existing.answer,
        sort_order ?? existing.sort_order,
        is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
        show_on_home !== undefined ? (show_on_home ? 1 : 0) : existing.show_on_home,
        id
      ]
    );
    const updated = await get('SELECT * FROM faq WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM faq WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = {
  publicRouter,
  adminRouter
};

