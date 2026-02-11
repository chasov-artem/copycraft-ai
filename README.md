# CopyCraft AI

Next.js 14 проект з TypeScript, Tailwind CSS, App Router та shadcn/ui компонентами.

## Технології

- **Next.js 14** - React фреймворк з App Router
- **TypeScript** - типізація коду
- **Tailwind CSS** - утилітарний CSS фреймворк
- **shadcn/ui** - бібліотека компонентів (стиль: New York, колір: Slate)

## Встановлені компоненти shadcn/ui

- Button
- Card
- Input
- Label
- Badge
- Skeleton
- Tabs

## Локальний запуск

1. Встановіть залежності:

```bash
npm install
```

2. Запустіть dev сервер:

```bash
npm run dev
```

3. Відкрийте [http://localhost:3000](http://localhost:3000) у браузері

## Деплой на Vercel

### Через GitHub інтеграцію (рекомендовано)

1. **Створіть репозиторій на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/copycraft-ai.git
   git push -u origin main
   ```

2. **Підключіть проект до Vercel:**
   - Перейдіть на [vercel.com](https://vercel.com)
   - Увійдіть через GitHub
   - Натисніть "Add New Project"
   - Виберіть репозиторій `copycraft-ai`
   - Vercel автоматично визначить Next.js проект
   - Натисніть "Deploy"

3. **Після деплою:**
   - Vercel надасть вам URL типу: `https://copycraft-ai.vercel.app`
   - Кожен push до `main` гілки автоматично запускає новий деплой

### Через Vercel CLI

1. Встановіть Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Задеплойте проект:
   ```bash
   vercel
   ```

3. Для production деплою:
   ```bash
   vercel --prod
   ```

## Структура проекту

```
copycraft-ai/
├── app/                    # App Router директорія
│   ├── globals.css        # Глобальні стилі з Tailwind та shadcn/ui
│   ├── layout.tsx         # Кореневий layout
│   └── page.tsx           # Головна сторінка
├── components/             # React компоненти
│   └── ui/                # shadcn/ui компоненти
├── lib/                   # Утиліти
│   └── utils.ts           # Допоміжні функції
├── components.json        # Конфігурація shadcn/ui
├── tailwind.config.ts     # Конфігурація Tailwind CSS
├── tsconfig.json          # Конфігурація TypeScript
└── package.json           # Залежності проекту
```

## Додавання нових компонентів shadcn/ui

```bash
npx shadcn@latest add [назва-компонента]
```

## Додаткові ресурси

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Vercel Documentation](https://vercel.com/docs)
