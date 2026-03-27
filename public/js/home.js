async function loadHome() {
  const faqBox = document.getElementById('home-faq');
  const newsBox = document.getElementById('home-news');
  const kbBox = document.getElementById('home-kb');

  if (!faqBox || !newsBox || !kbBox) return;

  faqBox.textContent = 'Ładowanie...';
  newsBox.textContent = 'Ładowanie...';
  kbBox.textContent = 'Ładowanie...';

  try {
    const res = await fetch('/api/home');
    if (!res.ok) throw new Error('Fetch error');
    const { faqFeatured, blogLatest, kbFeatured } = await res.json();

    // FAQ
    if (!faqFeatured.length) {
      faqBox.innerHTML = '<p>Brak wyróżnionych pytań.</p>';
    } else {
      faqBox.innerHTML = faqFeatured
        .map(
          (i) => `
          <div class="faq-item open">
            <div class="faq-question">
              <span>${i.question}</span>
            </div>
            <div class="faq-answer" style="display:block">${i.answer}</div>
          </div>
        `
        )
        .join('');
    }

    // News (blog)
    if (!blogLatest.length) {
      newsBox.innerHTML = '<p>Brak newsów.</p>';
    } else {
      newsBox.innerHTML = `
        <ul class="list">
          ${blogLatest
            .map((p) => {
              const date = new Date(p.created_at).toLocaleDateString('pl-PL');
              return `
                <li class="list-item">
                  <div class="list-item-title">
                    <a href="/blog-post.html?slug=${encodeURIComponent(
                      p.slug
                    )}">${p.title}</a>
                  </div>
                  <div class="list-item-meta">Dodano: ${date}</div>
                </li>
              `;
            })
            .join('')}
        </ul>
      `;
    }

    // KB
    if (!kbFeatured.length) {
      kbBox.innerHTML = '<p>Brak wyróżnionych artykułów.</p>';
    } else {
      kbBox.innerHTML = `
        <ul class="list">
          ${kbFeatured
            .map((a) => {
              const date = new Date(a.created_at).toLocaleDateString('pl-PL');
              return `
                <li class="list-item">
                  <div class="list-item-title">
                    <a href="/kb-article.html?slug=${encodeURIComponent(
                      a.slug
                    )}">${a.title}</a>
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
    faqBox.innerHTML = '<p>Błąd ładowania danych strony głównej.</p>';
    newsBox.innerHTML = '';
    kbBox.innerHTML = '';
  }
}

loadHome();

