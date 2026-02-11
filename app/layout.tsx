import type { Metadata, Viewport } from "next"

import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://copycraft-ai.vercel.app"),
  title: "CopyCraft AI — генератор текстів для нерухомості",
  description:
    "CopyCraft AI допомагає рієлторам швидко створювати професійні описи нерухомості через розумний конструктор шаблонів.",
  openGraph: {
    title: "CopyCraft AI — генератор текстів для нерухомості",
    description:
      "SaaS-платформа для генерації текстів нерухомості: шаблони, конструктор, білінг та швидкий запуск.",
    url: "/",
    siteName: "CopyCraft AI",
    locale: "uk_UA",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "CopyCraft AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CopyCraft AI — генератор текстів для нерухомості",
    description: "Швидка генерація контенту для рієлторів та агенцій.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <body>
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
          [ДЕМО-РЕЖИМ] Платіжна система імітована. Для реального SaaS я інтегрував би Paddle.
        </div>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
