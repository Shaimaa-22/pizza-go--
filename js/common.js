const CONFIG = window.PIZZAGO_CONFIG || {};
const API_BASE_URL = (CONFIG.apiBaseUrl || 'http://localhost:3000').replace(/\/$/, '');

function setLoader(visible, text = 'Loading...') {
  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loaderText');
  if (!loader || !loaderText) return;
  loaderText.textContent = text;
  loader.classList.toggle('hidden', !visible);
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
}

function saveSession(token, user) {
  localStorage.setItem('pizza_go_token', token);
  localStorage.setItem('pizza_go_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('pizza_go_token');
  localStorage.removeItem('pizza_go_user');
  localStorage.removeItem('pizza_go_order');
  localStorage.removeItem('pizza_go_last_order_id');
}

function getToken() {
  return localStorage.getItem('pizza_go_token') || '';
}

function getUser() {
  return JSON.parse(localStorage.getItem('pizza_go_user') || 'null');
}

function setTopbarUser() {
  const user = getUser();
  const userChip = document.getElementById('userChip');
  const logoutBtn = document.getElementById('logoutBtn');

  if (userChip && user) {
    userChip.textContent = `Hi, ${user.full_name || user.email}`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = './login.html';
    });
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};
  const text = await response.text();

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = './login.html';
  }
}