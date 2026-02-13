async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : {};
  if (!res.ok) {
    const msg = data.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return [...document.querySelectorAll(sel)]; }

function toast(message) {
  const el = $('#toast');
  if (!el) return alert(message);
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2400);
}

async function refreshMe() {
  const out = await api('/api/auth/me', { method: 'GET' }).catch(() => ({ user: null }));
  const user = out.user;

  const authSlot = $('#authSlot');
  if (authSlot) {
    authSlot.innerHTML = '';
    if (user) {
      const span = document.createElement('span');
      span.className = 'pill';
      span.textContent = user.email + (user.role === 'admin' ? ' (admin)' : '');
      authSlot.appendChild(span);

      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Logout';
      btn.onclick = async () => {
        await api('/api/auth/logout', { method: 'POST' });
        toast('Logged out');
        location.href = '/';
      };
      authSlot.appendChild(btn);

      const adminLink = $('#adminLink');
      if (adminLink) adminLink.style.display = user.role === 'admin' ? 'inline-flex' : 'none';
    } else {
      authSlot.innerHTML = `
        <a class="btn" href="/login">Login</a>
        <a class="btn primary" href="/register">Create account</a>
      `;
      const adminLink = $('#adminLink');
      if (adminLink) adminLink.style.display = 'none';
    }
  }
  return user;
}

async function updateCartCount() {
  const badge = $('#cartCount');
  if (!badge) return;

  const me = await api('/api/auth/me', { method: 'GET' }).catch(() => ({ user: null }));
  if (!me.user) { badge.textContent = '0'; return; }

  const cart = await api('/api/cart', { method: 'GET' }).catch(() => ({ items: [] }));
  const n = (cart.items || []).reduce((sum, it) => sum + (it.qty || 0), 0);
  badge.textContent = String(n);
}

document.addEventListener('DOMContentLoaded', async () => {
  await refreshMe();
  await updateCartCount();
});
