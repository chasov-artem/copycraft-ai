import Link from "next/link"
import { Check, FileText, Settings2, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const howItWorksSteps = [
  {
    title: "Оберіть шаблон",
    description:
      "Оберіть з бібліотеки шаблонів, що підходить саме вам.",
    icon: FileText,
  },
  {
    title: "Налаштуйте поля",
    description:
      "Введіть деталі вашого об'єкту в інтуїтивному конструкторі.",
    icon: Settings2,
  },
  {
    title: "Отримайте текст",
    description:
      "Ми генеруємо професійний текст, готовий до використання.",
    icon: Sparkles,
  },
]

const templateCards = [
  {
    title: "Опис квартири для продажу",
    description:
      "Детальний структурований опис квартири з сильним акцентом на перевагах.",
    tags: ["Для продажу", "Детальний"],
  },
  {
    title: "Оголошення для оренди будинку",
    description:
      "Шаблон для швидкої публікації орендного оголошення на маркетплейсах.",
    tags: ["Для оренди", "Короткий"],
  },
  {
    title: "Текст для комерційної нерухомості",
    description:
      "Професійна подача об'єктів для бізнесу, офісів і торгових площ.",
    tags: ["Для продажу", "Детальний"],
  },
  {
    title: "Короткий опис для соціальних мереж",
    description:
      "Лаконічний текст для Facebook, Instagram та Telegram з чітким CTA.",
    tags: ["Короткий", "Для оренди"],
  },
]

const pricingPlans = [
  {
    name: "Basic",
    price: "$19/місяць",
    features: [
      "До 10 текстів на місяць",
      "Доступ до базових шаблонів",
      "Підтримка по email",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49/місяць",
    features: [
      "До 100 текстів на місяць",
      "Доступ до всіх шаблонів",
      "Пріоритетна підтримка",
      "Експорт у PDF",
    ],
    highlighted: true,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            CopyCraft AI
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Головна
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-indigo-600"
            >
              Шаблони
            </Link>
            <Link
              href="#pricing"
              className="transition-colors hover:text-indigo-600"
            >
              Тарифи
            </Link>
            <Link href="#about" className="transition-colors hover:text-indigo-600">
              Про нас
            </Link>
          </div>

          <Button asChild variant="outline" className="border-slate-300">
            <Link href="/login">Увійти</Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
            SaaS для рієлторів
          </Badge>
          <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            AI-генеровані тексти для нерухомості, які продають
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Створюйте переконливі описи об&apos;єктів нерухомості за лічені
            секунди за допомогою штучного інтелекту.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Link href="/register">Спробувати безкоштовно</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            >
              <Link href="/dashboard">Переглянути шаблони</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-950">
            Як це працює
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {howItWorksSteps.map((step) => {
              const Icon = step.icon
              return (
                <Card key={step.title} className="border-slate-200">
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-slate-950">
          Популярні шаблони
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {templateCards.map((template) => (
            <Card key={template.title} className="border-slate-200">
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  {template.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-100"
                >
                  <Link href="/dashboard">Спробувати</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-950">
            Оберіть план, який підходить вам
          </h2>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? "border-indigo-600 shadow-lg shadow-indigo-100"
                    : "border-slate-200"
                }
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-3xl font-bold text-slate-950">{plan.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <Check className="mt-0.5 h-4 w-4 text-indigo-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className={
                      plan.highlighted
                        ? "w-full bg-indigo-600 text-white hover:bg-indigo-700"
                        : "w-full border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                    }
                  >
                    <Link href="/register">Почати</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer id="about" className="bg-slate-900 text-slate-200">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-xl font-semibold text-white">CopyCraft AI</p>
            <p className="mt-3 text-sm text-slate-400">
              Платформа для створення професійних текстів про нерухомість за
              секунди.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-medium text-white">Навігація</p>
            <div className="mt-3 flex flex-col gap-2 text-slate-400">
              <Link href="#" className="hover:text-white">
                Умови використання
              </Link>
              <Link href="#" className="hover:text-white">
                Політика конфіденційності
              </Link>
              <Link href="#" className="hover:text-white">
                Контакти
              </Link>
            </div>
          </div>

          <div className="text-sm text-slate-400 lg:text-right">
            <p>© 2023 CopyCraft AI. Усі права захищені.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
