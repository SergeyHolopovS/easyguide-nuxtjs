<div align="center">

# 🧭 EasyGuide

**Платформа для поиска авторских экскурсий и местных гидов**

Туристы находят и бронируют туры, гиды — публикуют маршруты, ведут расписание и принимают заявки.

[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

</div>

---

## ✨ Возможности

### Для туриста
- 🔎 **Каталог туров** — поиск по названию, фильтры по городу, категории, дате и цене, сортировка и пагинация. Все фильтры хранятся в URL, поэтому ссылкой на подборку можно поделиться
- 📄 **Страница тура** — описание, фотографии, информация о гиде и отзывы
- 📅 **Расписание и бронирование** — выбор свободного слота и количества мест
- 🧳 **Мои поездки** — предстоящие и завершённые поездки, отмена брони с указанием причины, отзыв после поездки

### Для гида
- 🎓 **Стать гидом** — роль включается после заполнения города, языков и раздела «о себе»
- 🛠️ **Создание и редактирование туров** — черновики, загрузка фотографий, публикация
- 🗓️ **Управление расписанием** — слоты на ближайшие 3 месяца
- 📬 **Заявки на бронирование** — подтверждение и отклонение, счётчик новых заявок в шапке
- 👤 **Публичный профиль гида**

### Аккаунт
- 🔐 Регистрация и вход с валидацией форм на клиенте и сервере
- 🖼️ Профиль с аватаром, городом, языками и биографией

---

## 🧱 Стек

| Слой | Технологии |
| --- | --- |
| Фреймворк | [Nuxt 4](https://nuxt.com) (SSR) · [Vue 3](https://vuejs.org) · Vue Router |
| Стили | [Tailwind CSS 4](https://tailwindcss.com) через `@tailwindcss/vite` |
| Иконки | [`@nuxt/icon`](https://github.com/nuxt/icon) |
| Язык | TypeScript |
| Пакетный менеджер | pnpm |

Бэкенд — отдельный сервис **EasyGuide API** (REST, OpenAPI-схема на `/v3/api-docs`).

---

## 🚀 Быстрый старт

> Нужны **Node.js 20+** и **pnpm**. Для работы приложения должен быть запущен бэкенд EasyGuide API.

```bash
pnpm install
```

```bash
pnpm dev
```

Приложение откроется на [http://localhost:3000](http://localhost:3000).

### ⚙️ Настройка

По умолчанию фронтенд обращается к API по адресу `http://localhost:8080`. Чтобы указать другой адрес, задайте переменную окружения:

```bash
NUXT_PUBLIC_API_BASE=https://api.example.com pnpm dev
```

### 📜 Скрипты

| Команда | Что делает |
| --- | --- |
| `pnpm dev` | Dev-сервер с горячей перезагрузкой |
| `pnpm build` | Production-сборка |
| `pnpm preview` | Локальный просмотр production-сборки |
| `pnpm generate` | Статическая генерация сайта |

---

## 🗺️ Страницы

| Маршрут | Описание | 🔒 |
| --- | --- | :-: |
| `/` | Главная: популярные туры, категории, призыв стать гидом | |
| `/catalog` | Каталог туров с фильтрами | |
| `/tour?id=…` | Страница тура | |
| `/timetable?id=…` | Расписание тура и бронирование | |
| `/guide?id=…` | Публичный профиль гида | |
| `/signin`, `/signup` | Вход и регистрация | |
| `/profile` | Редактирование профиля | ✅ |
| `/my-trips` | Бронирования туриста | ✅ |
| `/my-tours` | Туры гида | ✅ |
| `/create-tour` | Создание / редактирование тура | ✅ |
| `/booking-requests` | Заявки на бронирование туров гида | ✅ |

🔒 — страница доступна только после входа; без авторизации middleware `auth` отправляет на `/signin` с возвратом обратно.

---

## 📁 Структура проекта

```
app/
├── components/      # UI-компоненты (шапка, футер, поля ввода, блоки главной)
│   └── home/        # секции главной страницы
├── composables/     # работа с API: useAuth, useTours, useBookings, useGuides, useFiles
├── layouts/         # общий layout
├── middleware/      # auth — защита приватных страниц
├── pages/           # страницы (file-based routing)
├── plugins/api.ts   # HTTP-клиент бэкенда с JWT и автообновлением токенов
├── types/api.ts     # типы по OpenAPI-схеме EasyGuide API
├── utils/           # форматирование, валидация, склонения, языки
└── style.css        # Tailwind и цветовая тема
public/              # статические файлы
```

---

## 🔑 Авторизация

- Пара токенов (**access** на 15 минут + одноразовый **refresh**) хранится в cookie, поэтому сессия доступна и при SSR.
- Плагин [`app/plugins/api.ts`](app/plugins/api.ts) добавляет `Authorization: Bearer …` к каждому запросу и при ответе `401` один раз обновляет токены и повторяет запрос.
- Параллельные запросы и разные вкладки браузера ждут **одно** обновление (общий промис + Web Locks API), так что одноразовый refresh-токен не тратится повторно.
- Параметр `?redirect=` после входа принимает только внутренние пути — защита от open redirect.

---

## 🎨 Тема

Цвета задаются в [`app/style.css`](app/style.css) через `@theme` и доступны как утилиты Tailwind (`bg-red`, `text-gray-text` и т. д.):

| Токен | Цвет |
| --- | --- |
| `red` | ![#EB331A](https://placehold.co/14x14/EB331A/EB331A.png) `#EB331A` |
| `red-text` | ![#B12A0E](https://placehold.co/14x14/B12A0E/B12A0E.png) `#B12A0E` |
| `gray` | ![#A19F9F](https://placehold.co/14x14/A19F9F/A19F9F.png) `#A19F9F` |
| `gray-text` | ![#706E6D](https://placehold.co/14x14/706E6D/706E6D.png) `#706E6D` |
| `bg` | ![#F3F2F2](https://placehold.co/14x14/F3F2F2/F3F2F2.png) `#F3F2F2` |
| `smooth-bg` | ![#E9E8E8](https://placehold.co/14x14/E9E8E8/E9E8E8.png) `#E9E8E8` |
