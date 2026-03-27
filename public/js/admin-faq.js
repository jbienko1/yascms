async function loadFaqAdmin() {
  const tbody = document.querySelector('#faq-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6">Ładowanie...</td></tr>';
  try {
    const res = await fetch('/api/admin/faq');
    const items = await res.json();
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6">Brak pozycji FAQ.</td></tr>';
      return;
    }
    tbody.innerHTML = items
      .map(
        (i) => `
        <tr>
          <td>${i.id}</td>
          <td>${i.question}</td>
          <td>${i.sort_order}</td>
          <td>
            <span class="badge ${
              i.is_published ? 'badge-success' : 'badge-muted'
            }">
              ${i.is_published ? 'Opublikowane' : 'Ukryte'}
            </span>
          </td>
          <td>
            ${i.show_on_home ? 'Na stronie głównej' : ''}
          </td>
          <td>
            <button class="btn btn-secondary btn-xs" data-edit="${i.id}">Edytuj</button>
            <button class="btn btn-secondary btn-xs" data-delete="${i.id}">Usuń</button>
          </td>
        </tr>
      `
      )
      .join('');

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => fillFaqForm(items.find((i) => i.id == btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => deleteFaq(btn.dataset.delete));
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="6">Błąd ładowania FAQ.</td></tr>';
  }
}

function fillFaqForm(item) {
  document.getElementById('faq-id').value = item.id;
  document.getElementById('faq-question').value = item.question;
  setRichHtml('faq-answer', item.answer || '');
  document.getElementById('faq-sort').value = item.sort_order;
  document.getElementById('faq-published').checked = !!item.is_published;
  const onHome = document.getElementById('faq-on-home');
  if (onHome) onHome.checked = !!item.show_on_home;
}

async function deleteFaq(id) {
  if (!confirm('Usunąć tę pozycję FAQ?')) return;
  try {
    await fetch('/api/admin/faq/' + id, { method: 'DELETE' });
    loadFaqAdmin();
  } catch (err) {
    console.error(err);
  }
}

const faqForm = document.getElementById('faq-form');
const faqReset = document.getElementById('faq-reset');

if (faqForm) {
  faqForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('faq-id').value;
    const payload = {
      question: document.getElementById('faq-question').value,
      answer: getRichHtml('faq-answer'),
      sort_order: parseInt(document.getElementById('faq-sort').value || '0', 10),
      is_published: document.getElementById('faq-published').checked,
      show_on_home: document.getElementById('faq-on-home').checked
    };
    const url = id ? '/api/admin/faq/' + id : '/api/admin/faq';
    const method = id ? 'PUT' : 'POST';
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      document.getElementById('faq-id').value = '';
      clearRichHtml('faq-answer');
      faqForm.reset();
      loadFaqAdmin();
    } catch (err) {
      console.error(err);
      alert('Błąd zapisu FAQ.');
    }
  });
}

if (faqReset) {
  faqReset.addEventListener('click', () => {
    document.getElementById('faq-id').value = '';
    clearRichHtml('faq-answer');
    faqForm.reset();
  });
}

function startFaqAdmin() {
  loadFaqAdmin();
}

if (document.querySelector('textarea[data-rich-editor]')) {
  document.addEventListener('rich-editor-ready', startFaqAdmin, { once: true });
} else {
  startFaqAdmin();
}
