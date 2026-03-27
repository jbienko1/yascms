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

