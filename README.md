# DateMarket.ru — MVP

Сайт знакомств с открытой статистикой, рейтингами и системой подарков.

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
```

### 2. Настроить переменные окружения
```bash
cp .env.local.example .env.local
# Заполнить значениями из Supabase Dashboard → Settings → API
```

### 3. Запустить схему БД
В Supabase Dashboard → SQL Editor → вставить и запустить `supabase-schema.sql`

### 4. Запустить локально
```bash
npm run dev
# http://localhost:3000
```

## Деплой на Vercel
1. vercel.com → New Project → импортировать этот репозиторий
2. Добавить переменные окружения из .env.local
3. Подключить домен datemarket.ru

## Структура
```
src/
  app/
    page.tsx       # Главная страница (дашборды + рейтинги)
    layout.tsx     # Root layout
    globals.css    # Стили (тёмная биржевая тема)
  lib/
    supabase.ts    # Supabase клиент
supabase-schema.sql  # Схема БД с функциями и RLS
```