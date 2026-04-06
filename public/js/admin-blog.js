async function loadBlogAdmin() {
  const tbody = document.querySelector('#blog-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5">Ładowanie...</td></tr>';
  try {
    const res = await fetch('/api/admin/blog');
    const posts = await res.json();
    if (!posts.length) {
      tbody.innerHTML = '<tr><td colspan="5">Brak wpisów.</td></tr>';
      return;
    }
    tbody.innerHTML = posts
      .map(
        (p) => `
        <tr>
          <td>${p.id}</td>
          <td>${p.title}</td>
          <td>${p.slug}</td>
          <td>
            <span class="badge ${
              p.is_published ? 'badge-success' : 'badge-muted'
            }">
              ${p.is_published ? 'Opublikowane' : 'Szkic'}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary btn-xs" data-edit="${p.id}">Edytuj</button>
            <button class="btn btn-secondary btn-xs" data-delete="${p.id}">Usuń</button>
          </td>
        </tr>
      `
      )
      .join('');

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () =>
        fillBlogForm(posts.find((p) => p.id == btn.dataset.edit))
      );
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => deleteBlog(btn.dataset.delete));
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="5">Błąd ładowania wpisów.</td></tr>';
  }
}

function fillBlogForm(post) {
  document.getElementById('blog-id').value = post.id;
  document.getElementById('blog-title').value = post.title;
  document.getElementById('blog-slug').value = post.slug;
  setRichHtml('blog-content', post.content || '');
  document.getElementById('blog-published').checked = !!post.is_published;
  const onHome = document.getElementById('blog-on-home');
  if (onHome) onHome.checked = !!post.show_on_home;
}

async function deleteBlog(id) {
  if (!confirm('Usunąć ten wpis?')) return;
  try {
    await fetch('/api/admin/blog/' + id, { method: 'DELETE' });
    loadBlogAdmin();
  } catch (err) {
    console.error(err);
  }
}

const blogForm = document.getElementById('blog-form');
const blogReset = document.getElementById('blog-reset');

if (blogForm) {
  blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('blog-id').value;
    const payload = {
      title: document.getElementById('blog-title').value,
      slug: document.getElementById('blog-slug').value,
      content: getRichHtml('blog-content'),
      is_published: document.getElementById('blog-published').checked,
      show_on_home: document.getElementById('blog-on-home')?.checked ?? false
    };
    const url = id ? '/api/admin/blog/' + id : '/api/admin/blog';
    const method = id ? 'PUT' : 'POST';
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      document.getElementById('blog-id').value = '';
      clearRichHtml('blog-content');
      blogForm.reset();
      loadBlogAdmin();
    } catch (err) {
      console.error(err);
      alert('Błąd zapisu wpisu.');
    }
  });
}

if (blogReset) {
  blogReset.addEventListener('click', () => {
    document.getElementById('blog-id').value = '';
    clearRichHtml('blog-content');
    blogForm.reset();
  });
}

function startBlogAdmin() {
  loadBlogAdmin();
}

if (document.querySelector('textarea[data-rich-editor]')) {
  document.addEventListener('rich-editor-ready', startBlogAdmin, { once: true });
} else {
  startBlogAdmin();
}