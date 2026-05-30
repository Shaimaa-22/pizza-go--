const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', handleRegister);

async function handleRegister(event) {
  event.preventDefault();

  const full_name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  setLoader(true, 'Creating your account...');

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name, email, password }),
    });

    const loginData = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    saveSession(loginData.token, loginData.user);
    showToast('Account created successfully.');
    window.location.href = './order.html';
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoader(false);
  }
}