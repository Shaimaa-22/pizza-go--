const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', handleLogin);

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  setLoader(true, 'Logging in...');

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    saveSession(data.token, data.user);
    showToast('Logged in successfully.');
    window.location.href = './order.html';
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoader(false);
  }
}