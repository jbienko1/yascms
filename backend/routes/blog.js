const express = require('express');
const { all, run, get } = require('../db');

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get('/blog', async (req, res) => {
  try {
    const rows = await all(
      'SELECT id, title, slug, created_at FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

publicRouter.get('/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const row = await get(
      'SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1',
      [slug]
    );
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/blog', async (req, res) => {
  try {
    const rows = await all(
      'SELECT id, title, slug, content, created_at, updated_at, is_published FROM blog_posts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/blog', async (req, res) => {
  try {
    const { title, slug, content, is_published = 1 } = req.body;
    if (!title || !slug || !content) {
      return res
        .status(400)
        .json({ error: 'Title, slug and content are required' });
    }
    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO blog_posts (title, slug, content, created_at, updated_at, is_published) VALUES (?, ?, ?, ?, ?, ?)',
      [title, slug, content, now, now, is_published ? 1 : 0]
    );
    const created = await get('SELECT * FROM blog_posts WHERE id = ?', [
      result.lastID
    ]);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, is_published } = req.body;
    const existing = await get('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }
    const now = new Date().toISOString();
    await run(
      'UPDATE blog_posts SET title = ?, slug = ?, content = ?, updated_at = ?, is_published = ? WHERE id = ?',
      [
        title ?? existing.title,
        slug ?? existing.slug,
        content ?? existing.content,
        now,
        is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
        id
      ]
    );
    const updated = await get('SELECT * FROM blog_posts WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM blog_posts WHERE id = ?', [id]);
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

