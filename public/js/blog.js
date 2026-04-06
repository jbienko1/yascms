async function loadBlogList() {
  const container = document.getElementById('blog-list');
  if (!container) return;

  container.innerHTML = 'Ładowanie...';

  try {
    const res = await fetch('/api/blog');
    if (!res.ok) throw new Error('Fetch error');
    const posts = await res.json();
    if (!posts.length) {
      container.innerHTML = '<p>Brak wpisów na blogu.</p>';
      return;
    }
    container.innerHTML = `
      <ul class="blog-list">
        ${posts
          .map((p) => {
            const date = new Date(p.created_at).toLocaleDateString('pl-PL');
            return `
              <li class="blog-list-item">
                <div class="blog-list-item-title">
                  <a href="/blog-post.html?slug=${encodeURIComponent(
                    p.slug
                  )}">${p.title}</a>
                </div>
                <div class="blog-list-item-meta">${date}</div>
              </li>
            `;
          })
          .join('')}
      </ul>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Wystąpił błąd ładowania bloga.</p>';
  }
}

loadBlogList();

