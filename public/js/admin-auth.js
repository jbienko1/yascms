const loginForm = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    const password = document.getElementById('password').value;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        errorBox.textContent = 'Nieprawidłowe hasło.';
        errorBox.style.display = 'block';
        return;
      }
      window.location.href = '/admin/dashboard.html';
    } catch (err) {
      console.error(err);
      errorBox.textContent = 'Wystąpił błąd logowania.';
      errorBox.style.display = 'block';
    }
  });
}

