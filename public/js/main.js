async function loadHomePage() {
  const [categoriesRes, mastersRes, newsRes, reviewsRes, sellerRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/masters'),
    fetch('/api/news'),
    fetch('/api/reviews'),
    fetch('/api/seller')
  ]);

  const categories = await categoriesRes.json();
  const masters = await mastersRes.json();
  const news = await newsRes.json();
  const reviews = await reviewsRes.json();
  const seller = await sellerRes.json();

  const categoryImages = {
    'Украшения': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    'Вязание': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=900&q=80',
    'Товары для дома / дачи': 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    'Развивающие изделия': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
    'Коллекции': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
  };

  const masterPhotos = {
    'Анна': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    'Мария': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
    'Елена': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80'
  };

  const categoriesList = document.getElementById('categories-list');
  const mastersList = document.getElementById('masters-list');
  const newsList = document.getElementById('news-list');
  const reviewsList = document.getElementById('reviews-list');
  const sellerBlock = document.getElementById('seller-block');

  categoriesList.innerHTML = categories.map(category => `
    <a class="card category-card-link" href="/catalog.html?category=${encodeURIComponent(category.name)}">
      <img class="category-image" src="${categoryImages[category.name] || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'}" alt="${category.name}">
      <h3>${category.name}</h3>
      <p>${category.subcategories.join(', ')}</p>
      <span class="button secondary">Открыть категорию</span>
    </a>
  `).join('');

  mastersList.innerHTML = masters.map(master => `
    <div class="card master-card">
      <img class="master-image" src="${masterPhotos[master.name] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80'}" alt="${master.name}">
      <h3>${master.name}</h3>
      <p><strong>${master.role}</strong></p>
      <p>${master.description}</p>
    </div>
  `).join('');

  newsList.innerHTML = news.map(item => `
    <div class="card">
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <p class="small">${item.date}</p>
    </div>
  `).join('');

 reviewsList.innerHTML = reviews.map(item => `
  <div class="card review-card">
    ${item.image ? `<img class="review-image" src="${item.image}" alt="${item.author}">` : ''}
    <p>“${item.text}”</p>
    <p class="small">${item.author}, ${item.date}</p>
  </div>
`).join('');

  sellerBlock.innerHTML = `
    <h2>Связаться с продавцом</h2>
    <p>${seller.description}</p>
    <div class="info-list">
      <div class="info-item">Telegram: <a href="${seller.telegram}" target="_blank">${seller.telegram}</a></div>
      <div class="info-item">Email: <a href="mailto:${seller.email}">${seller.email}</a></div>
      <div class="info-item">MAX: <a href="${seller.max}" target="_blank">${seller.max}</a></div>
    </div>
  `;
}

loadHomePage();