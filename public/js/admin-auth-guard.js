async function ensureAdmin() {
  try {
    const res = await fetch('/api/admin/me');
    const data = await res.json();
    if (!data.isAdmin) {
      window.location.href = '/admin/login.html';
    }
  } catch (err) {
    console.error(err);
    window.location.href = '/admin/login.html';
  }
}

async function setupLogout() {
  const link = document.getElementById('logout-link');
  if (!link) return;
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
    window.location.href = '/admin/login.html';
  });
}

ensureAdmin();
setupLogout();

