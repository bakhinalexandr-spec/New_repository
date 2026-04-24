import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DateMarket — Знакомства с открытой статистикой",
  description: "Рейтинги мужчин и девушек, реальная статистика спроса и предложения.",
  openGraph: {
    title: "DateMarket.ru — Рынок знакомств",
    description: "Открытые рейтинги и статистика. 4800+ участников.",
    url: "https://datemarket.ru",
    siteName: "DateMarket",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}