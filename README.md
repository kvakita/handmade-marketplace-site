# Запуск проекта на другом устройстве

Проект запускается локально через Node.js.

После запуска сайт будет доступен по адресу:

```bash
http://localhost:3000
```

---

## Вариант 1. Через GitHub

### macOS

#### 1. Установить Node.js
1. Открой официальный сайт Node.js.
2. Скачай **LTS version** для macOS.
3. Установи как обычную программу.

Проверка установки:

```bash
node -v
npm -v
```

#### 2. Установить VS Code
1. Скачай Visual Studio Code.
2. Перетащи его в папку **Applications**.
3. Открой VS Code.

#### 3. Проверить Git
Открой **Terminal**:
- `Command + Space`
- введи `Terminal`
- открой приложение

Проверь Git:

```bash
git --version
```

Если Git не установлен, macOS предложит установить инструменты разработчика.

#### 4. Скачать проект с GitHub

```bash
git clone ССЫЛКА_НА_РЕПОЗИТОРИЙ
```

Пример:

```bash
git clone https://github.com/kvakita/handmade-marketplace-site.git
```

Перейди в папку проекта:

```bash
cd handmade-marketplace-site
```

#### 5. Открыть проект в VS Code
Через интерфейс:
- `File → Open Folder`
- выбери папку проекта

#### 6. Установить зависимости

```bash
npm install
```

#### 7. Запустить проект

```bash
node server.js
```

Если всё хорошо, в терминале появится:

```bash
Сервер запущен: http://localhost:3000
```

#### 8. Открыть сайт

```bash
http://localhost:3000
```

#### 9. Остановить сервер

```bash
Control + C
```

---

### Windows

#### 1. Установить Node.js
1. Открой официальный сайт Node.js.
2. Скачай **LTS version** для Windows.
3. Установи как обычную программу.

Проверка установки:

```bash
node -v
npm -v
```

#### 2. Установить VS Code
1. Скачай Visual Studio Code.
2. Установи его.

#### 3. Установить Git
1. Скачай **Git for Windows**.
2. Установи с настройками по умолчанию.

#### 4. Скачать проект с GitHub
Открой **Git Bash** или терминал в VS Code и выполни:

```bash
git clone ССЫЛКА_НА_РЕПОЗИТОРИЙ
```

Пример:

```bash
git clone https://github.com/kvakita/handmade-marketplace-site.git
```

Перейди в папку проекта:

```bash
cd handmade-marketplace-site
```

#### 5. Открыть проект в VS Code
- `File → Open Folder`
- выбери папку проекта

#### 6. Установить зависимости

```bash
npm install
```

#### 7. Запустить проект

```bash
node server.js
```

Если всё хорошо, в терминале появится:

```bash
Сервер запущен: http://localhost:3000
```

#### 8. Открыть сайт

```bash
http://localhost:3000
```

#### 9. Остановить сервер

```bash
Ctrl + C
```

---

## Вариант 2. Через ZIP-архив

Если проект передаётся архивом `.zip`, порядок запуска почти такой же.

### macOS через ZIP

#### 1. Скачать архив проекта

#### 2. Распаковать архив
Двойной клик по `.zip`.

#### 3. Открыть папку проекта в VS Code
- `File → Open Folder`

#### 4. Открыть терминал в VS Code
- `Terminal → New Terminal`

#### 5. Выполнить:

```bash
npm install
node server.js
```

#### 6. Открыть сайт

```bash
http://localhost:3000
```

---

### Windows через ZIP

#### 1. Скачать архив проекта

#### 2. Распаковать архив
Правой кнопкой мыши:
- `Извлечь всё`

#### 3. Открыть папку проекта в VS Code
- `File → Open Folder`

#### 4. Открыть терминал в VS Code
- `Terminal → New Terminal`

#### 5. Выполнить:

```bash
npm install
node server.js
```

#### 6. Открыть сайт

```bash
http://localhost:3000
```

---

## Если порт 3000 занят

Открой файл `server.js` и найди строку:

```javascript
const PORT = 3000;
```

Замени, например, на:

```javascript
const PORT = 3001;
```

После этого снова запусти сервер:

```bash
node server.js
```

И открой:

```bash
http://localhost:3001
```

---

## Возможные ошибки

### `node: command not found`
или на Windows `node is not recognized`

Node.js не установлен или установлен неправильно.

Проверь:

```bash
node -v
npm -v
```

Если команды не работают, переустанови Node.js.

---

### `Cannot find module 'express'`

Не установлены зависимости.

Выполни:

```bash
npm install
```

Если нужно отдельно:

```bash
npm install express
```

---

### Пустой сайт

Проверь:
- сервер запущен
- открыт правильный адрес
- в проекте есть `server.js`
- в проекте есть папки `data` и `public`

---

### Ошибка в JSON

Если где-то пропущена запятая или кавычка в `data/*.json`, сайт может работать неправильно.

Проверь файлы:
- `data/products.json`
- `data/categories.json`
- `data/masters.json`
- `data/seller.json`
- `data/news.json`
- `data/reviews.json`

---

## Быстрый запуск

После того как проект скачан или распакован, нужны только три команды:

```bash
npm install
node server.js
```

Потом открыть:

```bash
http://localhost:3000
```
