# Инструкция по деплою на GitHub Pages

## Шаги для деплоя:

### 1. Создайте репозиторий на GitHub
- Перейдите на https://github.com
- Нажмите "New repository"
- Назовите репозиторий (например: `alesya-psychologist-site`)
- Сделайте репозиторий публичным
- НЕ добавляйте README, .gitignore или лицензию (они уже есть)

### 2. Подключите локальный репозиторий к GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/alesya-psychologist-site.git
git branch -M main
git push -u origin main
```

### 3. Настройте GitHub Pages
- Перейдите в Settings → Pages
- В разделе "Source" выберите "GitHub Actions"
- Сохраните настройки

### 4. Обновите конфигурацию
В файле `astro.config.mjs` замените:
- `USERNAME` на ваш GitHub username
- `REPOSITORY-NAME` на название вашего репозитория

### 5. Обновите домен в Layout.astro
В файле `src/layouts/Layout.astro` замените все `https://example.com` на ваш реальный URL GitHub Pages

### 6. Запустите деплой
```bash
git add .
git commit -m "Настройка для GitHub Pages"
git push
```

### 7. Проверьте деплой
- Перейдите в Actions в вашем репозитории
- Дождитесь завершения workflow
- Ваш сайт будет доступен по адресу: `https://YOUR_USERNAME.github.io/REPOSITORY-NAME`

## Настройка аналитики

После деплоя обновите ID в файле `src/layouts/Layout.astro`:
- Замените `YANDEX_METRIKA_ID` на ваш реальный ID Яндекс.Метрики
- Замените `GA_MEASUREMENT_ID` на ваш реальный ID Google Analytics

## Подключение домена (опционально)

Если у вас есть собственный домен:
1. Добавьте файл `CNAME` в папку `public/` с вашим доменом
2. Настройте DNS записи у вашего провайдера
3. В настройках GitHub Pages укажите ваш домен
