async function loadKbList() {
  const container = document.getElementById('kb-list');
  if (!container) return;

  container.innerHTML = 'Ładowanie...';

  try {
    const res = await fetch('/api/kb');
    if (!res.ok) throw new Error('Fetch error');
    const articles = await res.json();
    if (!articles.length) {
      container.innerHTML = '<p>Brak artykułów w bazie wiedzy.</p>';
      return;
    }

    const byCategory = {};
    for (const a of articles) {
      const cat = a.category || 'Inne';
      byCategory[cat] = byCategory[cat] || [];
      byCategory[cat].push(a);
    }

    container.innerHTML = Object.entries(byCategory)
      .map(([cat, list]) => {
        return `
          <h3>${cat}</h3>
          <ul class="list">
            ${list
              .map((a) => {
                const date = new Date(a.created_at).toLocaleDateString('pl-PL');
                return `
                  <li class="list-item">
                    <div class="list-item-title">
                      <a href="/kb-article.html?slug=${encodeURIComponent(
                        a.slug
                      )}">${a.title}</a>
                    </div>
                    <div class="list-item-meta">Dodano: ${date}</div>
                  </li>
                `;
              })
              .join('')}
          </ul>
        `;
      })
      .join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Wystąpił błąd ładowania bazy wiedzy.</p>';
  }
}

loadKbList();

