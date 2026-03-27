const express = require('express');
const { all } = require('../db');

const publicRouter = express.Router();

publicRouter.get('/home', async (req, res) => {
  try {
    const [faqFeatured, blogLatest, kbFeatured] = await Promise.all([
      all(
        'SELECT id, question, answer FROM faq WHERE is_published = 1 AND show_on_home = 1 ORDER BY sort_order, id'
      ),
      all(
        'SELECT id, title, slug, created_at FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC LIMIT 5'
      ),
      all(
        'SELECT id, title, slug, category, created_at FROM kb_articles WHERE is_published = 1 AND show_on_home = 1 ORDER BY created_at DESC LIMIT 3'
      )
    ]);

    res.json({
      faqFeatured,
      blogLatest,
      kbFeatured
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = {
  publicRouter
};

