async function loadKbArticle() {
  const container = document.getElementById('kb-article');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    container.innerHTML = '<p>Nieprawidłowy adres artykułu.</p>';
    return;
  }

  container.innerHTML = 'Ładowanie...';

  try {
    const res = await fetch('/api/kb/' + encodeURIComponent(slug));
    if (!res.ok) {
      container.innerHTML = '<p>Nie znaleziono artykułu.</p>';
      return;
    }
    const article = await res.json();
    const date = new Date(article.created_at).toLocaleDateString('pl-PL');
    container.innerHTML = `
      <h1 class="page-title" style="margin-top:0">${article.title}</h1>
      <div class="pub-date">
        Dodano: ${date}
      </div>
      <div class="page-subtitle">
        Kategoria: <b>${article.category || 'Inne'}</b>
      </div>
      <div>${article.content}</div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Wystąpił błąd ładowania artykułu.</p>';
  }
}

loadKbArticle();

