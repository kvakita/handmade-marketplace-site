const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function readJson(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(fileName, data) {
  const filePath = path.join(__dirname, 'data', fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

function clampNonNegative(value) {
  return Math.max(0, safeNumber(value, 0));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const uploadBase = path.join(__dirname, 'public', 'uploads');
ensureDir(uploadBase);
ensureDir(path.join(uploadBase, 'reviews'));
ensureDir(path.join(uploadBase, 'masters'));
ensureDir(path.join(uploadBase, 'products'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder || 'misc';
    const targetDir = path.join(uploadBase, folder);
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* UPLOADS */

app.post('/api/upload/:folder', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }

  const folder = req.params.folder;
  const fileUrl = `/uploads/${folder}/${req.file.filename}`;

  res.json({
    success: true,
    filePath: fileUrl
  });
});

/* PRODUCTS */

app.get('/api/products', (req, res) => {
  res.json(readJson('products.json'));
});

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const products = readJson('products.json');
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.json(product);
});

app.post('/api/products', (req, res) => {
  const products = readJson('products.json');
  const seller = readJson('seller.json');
  const newProduct = req.body;

  const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const product = {
    id: newId,
    title: newProduct.title || '',
    category: newProduct.category || '',
    subcategory: newProduct.subcategory || '',
    materials: Array.isArray(newProduct.materials) ? newProduct.materials : [],
    description: newProduct.description || '',
    price: clampNonNegative(newProduct.price),
    productionTime: newProduct.productionTime || '',
    status: newProduct.status === 'В наличии' ? 'В наличии' : 'На заказ',
    stock: clampNonNegative(newProduct.stock),
    options: Array.isArray(newProduct.options) ? newProduct.options : [],
    masterId: safeNumber(newProduct.masterId, 0),
    images: Array.isArray(newProduct.images) ? newProduct.images : [],
    contacts: {
      telegram: seller.telegram || '',
      email: seller.email || '',
      max: seller.max || ''
    }
  };

  if (product.stock === 0 && product.status === 'В наличии') {
    product.status = 'На заказ';
  }

  products.push(product);
  writeJson('products.json', products);

  res.json({ success: true, product });
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const products = readJson('products.json');
  const seller = readJson('seller.json');
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  if (typeof req.body.title === 'string') product.title = req.body.title;
  if (typeof req.body.category === 'string') product.category = req.body.category;
  if (typeof req.body.subcategory === 'string') product.subcategory = req.body.subcategory;
  if (Array.isArray(req.body.materials)) product.materials = req.body.materials;
  if (typeof req.body.description === 'string') product.description = req.body.description;
  if (typeof req.body.price !== 'undefined') product.price = clampNonNegative(req.body.price);
  if (typeof req.body.productionTime === 'string') product.productionTime = req.body.productionTime;
  if (typeof req.body.status === 'string') {
    product.status = req.body.status === 'В наличии' ? 'В наличии' : 'На заказ';
  }
  if (typeof req.body.stock !== 'undefined') {
    product.stock = clampNonNegative(req.body.stock);
  }
  if (Array.isArray(req.body.options)) product.options = req.body.options;
  if (typeof req.body.masterId !== 'undefined') product.masterId = safeNumber(req.body.masterId, product.masterId);
  if (Array.isArray(req.body.images)) product.images = req.body.images;

  product.contacts = {
    telegram: seller.telegram || '',
    email: seller.email || '',
    max: seller.max || ''
  };

  if (product.stock === 0 && product.status === 'В наличии') {
    product.status = 'На заказ';
  }

  writeJson('products.json', products);
  res.json({ success: true, product });
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  let products = readJson('products.json');
  const exists = products.some((p) => p.id === id);

  if (!exists) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  products = products.filter((p) => p.id !== id);
  writeJson('products.json', products);

  res.json({ success: true });
});

/* CATEGORIES */

app.get('/api/categories', (req, res) => {
  res.json(readJson('categories.json'));
});

app.post('/api/categories', (req, res) => {
  const categories = readJson('categories.json');
  const { name, subcategories } = req.body;

  categories.push({
    name: name || '',
    subcategories: Array.isArray(subcategories) ? subcategories : []
  });

  writeJson('categories.json', categories);
  res.json({ success: true });
});

app.put('/api/categories/:name', (req, res) => {
  const oldName = decodeURIComponent(req.params.name);
  const categories = readJson('categories.json');
  const products = readJson('products.json');

  const category = categories.find((c) => c.name === oldName);

  if (!category) {
    return res.status(404).json({ error: 'Категория не найдена' });
  }

  const newName = req.body.name || category.name;
  const newSubcategories = Array.isArray(req.body.subcategories)
    ? req.body.subcategories
    : category.subcategories;

  category.name = newName;
  category.subcategories = newSubcategories;

  products.forEach((product) => {
    if (product.category === oldName) {
      product.category = newName;
    }
  });

  writeJson('categories.json', categories);
  writeJson('products.json', products);

  res.json({ success: true, category });
});

app.delete('/api/categories/:name', (req, res) => {
  const categoryName = decodeURIComponent(req.params.name);
  let categories = readJson('categories.json');

  const exists = categories.some((c) => c.name === categoryName);
  if (!exists) {
    return res.status(404).json({ error: 'Категория не найдена' });
  }

  categories = categories.filter((c) => c.name !== categoryName);
  writeJson('categories.json', categories);

  res.json({ success: true });
});

/* MASTERS */

app.get('/api/masters', (req, res) => {
  res.json(readJson('masters.json'));
});

app.post('/api/masters', (req, res) => {
  const masters = readJson('masters.json');
  const newMaster = req.body;
  const newId = masters.length ? Math.max(...masters.map((m) => m.id)) + 1 : 1;

  const master = {
    id: newId,
    name: newMaster.name || '',
    role: newMaster.role || '',
    description: newMaster.description || '',
    photo: newMaster.photo || ''
  };

  masters.push(master);
  writeJson('masters.json', masters);

  res.json({ success: true, master });
});

app.put('/api/masters/:id', (req, res) => {
  const id = Number(req.params.id);
  const masters = readJson('masters.json');
  const master = masters.find((m) => m.id === id);

  if (!master) {
    return res.status(404).json({ error: 'Мастер не найден' });
  }

  master.name = req.body.name || master.name;
  master.role = req.body.role || master.role;
  master.description = req.body.description || master.description;
  master.photo = req.body.photo || master.photo;

  writeJson('masters.json', masters);
  res.json({ success: true, master });
});

app.delete('/api/masters/:id', (req, res) => {
  const id = Number(req.params.id);
  let masters = readJson('masters.json');
  const exists = masters.some((m) => m.id === id);

  if (!exists) {
    return res.status(404).json({ error: 'Мастер не найден' });
  }

  masters = masters.filter((m) => m.id !== id);
  writeJson('masters.json', masters);

  res.json({ success: true });
});

/* SELLER */

app.get('/api/seller', (req, res) => {
  res.json(readJson('seller.json'));
});

app.put('/api/seller', (req, res) => {
  const seller = {
    name: req.body.name || '',
    telegram: req.body.telegram || '',
    email: req.body.email || '',
    max: req.body.max || '',
    description: req.body.description || ''
  };

  writeJson('seller.json', seller);

  const products = readJson('products.json').map((product) => ({
    ...product,
    contacts: {
      telegram: seller.telegram || '',
      email: seller.email || '',
      max: seller.max || ''
    }
  }));

  writeJson('products.json', products);

  res.json({ success: true, seller });
});

/* NEWS */

app.get('/api/news', (req, res) => {
  res.json(readJson('news.json'));
});

app.post('/api/news', (req, res) => {
  const news = readJson('news.json');
  const newItem = req.body;
  const newId = news.length ? Math.max(...news.map((n) => n.id)) + 1 : 1;

  const item = {
    id: newId,
    title: newItem.title || '',
    text: newItem.text || '',
    date: newItem.date || ''
  };

  news.unshift(item);
  writeJson('news.json', news);

  res.json({ success: true, item });
});

app.put('/api/news/:id', (req, res) => {
  const id = Number(req.params.id);
  const news = readJson('news.json');
  const item = news.find((n) => n.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Новость не найдена' });
  }

  item.title = req.body.title || item.title;
  item.text = req.body.text || item.text;
  item.date = req.body.date || item.date;

  writeJson('news.json', news);
  res.json({ success: true, item });
});

app.delete('/api/news/:id', (req, res) => {
  const id = Number(req.params.id);
  let news = readJson('news.json');

  if (!news.some((n) => n.id === id)) {
    return res.status(404).json({ error: 'Новость не найдена' });
  }

  news = news.filter((n) => n.id !== id);
  writeJson('news.json', news);

  res.json({ success: true });
});

/* REVIEWS */

app.get('/api/reviews', (req, res) => {
  res.json(readJson('reviews.json'));
});

app.post('/api/reviews', (req, res) => {
  const reviews = readJson('reviews.json');
  const newReview = req.body;
  const newId = reviews.length ? Math.max(...reviews.map((r) => r.id)) + 1 : 1;

  const review = {
    id: newId,
    author: newReview.author || '',
    text: newReview.text || '',
    date: newReview.date || '',
    image: newReview.image || ''
  };

  reviews.unshift(review);
  writeJson('reviews.json', reviews);

  res.json({ success: true, review });
});

app.put('/api/reviews/:id', (req, res) => {
  const id = Number(req.params.id);
  const reviews = readJson('reviews.json');
  const review = reviews.find((r) => r.id === id);

  if (!review) {
    return res.status(404).json({ error: 'Отзыв не найден' });
  }

  review.author = req.body.author || review.author;
  review.text = req.body.text || review.text;
  review.date = req.body.date || review.date;
  review.image = typeof req.body.image === 'string' ? req.body.image : review.image;

  writeJson('reviews.json', reviews);
  res.json({ success: true, review });
});

app.delete('/api/reviews/:id', (req, res) => {
  const id = Number(req.params.id);
  let reviews = readJson('reviews.json');

  if (!reviews.some((r) => r.id === id)) {
    return res.status(404).json({ error: 'Отзыв не найден' });
  }

  reviews = reviews.filter((r) => r.id !== id);
  writeJson('reviews.json', reviews);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});