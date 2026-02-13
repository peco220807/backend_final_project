let activeCategory = '';
let page = 1;

function renderCategories(categories) {
  const wrap = document.querySelector('#categories');
  wrap.innerHTML = '';

  const mk = (name) => {
    const div = document.createElement('div');
    div.className = 'cat' + (activeCategory === name ? ' active' : '');
    div.innerHTML = `<span>${name || 'All'}</span><span class="small">›</span>`;
    div.onclick = () => {
      activeCategory = name;
      page = 1;
      renderCategories(categories);
      loadProducts();
    };
    return div;
  };

  wrap.appendChild(mk(''));
  categories.forEach(c => wrap.appendChild(mk(c)));
}

function productCard(p) {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="product-img"><img src="${p.image}" alt="${p.name}" onerror="this.src='/imgs/placeholder.jpg'"></div>
    <div class="product-body">
      <p class="product-name">${p.name}</p>
      <div class="product-meta">
        <span>${p.category}</span>
        <span>$${Number(p.price).toFixed(2)}</span>
      </div>
      <p class="product-desc">${p.description}</p>
      <div class="product-actions">
        <button class="btn primary" data-add="${p._id}">Add to cart</button>
      </div>
    </div>
  `;
  el.querySelector('[data-add]').onclick = async () => {
    try {
      await api('/api/cart/add', { method: 'POST', body: JSON.stringify({ productId: p._id, qty: 1 }) });
      toast('Added to cart');
      await updateCartCount();
    } catch (e) {
      toast(e.message || 'Login required');
      if ((e.message || '').toLowerCase().includes('unauthorized')) location.href = '/login';
    }
  };
  return el;
}

async function loadProducts() {
  const grid = document.querySelector('#productGrid');
  const meta = document.querySelector('#resultsMeta');
  grid.innerHTML = '';
  meta.textContent = 'Loading…';

  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('limit', '12');
  if (activeCategory) q.set('category', activeCategory);

  const out = await api('/api/products?' + q.toString(), { method: 'GET' });
  out.items.forEach(p => grid.appendChild(productCard(p)));

  meta.textContent = `${out.total}  · page ${out.page}/${out.pages || 1}`;

  const prev = document.querySelector('#prevPage');
  const next = document.querySelector('#nextPage');

  prev.disabled = page <= 1;
  next.disabled = page >= (out.pages || 1);

  prev.onclick = () => { if (page > 1) { page--; loadProducts(); } };
  next.onclick = () => { if (page < (out.pages || 1)) { page++; loadProducts(); } };
}

document.addEventListener('DOMContentLoaded', async () => {
  const cats = await api('/api/products/categories', { method: 'GET' });
  renderCategories(cats.categories || []);
  loadProducts();
});
