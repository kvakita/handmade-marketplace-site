function getBadgeClass(status) {
  if (status === 'В наличии') return 'badge available';
  if (status === 'На заказ') return 'badge order';
  return 'badge portfolio';
}

async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('product-container').innerHTML = '<div class="card">Не передан ID товара.</div>';
    return;
  }

  const [productRes, mastersRes] = await Promise.all([
    fetch(`/api/products/${id}`),
    fetch('/api/masters')
  ]);

  if (!productRes.ok) {
    document.getElementById('product-container').innerHTML = '<div class="card">Товар не найден.</div>';
    return;
  }

  const product = await productRes.json();
  const masters = await mastersRes.json();
  const master = masters.find(m => m.id === product.masterId);

  document.getElementById('product-container').innerHTML = `
    <div class="product-page">
      <div class="product-gallery">
        ${product.images.map(img => `<img src="${img}" alt="${product.title}">`).join('')}
      </div>
      <div class="card">
        <span class="${getBadgeClass(product.status)}">${product.status}</span>
        <h1>${product.title}</h1>
        <p><strong>Категория:</strong> ${product.category}</p>
        <p><strong>Подкатегория:</strong> ${product.subcategory}</p>
        <p><strong>Материалы:</strong> ${product.materials.join(', ')}</p>
        <p><strong>Описание:</strong> ${product.description}</p>
        <p><strong>Цена:</strong> ${product.price} ₽</p>
        <p><strong>Срок изготовления:</strong> ${product.productionTime}</p>
        <p><strong>Количество:</strong> ${product.stock}</p>
        <p><strong>Варианты:</strong> ${product.options.join(', ') || '—'}</p>
        <p><strong>Мастер:</strong> ${master ? master.name : '—'}</p>

        <h3>Контакты продавца</h3>
        <div class="info-list">
          <div class="info-item">Telegram: <a href="${product.contacts.telegram}" target="_blank">Написать</a></div>
          <div class="info-item">Email: <a href="mailto:${product.contacts.email}">${product.contacts.email}</a></div>
          <div class="info-item">MAX: <a href="${product.contacts.max}" target="_blank">Открыть</a></div>
        </div>
      </div>
    </div>
  `;
}

loadProduct();