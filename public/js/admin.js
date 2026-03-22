async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  return response.json();
}

async function loadAdminLists() {
  const [products, categories] = await Promise.all([
    fetchJson('/api/products'),
    fetchJson('/api/categories')
  ]);

  const productsContainer = document.getElementById('admin-products');
  const categoriesContainer = document.getElementById('admin-categories');

  productsContainer.innerHTML = products.map(product => `
    <div class="list-row">
      <strong>${product.title}</strong><br>
      Статус: ${product.status}<br>
      Количество: ${product.stock}<br><br>
      <input type="number" id="stock-${product.id}" value="${product.stock}" />
      <button class="button secondary" onclick="updateStock(${product.id})">Изменить количество</button>
      <button class="button" onclick="deleteProduct(${product.id})">Удалить товар</button>
    </div>
  `).join('');

  categoriesContainer.innerHTML = categories.map(category => `
    <div class="list-row">
      <strong>${category.name}</strong><br>
      ${category.subcategories.join(', ')}<br><br>
      <button class="button" onclick="deleteCategory('${encodeURIComponent(category.name)}')">Удалить категорию</button>
    </div>
  `).join('');
}

async function updateStock(id) {
  const stock = Number(document.getElementById(`stock-${id}`).value);

  await fetchJson(`/api/products/${id}/stock`, {
    method: 'POST',
    body: JSON.stringify({ stock })
  });

  alert('Количество обновлено');
  loadAdminLists();
}

async function deleteProduct(id) {
  await fetchJson(`/api/products/${id}`, {
    method: 'DELETE'
  });

  alert('Товар удалён');
  loadAdminLists();
}

async function deleteCategory(encodedName) {
  await fetchJson(`/api/categories/${encodedName}`, {
    method: 'DELETE'
  });

  alert('Категория удалена');
  loadAdminLists();
}

document.getElementById('product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    title: formData.get('title'),
    category: formData.get('category'),
    subcategory: formData.get('subcategory'),
    materials: String(formData.get('materials')).split(',').map(s => s.trim()).filter(Boolean),
    description: formData.get('description'),
    price: Number(formData.get('price')),
    productionTime: formData.get('productionTime'),
    status: formData.get('status'),
    stock: Number(formData.get('stock')),
    options: String(formData.get('options')).split(',').map(s => s.trim()).filter(Boolean),
    masterId: Number(formData.get('masterId')),
    images: String(formData.get('images')).split(',').map(s => s.trim()).filter(Boolean),
    contacts: {
      telegram: 'https://t.me/example',
      email: 'example@mail.ru',
      max: 'https://max.ru'
    }
  };

  await fetchJson('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  alert('Товар добавлен');
  form.reset();
  loadAdminLists();
});

document.getElementById('category-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    name: formData.get('name'),
    subcategories: String(formData.get('subcategories')).split(',').map(s => s.trim()).filter(Boolean)
  };

  await fetchJson('/api/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  alert('Категория добавлена');
  form.reset();
  loadAdminLists();
});

document.getElementById('news-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    title: formData.get('title'),
    text: formData.get('text'),
    date: formData.get('date')
  };

  await fetchJson('/api/news', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  alert('Новость добавлена');
  form.reset();
});

document.getElementById('review-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    author: formData.get('author'),
    text: formData.get('text'),
    date: formData.get('date')
  };

  await fetchJson('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  alert('Отзыв добавлен');
  form.reset();
});

loadAdminLists();