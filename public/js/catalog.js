let allProducts = [];
let allMasters = [];

function getBadgeClass(status) {
  if (status === 'В наличии') return 'badge available';
  if (status === 'На заказ') return 'badge order';
  return 'badge portfolio';
}

function renderProducts(products) {
  const container = document.getElementById('products-list');

  if (!products.length) {
    container.innerHTML = '<div class="card">Ничего не найдено по выбранным фильтрам.</div>';
    return;
  }

  container.innerHTML = products.map(product => {
    const master = allMasters.find(m => m.id === product.masterId);

    return `
      <div class="product-card">
        <img src="${product.images[0]}" alt="${product.title}">
        <div class="product-body">
          <span class="${getBadgeClass(product.status)}">${product.status}</span>
          <h3>${product.title}</h3>
          <p>${product.category}</p>
          <p><strong>${product.price} ₽</strong></p>
          <p>Мастер: ${master ? master.name : '—'}</p>
          <p>Количество: ${product.stock}</p>
          <a class="button" href="/product.html?id=${product.id}">Открыть карточку</a>
        </div>
      </div>
    `;
  }).join('');
}

function applyFilters() {
  const category = document.getElementById('filter-category').value;
  const master = document.getElementById('filter-master').value;
  const status = document.getElementById('filter-status').value;
  const material = document.getElementById('filter-material').value.trim().toLowerCase();
  const maxPrice = document.getElementById('filter-price').value;

  const filtered = allProducts.filter(product => {
    const byCategory = !category || product.category === category;
    const byMaster = !master || String(product.masterId) === String(master);
    const byStatus = !status || product.status === status;
    const byMaterial = !material || product.materials.some(item => item.toLowerCase().includes(material));
    const byPrice = !maxPrice || product.price <= Number(maxPrice);

    return byCategory && byMaster && byStatus && byMaterial && byPrice;
  });

  renderProducts(filtered);
}

async function loadCatalog() {
  const [productsRes, categoriesRes, mastersRes] = await Promise.all([
    fetch('/api/products'),
    fetch('/api/categories'),
    fetch('/api/masters')
  ]);

  allProducts = await productsRes.json();
  const categories = await categoriesRes.json();
  allMasters = await mastersRes.json();

  const categorySelect = document.getElementById('filter-category');
  const masterSelect = document.getElementById('filter-master');

  categorySelect.innerHTML += categories.map(category => `
    <option value="${category.name}">${category.name}</option>
  `).join('');

  masterSelect.innerHTML += allMasters.map(master => `
    <option value="${master.id}">${master.name}</option>
  `).join('');

  const params = new URLSearchParams(window.location.search);
  const categoryFromUrl = params.get('category');

  if (categoryFromUrl) {
    categorySelect.value = categoryFromUrl;
  }

  document.getElementById('filter-category').addEventListener('change', applyFilters);
  document.getElementById('filter-master').addEventListener('change', applyFilters);
  document.getElementById('filter-status').addEventListener('change', applyFilters);
  document.getElementById('filter-material').addEventListener('input', applyFilters);
  document.getElementById('filter-price').addEventListener('input', applyFilters);

  applyFilters();
}

loadCatalog();