async function loadHome() {
  const kbBox = document.getElementById('home-kb');
  if (!kbBox) return;

  kbBox.textContent = 'Ładowanie...';

  try {
    const res = await fetch('/api/home');
    if (!res.ok) throw new Error('Fetch error');
    const { kbFeatured } = await res.json();

    if (!kbFeatured.length) {
      kbBox.innerHTML = '<p>Brak aktualności.</p>';
    } else {
      kbBox.innerHTML = `
        <ul class="list">
          ${kbFeatured
            .map((a) => {
              const date = new Date(a.created_at).toLocaleDateString('pl-PL');
              return `
                <li class="list-item">
                  <div class="list-item-title">
                    <a href="/kb-article.html?slug=${encodeURIComponent(a.slug)}">${a.title}</a>
                  </div>
                  <div class="list-item-meta">
                    ${a.category || 'Inne'} · ${date}
                  </div>
                </li>
              `;
            })
            .join('')}
        </ul>
      `;
    }
  } catch (err) {
    console.error(err);
    kbBox.innerHTML = '<p>Błąd ładowania danych strony głównej.</p>';
  }
}

loadHome();

async function loadHomeBlog() {
  const container = document.getElementById('home-blog');
  if (!container) return;

  try {
    const res = await fetch('/api/blog/home');
    if (!res.ok) throw new Error('Fetch error');
    const posts = await res.json();
    if (!posts.length) {
      container.innerHTML = '<p>Brak aktualności.</p>';
      return;
    }
    container.innerHTML = `
      <div class="cards">
        ${posts.map(p => `
          <article class="card" role="link" tabindex="0" onclick="window.location.href='/blog-post.html?slug=${encodeURIComponent(p.slug)}'" onkeydown="if(event.key === 'Enter' || event.key === ' '){ window.location.href='/blog-post.html?slug=${encodeURIComponent(p.slug)}'; }" style="cursor: pointer">
            <h3>${p.title}</h3>
            <p class="list-item-meta">${new Date(p.created_at).toLocaleDateString('pl-PL')}</p>
          </article>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Błąd ładowania aktualności.</p>';
  }
}

loadHomeBlog();
