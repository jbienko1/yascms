async function loadKbAdmin() {
  const tbody = document.querySelector('#kb-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Ładowanie...</td></tr>';
  try {
    const res = await fetch('/api/admin/kb');
    const articles = await res.json();
    if (!articles.length) {
      tbody.innerHTML = '<tr><td colspan="7">Brak artykułów.</td></tr>';
      return;
    }
    tbody.innerHTML = articles
      .map(
        (a) => `
        <tr>
          <td>${a.id}</td>
          <td>${a.title}</td>
          <td>${a.category || ''}</td>
          <td>${a.slug}</td>
          <td>
            <span class="badge ${
              a.is_published ? 'badge-success' : 'badge-muted'
            }">
              ${a.is_published ? 'Opublikowane' : 'Ukryte'}
            </span>
          </td>
          <td>
            ${a.show_on_home ? 'Na stronie głównej' : ''}
          </td>
          <td>
            <button class="btn btn-secondary btn-xs" data-edit="${a.id}">Edytuj</button>
            <button class="btn btn-secondary btn-xs" data-delete="${a.id}">Usuń</button>
          </td>
        </tr>
      `
      )
      .join('');

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () =>
        fillKbForm(articles.find((a) => a.id == btn.dataset.edit))
      );
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => deleteKb(btn.dataset.delete));
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="7">Błąd ładowania artykułów.</td></tr>';
  }
}

function fillKbForm(article) {
  document.getElementById('kb-id').value = article.id;
  document.getElementById('kb-title').value = article.title;
  document.getElementById('kb-slug').value = article.slug;
  document.getElementById('kb-category').value = article.category || '';
  setRichHtml('kb-content', article.content || '');
  document.getElementById('kb-published').checked = !!article.is_published;
  const onHome = document.getElementById('kb-on-home');
  if (onHome) onHome.checked = !!article.show_on_home;
}

async function deleteKb(id) {
  if (!confirm('Usunąć ten artykuł?')) return;
  try {
    await fetch('/api/admin/kb/' + id, { method: 'DELETE' });
    loadKbAdmin();
  } catch (err) {
    console.error(err);
  }
}

const kbForm = document.getElementById('kb-form');
const kbReset = document.getElementById('kb-reset');

if (kbForm) {
  kbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('kb-id').value;
    const payload = {
      title: document.getElementById('kb-title').value,
      slug: document.getElementById('kb-slug').value,
      category: document.getElementById('kb-category').value,
      content: getRichHtml('kb-content'),
      is_published: document.getElementById('kb-published').checked,
      show_on_home: document.getElementById('kb-on-home').checked
    };
    const url = id ? '/api/admin/kb/' + id : '/api/admin/kb';
    const method = id ? 'PUT' : 'POST';
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      document.getElementById('kb-id').value = '';
      clearRichHtml('kb-content');
      kbForm.reset();
      loadKbAdmin();
    } catch (err) {
      console.error(err);
      alert('Błąd zapisu artykułu.');
    }
  });
}

if (kbReset) {
  kbReset.addEventListener('click', () => {
    document.getElementById('kb-id').value = '';
    clearRichHtml('kb-content');
    kbForm.reset();
  });
}

function startKbAdmin() {
  loadKbAdmin();
}

if (document.querySelector('textarea[data-rich-editor]')) {
  document.addEventListener('rich-editor-ready', startKbAdmin, { once: true });
} else {
  startKbAdmin();
}
