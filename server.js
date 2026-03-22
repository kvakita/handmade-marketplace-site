const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function readJson(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(fileName, data) {
  const filePath = path.join(__dirname, 'data', fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
  const newProduct = req.body;

  const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  newProduct.id = newId;

  if (!Array.isArray(newProduct.materials)) newProduct.materials = [];
  if (!Array.isArray(newProduct.options)) newProduct.options = [];
  if (!Array.isArray(newProduct.images)) newProduct.images = [];
  if (typeof newProduct.stock !== 'number') newProduct.stock = 0;

  products.push(newProduct);
  writeJson('products.json', products);

  res.json({ success: true, product: newProduct });
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

app.post('/api/products/:id/stock', (req, res) => {
  const id = Number(req.params.id);
  const { stock } = req.body;
  const products = readJson('products.json');
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  product.stock = Number(stock);

  if (product.status !== 'Портфолио') {
    product.status = product.stock > 0 ? 'В наличии' : 'На заказ';
  }

  writeJson('products.json', products);
  res.json({ success: true, product });
});

app.get('/api/categories', (req, res) => {
  res.json(readJson('categories.json'));
});

app.post('/api/categories', (req, res) => {
  const categories = readJson('categories.json');
  const { name, subcategories } = req.body;

  categories.push({
    name,
    subcategories: Array.isArray(subcategories) ? subcategories : []
  });

  writeJson('categories.json', categories);
  res.json({ success: true });
});

app.delete('/api/categories/:name', (req, res) => {
  const categoryName = decodeURIComponent(req.params.name);
  let categories = readJson('categories.json');
  categories = categories.filter((c) => c.name !== categoryName);
  writeJson('categories.json', categories);
  res.json({ success: true });
});

app.get('/api/masters', (req, res) => {
  res.json(readJson('masters.json'));
});

app.get('/api/seller', (req, res) => {
  res.json(readJson('seller.json'));
});

app.get('/api/news', (req, res) => {
  res.json(readJson('news.json'));
});

app.post('/api/news', (req, res) => {
  const news = readJson('news.json');
  const newItem = req.body;
  const newId = news.length ? Math.max(...news.map((n) => n.id)) + 1 : 1;
  newItem.id = newId;
  news.unshift(newItem);
  writeJson('news.json', news);
  res.json({ success: true });
});

app.get('/api/reviews', (req, res) => {
  res.json(readJson('reviews.json'));
});

app.post('/api/reviews', (req, res) => {
  const reviews = readJson('reviews.json');
  const newReview = req.body;
  const newId = reviews.length ? Math.max(...reviews.map((r) => r.id)) + 1 : 1;
  newReview.id = newId;
  reviews.unshift(newReview);
  writeJson('reviews.json', reviews);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});