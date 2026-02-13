async function loadMyOrders() {
  const out = await api('/api/orders/my', { method: 'GET' });
  const wrap = document.querySelector('#ordersList');
  wrap.innerHTML = '';

  if (!out.orders || out.orders.length === 0) {
    wrap.innerHTML = `<div class="small">No orders yet.</div>`;
    return;
  }

  out.orders.forEach(o => {
    const div = document.createElement('div');
    div.className = 'card pad';
    const date = new Date(o.createdAt).toLocaleString();
    div.innerHTML = `
      <div class="kicker">Order</div>
      <div class="h2">$${Number(o.total).toFixed(2)} <span class="small">· ${o.status} · ${date}</span></div>
      <div class="hr"></div>
      <div class="small">${o.items.map(it => `${it.qty}× ${it.name}`).join(' · ')}</div>
    `;
    wrap.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const me = await api('/api/auth/me', { method: 'GET' });
  if (!me.user) { location.href = '/login'; return; }

  document.querySelector('#placeOrder').onclick = async () => {
    try {
      const out = await api('/api/orders', { method: 'POST' });
      toast('Order created');
      await updateCartCount();
      await loadMyOrders();
      document.querySelector('#lastTotal').textContent = '$' + Number(out.order.total).toFixed(2);
      document.querySelector('#lastTotalCard').classList.remove('hidden');
    } catch (e) {
      toast(e.message);
    }
  };

  loadMyOrders();
});
