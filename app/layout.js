import { Cairo, Outfit } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

export const metadata = {
  title: "إيكوم بوست برو — صفحات هبوط فائقة السرعة بـ Next.js للتجارة الإلكترونية بالمغرب",
  description:
    "نصمم لك صفحات هبوط فائقة السرعة مدعومة بـ Next.js لمضاعفة مبيعات تجارتك الإلكترونية في المغرب. سرعة أقل من ثانية، تصميم مخصص للهواتف، وباقة تبدأ من 250 درهم فقط.",
  keywords: [
    "تجارة إلكترونية بالمغرب",
    "صفحة هبوط",
    "Next.js المغرب",
    "landing page maroc",
    "مبيعات الدفع عند الاستلام",
    "زيادة مبيعات المتجر",
  ],
  authors: [{ name: "Mohammed" }],
  openGraph: {
    title: "إيكوم بوست برو — صفحات هبوط فائقة السرعة للتجارة الإلكترونية بالمغرب",
    description:
      "توقف عن خسارة المبيعات بسبب الصفحات البطيئة. صفحات Next.js سحابية تضاعف مبيعاتك في المغرب ابتداءً من 250 درهم.",
    type: "website",
    locale: "ar_MA",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${outfit.variable} antialiased`}>
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-cairo)] bg-[#06070a] text-white selection:bg-[#d4a843] selection:text-black">
        {children}
      </body>
    </html>
  );
}
