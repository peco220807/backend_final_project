let editingId = null;
let page = 1;

function fillForm(p) {
  const f = document.querySelector('#productForm');
  f.name.value = p?.name || '';
  f.category.value = p?.category || '';
  f.price.value = p?.price ?? '';
  f.image.value = p?.image || '/imgs/placeholder.jpg';
  f.description.value = p?.description || '';
  editingId = p?._id || null;

  document.querySelector('#formTitle').textContent = editingId ? 'Edit product' : 'Add product';
  document.querySelector('#cancelEdit').classList.toggle('hidden', !editingId);
}

function productRow(p) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${p.name}</td>
    <td class="small">${p.category}</td>
    <td class="right">$${Number(p.price).toFixed(2)}</td>
    <td class="small">${p.image}</td>
    <td class="right">
      <button class="btn" data-edit>Edit</button>
      <button class="btn" data-del>Disable</button>
    </td>
  `;

  tr.querySelector('[data-edit]').onclick = () => fillForm(p);

  tr.querySelector('[data-del]').onclick = async () => {
    if (!confirm('Disable this product?')) return;
    await api('/api/products/' + p._id, { method: 'DELETE' });
    toast('Disabled');
    await loadProducts();
  };

  return tr;
}

async function loadProducts() {
  const q = new URLSearchParams({ page: String(page), limit: '12' });
  const out = await api('/api/products?' + q.toString(), { method: 'GET' });

  const tbody = document.querySelector('#productsBody');
  tbody.innerHTML = '';
  out.items.forEach(p => tbody.appendChild(productRow(p)));

  document.querySelector('#pageMeta').textContent = `page ${out.page}/${out.pages || 1} · ${out.total} active products`;

  const prev = document.querySelector('#prev');
  const next = document.querySelector('#next');
  prev.disabled = page <= 1;
  next.disabled = page >= (out.pages || 1);

  prev.onclick = () => { if (page > 1) { page--; loadProducts(); } };
  next.onclick = () => { if (page < (out.pages || 1)) { page++; loadProducts(); } };
}

document.addEventListener('DOMContentLoaded', async () => {
  const me = await api('/api/auth/me', { method: 'GET' });
  if (!me.user) { location.href = '/login'; return; }
  if (me.user.role !== 'admin') { location.href = '/'; return; }

  fillForm(null);
  loadProducts();

  const form = document.querySelector('#productForm');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      category: form.category.value.trim(),
      price: Number(form.price.value),
      image: form.image.value.trim() || '/imgs/placeholder.jpg',
      description: form.description.value.trim()
    };

    try {
      if (editingId) {
        await api('/api/products/' + editingId, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Updated');
      } else {
        await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
        toast('Created');
      }
      fillForm(null);
      await loadProducts();
    } catch (err) {
      toast(err.message);
    }
  };

  document.querySelector('#cancelEdit').onclick = () => fillForm(null);
});
