async function loadFaq() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.innerHTML = 'Ładowanie...';

  try {
    const res = await fetch('/api/faq');
    if (!res.ok) throw new Error('Fetch error');
    const items = await res.json();
    if (!items.length) {
      container.innerHTML = '<p>Brak pytań w FAQ.</p>';
      return;
    }
    container.innerHTML = items
      .map(
        (item) => `
        <div class="faq-item">
          <div class="faq-question">
            <span>${item.question}</span>
            <span>+</span>
          </div>
          <div class="faq-answer">${item.answer}</div>
        </div>
      `
      )
      .join('');

    container.addEventListener('click', (e) => {
      const header = e.target.closest('.faq-question');
      if (!header) return;
      const item = header.parentElement;
      item.classList.toggle('open');
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Wystąpił błąd ładowania FAQ.</p>';
  }
}

loadFaq();

