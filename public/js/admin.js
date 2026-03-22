async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options
  });
  return response.json();
}

async function uploadSingleImage(file, folder) {
  if (!file) return '';

  const formData = new FormData();
  formData.append('images', file);

  const response = await fetch(`/api/upload/${folder}`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.filePaths?.[0] || '';
}

async function uploadMultipleImages(files, folder) {
  if (!files || !files.length) return [];

  const formData = new FormData();

  Array.from(files).forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch(`/api/upload/${folder}`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.filePaths || [];
}

function clampStock(value) {
  const number = Number(value);
  if (Number.isNaN(number) || number < 0) return 0;
  return number;
}

async function loadAdminLists() {
  const [products, categories, masters, reviews, news, seller] = await Promise.all([
    fetchJson('/api/products'),
    fetchJson('/api/categories'),
    fetchJson('/api/masters'),
    fetchJson('/api/reviews'),
    fetchJson('/api/news'),
    fetchJson('/api/seller')
  ]);

  fillProductSelects(categories, masters);
  fillSellerForm(seller);

document.getElementById('admin-products').innerHTML = products.map(product => {
  const master = masters.find(m => m.id === product.masterId);

  return `
    <div class="list-row">
      <strong>${product.title}</strong><br>
      Категория: ${product.category}<br>
      Мастер: ${master ? master.name : '—'}<br>
      Статус: ${product.status}<br>
      Количество: ${product.stock}<br><br>

      ${product.images && product.images.length ? `
        <div class="admin-product-gallery">
          ${product.images.map(img => `<img class="admin-thumb" src="${img}" alt="${product.title}">`).join('')}
        </div>
      ` : ''}

      <input type="number" min="0" id="stock-${product.id}" value="${product.stock}" />

      <select id="status-${product.id}">
        <option value="В наличии" ${product.status === 'В наличии' ? 'selected' : ''}>В наличии</option>
        <option value="На заказ" ${product.status === 'На заказ' ? 'selected' : ''}>На заказ</option>
      </select>

      <label>Новые фото товара</label>
      <input type="file" id="product-files-${product.id}" accept="image/*" multiple>

      <button class="button secondary" onclick="updateProductShort(${product.id})">Сохранить</button>
      <button class="button" onclick="deleteProduct(${product.id})">Удалить товар</button>
    </div>
  `;
}).join('');

  document.getElementById('admin-categories').innerHTML = categories.map(category => `
    <div class="list-row">
      <input id="category-name-${encodeURIComponent(category.name)}" value="${category.name}" />
      <input id="category-subs-${encodeURIComponent(category.name)}" value="${category.subcategories.join(', ')}" />
      <button class="button secondary" onclick="updateCategory('${encodeURIComponent(category.name)}')">Сохранить</button>
      <button class="button" onclick="deleteCategory('${encodeURIComponent(category.name)}')">Удалить</button>
    </div>
  `).join('');

  document.getElementById('admin-masters').innerHTML = masters.map(master => `
    <div class="list-row">
      ${master.photo ? `<img class="admin-thumb" src="${master.photo}" alt="${master.name}">` : ''}
      <input id="master-name-${master.id}" value="${master.name}" placeholder="Имя">
      <input id="master-role-${master.id}" value="${master.role}" placeholder="Роль">
      <input id="master-photo-${master.id}" value="${master.photo || ''}" placeholder="Путь к фото">
      <textarea id="master-description-${master.id}" placeholder="Описание">${master.description}</textarea>
      <label>Новое фото мастера</label>
      <input type="file" id="master-file-${master.id}" accept="image/*">
      <button class="button secondary" onclick="updateMaster(${master.id})">Сохранить изменения</button>
      <button class="button" onclick="deleteMaster(${master.id})">Удалить мастера</button>
    </div>
  `).join('');

  document.getElementById('admin-reviews').innerHTML = reviews.map(review => `
    <div class="list-row">
      ${review.image ? `<img class="admin-thumb" src="${review.image}" alt="${review.author}">` : ''}
      <input id="review-author-${review.id}" value="${review.author}" placeholder="Автор">
      <input id="review-date-${review.id}" value="${review.date}" placeholder="Дата">
      <input id="review-image-${review.id}" value="${review.image || ''}" placeholder="Путь к фото">
      <textarea id="review-text-${review.id}" placeholder="Текст">${review.text}</textarea>
      <label>Новое фото отзыва</label>
      <input type="file" id="review-file-${review.id}" accept="image/*">
      <button class="button secondary" onclick="updateReview(${review.id})">Сохранить</button>
      <button class="button" onclick="deleteReview(${review.id})">Удалить</button>
    </div>
  `).join('');

  document.getElementById('admin-news').innerHTML = news.map(item => `
    <div class="list-row">
      <input id="news-title-${item.id}" value="${item.title}" placeholder="Заголовок">
      <input id="news-date-${item.id}" value="${item.date}" placeholder="Дата">
      <textarea id="news-text-${item.id}" placeholder="Текст">${item.text}</textarea>
      <button class="button secondary" onclick="updateNews(${item.id})">Сохранить</button>
      <button class="button" onclick="deleteNews(${item.id})">Удалить</button>
    </div>
  `).join('');
}

function fillProductSelects(categories, masters) {
  const categorySelect = document.getElementById('product-category');
  const masterSelect = document.getElementById('product-master');

  categorySelect.innerHTML = '<option value="">Выберите категорию</option>' +
    categories.map(category => `<option value="${category.name}">${category.name}</option>`).join('');

  masterSelect.innerHTML = '<option value="">Выберите мастера</option>' +
    masters.map(master => `<option value="${master.id}">${master.name}</option>`).join('');
}

function fillSellerForm(seller) {
  const form = document.getElementById('seller-form');
  form.name.value = seller.name || '';
  form.telegram.value = seller.telegram || '';
  form.email.value = seller.email || '';
  form.max.value = seller.max || '';
  form.description.value = seller.description || '';
}

async function updateProductShort(id) {
  const stock = clampStock(document.getElementById(`stock-${id}`).value);
  const status = document.getElementById(`status-${id}`).value;

  const fileInput = document.getElementById(`product-files-${id}`);
  let uploadedImages = null;

  if (fileInput && fileInput.files && fileInput.files.length) {
    uploadedImages = await uploadMultipleImages(fileInput.files, 'products');
  }

  const payload = { stock, status };

  if (uploadedImages && uploadedImages.length) {
    payload.images = uploadedImages;
  }

  await fetchJson(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Товар обновлён');
  loadAdminLists();
}

async function deleteProduct(id) {
  await fetchJson(`/api/products/${id}`, { method: 'DELETE' });
  alert('Товар удалён');
  loadAdminLists();
}

async function deleteCategory(encodedName) {
  await fetchJson(`/api/categories/${encodedName}`, { method: 'DELETE' });
  alert('Категория удалена');
  loadAdminLists();
}

async function updateCategory(encodedName) {
  const newName = document.getElementById(`category-name-${encodedName}`).value.trim();
  const subcategories = document.getElementById(`category-subs-${encodedName}`).value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  await fetchJson(`/api/categories/${encodedName}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName, subcategories })
  });

  alert('Категория обновлена');
  loadAdminLists();
}

async function deleteMaster(id) {
  await fetchJson(`/api/masters/${id}`, { method: 'DELETE' });
  alert('Мастер удалён');
  loadAdminLists();
}

async function updateMaster(id) {
  const fileInput = document.getElementById(`master-file-${id}`);
  let photo = document.getElementById(`master-photo-${id}`).value.trim();

  if (fileInput.files[0]) {
    photo = await uploadSingleImage(fileInput.files[0], 'masters');
  }

  const payload = {
    name: document.getElementById(`master-name-${id}`).value.trim(),
    role: document.getElementById(`master-role-${id}`).value.trim(),
    description: document.getElementById(`master-description-${id}`).value.trim(),
    photo
  };

  await fetchJson(`/api/masters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Профиль мастера обновлён');
  loadAdminLists();
}

async function updateReview(id) {
  const fileInput = document.getElementById(`review-file-${id}`);
  let image = document.getElementById(`review-image-${id}`).value.trim();

  if (fileInput.files[0]) {
    image = await uploadSingleImage(file, 'reviews');
  }

  const payload = {
    author: document.getElementById(`review-author-${id}`).value.trim(),
    text: document.getElementById(`review-text-${id}`).value.trim(),
    date: document.getElementById(`review-date-${id}`).value.trim(),
    image
  };

  await fetchJson(`/api/reviews/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Отзыв обновлён');
  loadAdminLists();
}

async function deleteReview(id) {
  await fetchJson(`/api/reviews/${id}`, { method: 'DELETE' });
  alert('Отзыв удалён');
  loadAdminLists();
}

async function updateNews(id) {
  const payload = {
    title: document.getElementById(`news-title-${id}`).value.trim(),
    text: document.getElementById(`news-text-${id}`).value.trim(),
    date: document.getElementById(`news-date-${id}`).value.trim()
  };

  await fetchJson(`/api/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Новость обновлена');
  loadAdminLists();
}

async function deleteNews(id) {
  await fetchJson(`/api/news/${id}`, { method: 'DELETE' });
  alert('Новость удалена');
  loadAdminLists();
}

document.getElementById('seller-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;

  const payload = {
    name: form.name.value.trim(),
    telegram: form.telegram.value.trim(),
    email: form.email.value.trim(),
    max: form.max.value.trim(),
    description: form.description.value.trim()
  };

  await fetchJson('/api/seller', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Контакты сохранены');
});

document.getElementById('product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const files = form.querySelector('input[name="productFiles"]').files;
  const uploadedImages = await uploadMultipleImages(files, 'products');

  const payload = {
    title: formData.get('title'),
    category: formData.get('category'),
    subcategory: formData.get('subcategory'),
    materials: String(formData.get('materials')).split(',').map(s => s.trim()).filter(Boolean),
    description: formData.get('description'),
    price: Math.max(0, Number(formData.get('price'))),
    productionTime: formData.get('productionTime'),
    status: formData.get('status'),
    stock: clampStock(formData.get('stock')),
    options: String(formData.get('options')).split(',').map(s => s.trim()).filter(Boolean),
    masterId: Number(formData.get('masterId')),
    images: uploadedImages
  };

  await fetchJson('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Новость добавлена');
  form.reset();
  loadAdminLists();
});

document.getElementById('review-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  let image = '';
  const file = form.querySelector('input[name="imageFile"]').files[0];
  if (file) {
    image = await uploadImage(file, 'reviews');
  }

  const payload = {
    author: formData.get('author'),
    text: formData.get('text'),
    date: formData.get('date'),
    image
  };

  await fetchJson('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Отзыв добавлен');
  form.reset();
  loadAdminLists();
});

document.getElementById('master-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  let photo = '';
  const file = form.querySelector('input[name="photoFile"]').files[0];
  if (file) {
    photo = await uploadSingleImage(file, 'masters');
  }

  const payload = {
    name: formData.get('name'),
    role: formData.get('role'),
    description: formData.get('description'),
    photo
  };

  await fetchJson('/api/masters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  alert('Мастер добавлен');
  form.reset();
  loadAdminLists();
});

loadAdminLists();