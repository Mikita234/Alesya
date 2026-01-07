# Деплой на Vercel

## Быстрый старт

1. Установите Vercel CLI (опционально):
   ```bash
   npm i -g vercel
   ```

2. Подключите проект к Vercel:
   - Через веб-интерфейс: https://vercel.com → Import Project → выберите репозиторий
   - Или через CLI: `vercel` в корне проекта

3. Настройки проекта:
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `.vercel/output` (устанавливается автоматически)
   - **Install Command**: `npm install`

4. Переменные окружения (если нужны):
   - Добавьте в Settings → Environment Variables

5. Домен:
   - В Settings → Domains добавьте `alesyatakun.by`
   - Настройте DNS записи согласно инструкциям Vercel

## Особенности

- Используется **Serverless Functions** для SSR
- Заголовки безопасности настроены в `vercel.json`
- Кэширование статических ресурсов настроено автоматически

## Проверка после деплоя

После деплоя проверьте:
- ✅ Все страницы открываются
- ✅ API маршруты работают (`/api/register-order`)
- ✅ Заголовки безопасности установлены
- ✅ Instagram виджеты загружаются

