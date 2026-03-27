const express = require('express');
const { all, run, get } = require('../db');

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get('/kb', async (req, res) => {
  try {
    const rows = await all(
      'SELECT id, title, slug, category, created_at FROM kb_articles WHERE is_published = 1 ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

publicRouter.get('/kb/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const row = await get(
      'SELECT * FROM kb_articles WHERE slug = ? AND is_published = 1',
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

adminRouter.get('/kb', async (req, res) => {
  try {
    const rows = await all(
      'SELECT id, title, slug, category, content, created_at, updated_at, is_published, show_on_home FROM kb_articles ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/kb', async (req, res) => {
  try {
    const { title, slug, category, content, is_published = 1, show_on_home = 0 } =
      req.body;
    if (!title || !slug || !content) {
      return res
        .status(400)
        .json({ error: 'Title, slug and content are required' });
    }
    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO kb_articles (title, slug, category, content, created_at, updated_at, is_published, show_on_home) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        slug,
        category || null,
        content,
        now,
        now,
        is_published ? 1 : 0,
        show_on_home ? 1 : 0
      ]
    );
    const created = await get('SELECT * FROM kb_articles WHERE id = ?', [
      result.lastID
    ]);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/kb/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, category, content, is_published, show_on_home } = req.body;
    const existing = await get('SELECT * FROM kb_articles WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }
    const now = new Date().toISOString();
    await run(
      'UPDATE kb_articles SET title = ?, slug = ?, category = ?, content = ?, updated_at = ?, is_published = ?, show_on_home = ? WHERE id = ?',
      [
        title ?? existing.title,
        slug ?? existing.slug,
        category ?? existing.category,
        content ?? existing.content,
        now,
        is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
        show_on_home !== undefined
          ? show_on_home
            ? 1
            : 0
          : existing.show_on_home,
        id
      ]
    );
    const updated = await get('SELECT * FROM kb_articles WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/kb/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM kb_articles WHERE id = ?', [id]);
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

