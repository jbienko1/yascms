async function loadBlogPost() {
  const container = document.getElementById('blog-post');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    container.innerHTML = '<p>Nieprawidłowy adres wpisu.</p>';
    return;
  }

  container.innerHTML = 'Ładowanie...';

  try {
    const res = await fetch('/api/blog/' + encodeURIComponent(slug));
    if (!res.ok) {
      container.innerHTML = '<p>Nie znaleziono wpisu.</p>';
      return;
    }
    const post = await res.json();
    const date = new Date(post.created_at).toLocaleDateString('pl-PL');
    container.innerHTML = `
      <h1 class="page-title" style="margin-top:0">${post.title}</h1>
      <div class="page-subtitle">Opublikowano: ${date}</div>
      <div>${post.content}</div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Wystąpił błąd ładowania wpisu.</p>';
  }
}

loadBlogPost();

