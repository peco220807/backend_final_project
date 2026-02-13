function row(item) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>
      <div style="display:flex;gap:10px;align-items:center">
        <div style="width:56px;height:70px;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:rgba(255,255,255,.03)">
          <img src="${item.product.image}" alt="${item.product.name}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div>
          <div>${item.product.name}</div>
          <div class="small">${item.product.category}</div>
        </div>
      </div>
    </td>
    <td class="right">$${Number(item.product.price).toFixed(2)}</td>
    <td class="right">
      <input class="input" type="number" min="1" max="50" value="${item.qty}" style="width:88px;text-align:right">
    </td>
    <td class="right">$${Number(item.lineTotal).toFixed(2)}</td>
    <td class="right"><button class="btn" data-del>Remove</button></td>
  `;

  const qtyInput = tr.querySelector('input');
  qtyInput.onchange = async () => {
    const qty = Math.max(1, Math.min(50, parseInt(qtyInput.value || '1', 10)));
    qtyInput.value = String(qty);
    await api('/api/cart/' + item.id, { method: 'PUT', body: JSON.stringify({ qty }) });
    await loadCart();
    await updateCartCount();
  };

  tr.querySelector('[data-del]').onclick = async () => {
    await api('/api/cart/' + item.id, { method: 'DELETE' });
    toast('Removed');
    await loadCart();
    await updateCartCount();
  };

  return tr;
}

async function loadCart() {
  const me = await api('/api/auth/me', { method: 'GET' });
  if (!me.user) { location.href = '/login'; return; }

  const out = await api('/api/cart', { method: 'GET' });
  const tbody = document.querySelector('#cartBody');
  const totalEl = document.querySelector('#cartTotal');
  const emptyEl = document.querySelector('#cartEmpty');

  tbody.innerHTML = '';

  if (!out.items || out.items.length === 0) {
    emptyEl.classList.remove('hidden');
    totalEl.textContent = '$0.00';
    return;
  }

  emptyEl.classList.add('hidden');
  out.items.forEach(it => tbody.appendChild(row(it)));
  totalEl.textContent = '$' + Number(out.total).toFixed(2);
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('#clearCart').onclick = async () => {
    await api('/api/cart/clear', { method: 'POST' });
    toast('Cart cleared');
    await loadCart();
    await updateCartCount();
  };

  document.querySelector('#checkout').onclick = () => {
    location.href = '/orders';
  };

  loadCart();
});
