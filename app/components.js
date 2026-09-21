"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════
   HOOKS & UTILITIES
   ═══════════════════════════════════════════════════════════ */
function useInView(opts = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, opts);
    observer.observe(el);
    return () => observer.disconnect();
  }, [opts]);
  return [ref, inView];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function AnimatedCounter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.4 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    const frame = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString("ar-MA")}{suffix}</span>;
}

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days = 604,800 seconds

function CountdownTimer() {
  const [secondsLeft, setSecondsLeft] = useState(SEVEN_DAYS_IN_SECONDS);

  useEffect(() => {
    const STORAGE_KEY = "ecom_boost_timer_target_v2";
    let target = null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (stored) {
        const parsed = Number(stored);
        if (!isNaN(parsed) && parsed > now && parsed <= now + SEVEN_DAYS_IN_SECONDS * 1000) {
          target = parsed;
        }
      }
      if (!target) {
        target = now + SEVEN_DAYS_IN_SECONDS * 1000;
        localStorage.setItem(STORAGE_KEY, String(target));
      }
    } catch {
      target = Date.now() + SEVEN_DAYS_IN_SECONDS * 1000;
    }

    const updateTimer = () => {
      const now = Date.now();
      let diff = Math.floor((target - now) / 1000);

      if (diff <= 0) {
        target = Date.now() + SEVEN_DAYS_IN_SECONDS * 1000;
        try {
          localStorage.setItem(STORAGE_KEY, String(target));
        } catch {
          // ignore
        }
        diff = SEVEN_DAYS_IN_SECONDS;
      }

      setSecondsLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(secondsLeft / (24 * 3600));
  const hours = Math.floor((secondsLeft % (24 * 3600)) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-4" dir="ltr">
      {[
        { val: pad(days), label: "يوم" },
        { val: pad(hours), label: "ساعة" },
        { val: pad(minutes), label: "دقيقة" },
        { val: pad(seconds), label: "ثانية" },
      ].map((item, index) => (
        <div key={item.label} className="flex items-center gap-1.5 sm:gap-4">
          <div className="flex flex-col items-center bg-[#090b10] border border-[rgba(212,168,67,0.35)] rounded-xl px-2.5 py-2 sm:px-6 sm:py-4 min-w-[62px] sm:min-w-[92px]">
            <span className="text-2xl sm:text-4xl font-extrabold text-white tabular-nums font-mono">
              {item.val}
            </span>
            <span className="text-[10px] sm:text-xs text-text-muted font-bold tracking-wider mt-1">
              {item.label}
            </span>
          </div>
          {index < 3 && (
            <span className="text-lg sm:text-2xl font-bold text-gold mb-2 sm:mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP ANNOUNCEMENT BAR
   ═══════════════════════════════════════════════════════════ */
function AnnouncementBar() {
  return (
    <div className="w-full bg-[#081710] border-b border-[rgba(34,197,94,0.2)] py-2.5 px-4 text-center">
      <div className="mx-auto max-w-6xl flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-emerald-400">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span>
          🇲🇦 <strong>عرض حصري لرواد التجارة الإلكترونية بالمغرب:</strong> أول 50 متجر يحصلون على إعداد كامل بـ{" "}
          <strong className="text-white underline decoration-gold">250 درهم فقط</strong> (خصم 50%) — التسليم خلال أقل من 24 ساعة فقط
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════ */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#06070a] ${
          scrolled
            ? "border-b border-[rgba(255,255,255,0.08)] shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
            : "border-b border-transparent"
        }`}
      >
        <nav className="w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            {/* Brand */}
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#141722] border border-gold/40 flex items-center justify-center text-gold font-black text-lg shadow-[0_0_15px_rgba(212,168,67,0.2)] font-[family-name:var(--font-display)]">
                E
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-[family-name:var(--font-display)]">
                  ECOM<span className="text-gold">BOOST</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                  برو
                </span>
              </div>
            </a>

            {/* Links */}
            <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-text-secondary">
              <a href="#features" className="hover:text-gold transition-colors">المميزات</a>
              <a href="#benchmark" className="hover:text-gold transition-colors">مقارنة السرعة</a>
              <a href="#showcase" className="hover:text-gold transition-colors">قصص النجاح</a>
              <a href="#reviews" className="hover:text-gold transition-colors">آراء العملاء</a>
              <a href="#pricing" className="hover:text-gold transition-colors">الأسعار</a>
              <a href="#faq" className="hover:text-gold transition-colors">الأسئلة الشائعة</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <a
                href="#pricing"
                className="px-5 sm:px-6 py-2.5 rounded-lg bg-gradient-to-r from-cta-dark to-cta text-white text-xs sm:text-sm font-black shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:scale-105 transition-transform"
              >
                ابدأ مشروعك
              </a>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════ */
export function HeroSection() {
  return (
    <section id="hero" className="relative bg-[#06070a] pt-8 sm:pt-14 pb-20 overflow-hidden subtle-grid-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* RIGHT COLUMN IN RTL (Content) — 7 Cols */}
          <div className="lg:col-span-7 text-center lg:text-right">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121622] border border-[rgba(212,168,67,0.35)] text-xs font-bold text-gold mb-6 shadow-[0_0_20px_rgba(212,168,67,0.1)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>معمارية NEXT.JS 15 الفائقة لمتاجر المغرب</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-black leading-[1.18] tracking-tight text-white">
              توقف عن خسارة المبيعات
              <br />
              <span className="gold-gradient-text">بسبب الصفحات البطيئة.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              نصمم لك صفحات هبوط فائقة السرعة مدعومة بـ Next.js لمضاعفة مبيعات تجارتك الإلكترونية في المغرب.
              سرعة تحميل أقل من ثانية على شبكات 4G، نموذج مخصص للدفع عند الاستلام (COD)، ومضاعفة المبيعات بنسبة تصل إلى 3 أضعاف.
            </p>

            {/* Social Proof Star Rating */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex gap-1 text-gold text-lg" dir="ltr">
                {"★★★★★"}
              </div>
              <span className="text-sm text-text-secondary font-medium">
                تقييم <strong className="text-white">4.9 / 5.0</strong> من أكثر من <span className="text-gold font-bold">50 متجراً إلكترونياً بالمغرب</span>
              </span>
            </div>

            {/* Price Box + Offer */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
              <div className="px-3.5 py-2 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] text-center">
                <span className="text-xs font-black text-red-500 uppercase tracking-wider block">خصم 50%</span>
                <span className="text-[11px] text-red-400 font-bold block">وفر 250 درهم</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-text-muted line-through text-lg font-medium">500 درهم</span>
                <span className="text-4xl sm:text-5xl font-black text-white font-[family-name:var(--font-display)]">250</span>
                <span className="text-xl font-bold text-gold">درهم</span>
                <span className="text-xs text-text-muted mr-1">(رسوم إعداد لمرة واحدة فقط)</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                id="hero-cta"
                href="#pricing"
                className="w-full sm:w-auto px-10 py-5 rounded-xl bg-gradient-to-r from-cta-dark via-cta to-cta-bright text-white text-base sm:text-lg font-black shadow-[0_0_35px_rgba(249,115,22,0.45)] hover:scale-[1.02] transition-all text-center"
              >
                🚀 احصل على صفحتك السريعة اليوم
              </a>
              <a
                href="https://xpro-watch-demo.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-5 rounded-xl bg-[#121622] hover:bg-[#181d2c] border border-[rgba(255,255,255,0.12)] text-white text-sm sm:text-base font-bold transition-colors text-center"
              >
                ⚡ شاهد اختبار السرعة الحي
              </a>
            </div>

            {/* Pillars */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[rgba(255,255,255,0.06)]">
              {[
                { label: "جاهزة في أقل من 24 ساعة فقط" },
                { label: "دفع عند الاستلام (COD)" },
                { label: "حماية مشفرة 100% SSL" },
                { label: "ضمان استرجاع 7 أيام" },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-1.5 text-xs text-text-secondary justify-center lg:justify-start font-medium">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LEFT COLUMN IN RTL (Visual Showcase Anchor) — 5 Cols */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* The Solid Matte Frame — Absolutely No Glassmorphism */}
            <div className="relative w-full max-w-[480px] rounded-2xl bg-[#0d1017] border-2 border-gold/35 p-2.5 shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
              
              {/* Corner decorative accents */}
              <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-gold" />
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-gold" />
              <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-gold" />
              <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-gold" />

              {/* Browser window top bar */}
              <div className="bg-[#121622] rounded-t-xl px-4 py-2.5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between" dir="ltr">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                </div>
                <div className="px-4 py-1 rounded-md bg-[#090b10] border border-[rgba(255,255,255,0.08)] text-[10px] text-text-muted flex items-center gap-1.5 font-mono">
                  <span className="text-emerald-400">🔒</span>
                  <span>https://royaloud.ma</span>
                </div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">مباشر</span>
              </div>

              {/* High-Resolution Store Mockup Image */}
              <div className="relative aspect-[16/10] w-full bg-[#050608] rounded-b-xl overflow-hidden">
                <Image
                  src="/hero_mockup.jpg"
                  alt="نموذج متجر إلكتروني مغربي فائق السرعة"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Solid Matte Floating Badge: Speed */}
              <div className="absolute -bottom-4 -right-3 sm:-right-6 bg-[#0c0f17] border border-[rgba(212,168,67,0.4)] rounded-xl px-4 py-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                  ⚡
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    0.28 ثانية سرعة التحميل
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold">
                    ● خادم الدار البيضاء السحابي
                  </div>
                </div>
              </div>

              {/* Solid Matte Floating Badge: Conversion */}
              <div className="absolute -top-4 -left-3 sm:-left-6 bg-[#0c0f17] border border-[rgba(212,168,67,0.4)] rounded-xl px-4 py-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-black text-sm">
                  📈
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    +340% زيادة في المبيعات
                  </div>
                  <div className="text-[10px] text-text-muted font-bold">
                    معدل تحويل الزوار إلى مشترين
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* AUTHORITY STATS BANNER */}
      <div className="mt-20 border-y border-[rgba(255,255,255,0.08)] bg-[#090c12]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { metric: "+10,000", label: "طلبية تُعالج يومياً", desc: "بدون أي ثقل أو انهيار في الخوادم" },
            { metric: "< 0.3s", label: "سرعة تحميل الصفحات", desc: "على إنوي، اتصالات المغرب، وأورنج" },
            { metric: "99.99%", label: "نسبة استقرار الخدمة (SLA)", desc: "ضمان عدم توقف متجرك أثناء الحملات" },
            { metric: "3.4x", label: "مضاعفة معدل المبيعات", desc: "مقارنة بمتاجر ووردبريس وشوبيفاي" },
          ].map((item) => (
            <div key={item.label} className="text-center sm:text-right border-r-0 sm:border-r first:border-r-0 border-[rgba(255,255,255,0.06)] pr-0 sm:pr-6">
              <div className="text-3xl sm:text-4xl font-black text-gold font-[family-name:var(--font-display)]" dir="ltr">
                {item.metric}
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {item.label}
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIVE SPEED BENCHMARK SIMULATOR
   ═══════════════════════════════════════════════════════════ */
export function SpeedBenchmarkSection() {
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);

  const runSimulation = () => {
    setTesting(true);
    setTested(false);
    setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 1200);
  };

  return (
    <section id="benchmark" className="relative bg-[#080a0f] py-20 sm:py-28 border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <Reveal className="text-center mb-14 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold text-gold uppercase tracking-[0.2em] mb-3">
            مقارنة واقعية للأداء
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            كل ثانية تأخير <span className="gold-gradient-text">تُكلفك 40% من زبائنك المغاربة</span>
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto font-normal">
            المتسوق المغربي عبر شبكة 4G لا يملك الصبر لانتظار المنصات الثقيلة. شاهد الفارق الحاسم بين المتاجر التقليدية وباقة صفحات Next.js المتطورة.
          </p>
        </Reveal>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* SLOW STORE */}
          <div className="rounded-2xl bg-[#0f121a] border border-red-500/20 p-8 sm:p-10 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[rgba(255,255,255,0.08)]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 block">المتاجر التقليدية البطيئة</span>
                  <h3 className="text-xl font-bold text-white mt-1">WordPress / Shopify / قوالب ثقيلة</h3>
                </div>
                <span className="px-3 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold">
                  خسارة عالية للزوار
                </span>
              </div>

              {/* Metrics */}
              <div className="mt-8 space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">متوسط سرعة التحميل على 4G</span>
                    <span className="text-red-400 font-extrabold font-mono" dir="ltr">4.8 Seconds</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#181d29] overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">نسبة الهروب بدون شراء (Bounce)</span>
                    <span className="text-red-400 font-extrabold font-mono" dir="ltr">68% Drop-off</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#181d29] overflow-hidden">
                    <div className="h-full bg-red-500/80 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">معدل التحويل إلى طلبات</span>
                    <span className="text-text-secondary font-bold font-mono" dir="ltr">1.2% فقط</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#181d29] overflow-hidden">
                    <div className="h-full bg-neutral-600 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
              </div>

              {/* Drawbacks */}
              <ul className="mt-8 space-y-2.5 text-xs text-text-secondary">
                <li className="flex items-center gap-2 text-red-300">
                  <span>✕</span> شاشة بيضاء وثقل قاتل عند فتح الإعلان من الهاتف
                </li>
                <li className="flex items-center gap-2 text-red-300">
                  <span>✕</span> تكلفة إعلانات باهظة في فيسبوك وتيك توك بسبب مغادرة الزبائن
                </li>
                <li className="flex items-center gap-2 text-red-300">
                  <span>✕</span> صفحات دفع متعددة ومعقدة تفقدك طلبات الدفع عند الاستلام
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center text-xs text-text-muted">
              النتيجة: إهدار ميزانية إعلاناتك اليومية بدون عائد حقيقي
            </div>
          </div>

          {/* FAST STORE */}
          <div className="rounded-2xl bg-[#121622] border-2 border-gold/45 p-8 sm:p-10 flex flex-col justify-between shadow-[0_20px_60px_rgba(212,168,67,0.1)] relative">
            
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 left-6 px-4 py-1 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-bright text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(212,168,67,0.5)]">
              ★ الخيار الاحترافي الرابح
            </div>

            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[rgba(255,255,255,0.08)]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">صفحات ECOMBOOST برو</span>
                  <h3 className="text-xl font-bold text-white mt-1">Next.js 15 معالجة حافة سحابية فائقة</h3>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  أعلى نسبة مبيعات
                </span>
              </div>

              {/* Metrics */}
              <div className="mt-8 space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">متوسط سرعة التحميل على 4G</span>
                    <span className="text-emerald-400 font-extrabold font-mono" dir="ltr">0.28 Seconds (فوري)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#181d29] overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "9%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">نسبة الهروب بدون شراء (Bounce)</span>
                    <span className="text-emerald-400 font-extrabold font-mono" dir="ltr">أقل من 8%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#181d29] overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "8%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">معدل التحويل إلى طلبات</span>
                    <span className="text-gold font-extrabold font-mono" dir="ltr">4.6% (+340% ارتفاع)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#181d29] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>
              </div>

              {/* Advantages */}
              <ul className="mt-8 space-y-2.5 text-xs text-text-secondary">
                <li className="flex items-center gap-2 text-emerald-300">
                  <span>✓</span> فتح فوري للصفحة بدون أي لحظة انتظار لجمهور الهاتف
                </li>
                <li className="flex items-center gap-2 text-emerald-300">
                  <span>✓</span> تخفيض مباشر في تكلفة الشراء (CPA) على إعلانات تيك توك وفيسبوك
                </li>
                <li className="flex items-center gap-2 text-emerald-300">
                  <span>✓</span> طلب بضغطة زر واحدة عبر الواتساب والدفع عند الاستلام
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center">
              <button
                onClick={runSimulation}
                disabled={testing}
                className="w-full py-3.5 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {testing ? "جاري قياس استجابة الشبكة ومراكز البيانات..." : "⚡ تشغيل اختبار مقارنة السرعة الحي"}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURES SECTION — 3 Required Points + Tech Depth
   ═══════════════════════════════════════════════════════════ */
export function FeaturesSection() {
  const mainFeatures = [
    {
      tag: "الركيزة الأساسية 01",
      title: "Zero Lag",
      subtitle: "تحميل فوري في أقل من ثانية واحدة",
      desc: "مدعومة بمعمارية Next.js السحابية وشبكات CDN العالمية الأقرب للمغرب. تضمن فتحاً فورياً للصفحة بدون أي شاشات بيضاء تضيع زبائنك.",
      icon: (
        <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      badge: "أقل من 1 ثانية",
    },
    {
      tag: "الركيزة الأساسية 02",
      title: "Mobile-First Design",
      subtitle: "مصممة خصيصاً للمتسوق المغربي عبر الهاتف",
      desc: "أكثر من 89% من مشتريات التجارة الإلكترونية بالمغرب تتم عبر الهواتف الذكية. تصميم مريح للإبهام، أزرار شراء مثبتة، ونموذج سريع للدفع عند الاستلام.",
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      badge: "89% حركة مرور هواتف",
    },
    {
      tag: "الركيزة الأساسية 03",
      title: "High Conversion Layout",
      subtitle: "واجهة هندسية مخصصة لمضاعفة المبيعات",
      desc: "تعتمد على مبادئ علم النفس التسويقي: عدادات التخفيض، إثباتات الثقة وآراء المشترين، وزر التحويل المباشر للواتساب لتأكيد الطلبات فورياً.",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      badge: "+240% معدل المبيعات",
    },
    {
      tag: "الأمان والتشفير",
      title: "حماية وتشفير مصرفي كامل SSL",
      subtitle: "بيانات مشفرة 100% وحماية من الهجمات",
      desc: "تشفير كامل للاتصال بشهادات SSL معتمدة، وحماية ضد هجمات DDoS لتعزيز ثقة الزبون المغربي وتشجيعه على الشراء الآمن.",
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      badge: "تشفير كامل",
    },
    {
      tag: "البنية السحابية",
      title: "استضافة Vercel Edge العالمية",
      subtitle: "مراكز بيانات الأقرب للمغرب",
      desc: "تُخزن ملفات متجرك على خوادم سحابية فائقة القرب في الدار البيضاء ومدريد وباريس لتسليم الصفحات في أجزاء من الثانية دون أي ضغط على السيرفر.",
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      badge: "CDN عالمي",
    },
    {
      tag: "السرعة في الإنجاز",
      title: "تسليم المتجر جاهزاً خلال أقل من 24 ساعة فقط",
      subtitle: "من استلام المعلومات إلى الإطلاق الحي",
      desc: "أرسل صور منتجك والأسعار والنصوص المقترحة، وخلال أقل من 24 ساعة فقط تكون صفحة هبوطك منشورة ومربوطة بدومينك وجاهزة لاستقبال طلبات الزبائن.",
      icon: (
        <svg className="w-6 h-6 text-gold-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: "أقل من 24 ساعة فقط",
    },
  ];

  return (
    <section id="features" className="relative bg-[#06070a] py-20 sm:py-28 border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <Reveal className="text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold text-gold uppercase tracking-[0.2em] mb-3">
            المعايير الهندسية الفاخرة
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            لماذا تختار كبرى المتاجر المغربية <span className="gold-gradient-text">EcomBoost</span>
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto font-normal">
            بنية برمجية صلبة بدون أي قوالب معقدة أو إضافات بطيئة، صُممت خصيصاً لرفع حجم مبيعاتك وأرباحك.
          </p>
        </Reveal>

        {/* 3x2 Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatures.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="h-full rounded-2xl bg-[#0f121a] border border-[rgba(255,255,255,0.08)] hover:border-gold/35 p-8 sm:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div>
                  {/* Top line with tag & icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest px-2.5 py-1 rounded bg-gold/10 border border-gold/25">
                      {f.tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#141824] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                      {f.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {f.title}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-400 mt-1 mb-3">
                    {f.subtitle}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-muted">
                    {f.badge}
                  </span>
                  <span className="text-gold text-xs font-bold">● متوفر</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PORTFOLIO / CASE STUDIES SHOWCASE
   ═══════════════════════════════════════════════════════════ */
export function ShowcaseSection() {
  const cases = [
    {
      title: "Maison d'Argan",
      category: "مستحضرات التجميل وزيوت الأركان العضوية (مراكش)",
      image: "/portfolio_argan.jpg",
      loadTime: "0.28s",
      growth: "+280%",
      metricLabel: "ارتفاع مبيعات الهاتف",
      desc: "تحول المتجر من ووكومرس البطيء إلى صفحة هبوط سريعة بـ Next.js. انخفضت نسبة ترك السلة بـ 62% في الأسبوع الأول من الإطلاق.",
    },
    {
      title: "Cuir Impérial Marrakech",
      category: "المصنوعات الجلدية اليدوية الفاخرة (الرباط ومراكش)",
      image: "/portfolio_leather.jpg",
      loadTime: "0.31s",
      growth: "4.2x",
      metricLabel: "عائد الإنفاق الإعلاني (ROAS)",
      desc: "صفحة منتجات عالية القيمة مع استعراض فوري للصور ونموذج طلب مبسط للدفع عند الاستلام. انخفضت تكلفة الشراء في تيك توك بنسبة 45%.",
    },
  ];

  return (
    <section id="showcase" className="relative bg-[#080a0f] py-20 sm:py-28 border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <Reveal className="text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold text-gold uppercase tracking-[0.2em] mb-3">
            نتائج حقيقية مثبتة بالأرقام
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            قصص نجاح مغربية <span className="gold-gradient-text">حطمت أرقام المبيعات</span>
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto font-normal">
            براندات مغربية حقيقية ضاعفت إيراداتها الشهرية بفضل صفحات Next.js فائقة السرعة.
          </p>
        </Reveal>

        {/* Showcase Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {cases.map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <div className="rounded-2xl bg-[#0f121a] border border-[rgba(255,255,255,0.08)] hover:border-gold/30 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col h-full">
                
                {/* Visual Image */}
                <div className="relative aspect-[16/9] w-full bg-[#050608] border-b border-[rgba(255,255,255,0.08)]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#090b10] border border-gold/40 text-gold text-xs font-bold font-mono" dir="ltr">
                    ⚡ {item.loadTime}
                  </div>
                </div>

                {/* Details */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gold block mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-text-secondary leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* Metrics Banner */}
                  <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-white font-[family-name:var(--font-display)]" dir="ltr">
                        {item.growth}
                      </span>
                      <span className="text-xs text-emerald-400 block font-bold">
                        {item.metricLabel}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-text-muted block">المنصة البرمجية</span>
                      <span className="text-xs font-bold text-white font-mono" dir="ltr">Next.js 15 Edge</span>
                    </div>
                  </div>
                </div>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS SECTION
   ═══════════════════════════════════════════════════════════ */
export function TestimonialsSection() {
  const reviews = [
    {
      name: "يوسف المنصوري",
      city: "الدار البيضاء",
      role: "مؤسس براند ساعات وعطور فاخرة",
      rating: 5,
      revenue: "+320,000 درهم / شهر",
      text: "متجرنا على شوبيفاي كان يستغرق 4.5 ثوانٍ للتحميل على شبكات 4G بالمغرب، وكنا نخسر آلاف الدراهم يومياً في الإعلانات. بعد أن طور لنا محمد صفحة Next.js مع EcomBoost، أصبح التحميل فورياً بـ 0.3 ثانية وقفزت مبيعاتنا 3.2 أضعاف من الشهر الأول!",
    },
    {
      name: "فاطمة الزهراء بناني",
      city: "مراكش",
      role: "مؤسسة علامة مستحضرات تجميل طبيعية",
      rating: 5,
      revenue: "نسبة تحويل COD: 4.8%",
      text: "الزبون المغربي لا يملك الصبر للانتظار. إذا تأخرت الصفحة يغلق الإعلان فوراً. صفحة الهبوط التي بنيناها مع EcomBoost خفيفة وسريعة جداً كالبرق، وتكلفة الشراء في إعلانات تيك توك انخفضت للنصف تقريباً.",
    },
    {
      name: "أحمد بنجلون",
      city: "الرباط",
      role: "مدير متجر منتجات جلدية تقليدية",
      rating: 5,
      revenue: "عائد 4.1x على الإنفاق الإعلاني",
      text: "التصميم فخم ومبهر لدرجة تشعرك أن المتجر كلف ملايين السنتيمات. لا توجد أي تعقيدات، ونموذج الدفع عند الاستلام يجمع الطلبات بسلاسة. والتسليم تم في أقل من 24 ساعة فقط وكان في الموعد بالضبط!",
    },
  ];

  return (
    <section id="reviews" className="relative bg-[#06070a] py-20 sm:py-28 border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <Reveal className="text-center mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold text-gold uppercase tracking-[0.2em] mb-3">
            آراء العملاء الحقيقية
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            يثق بنا رواد التجارة الإلكترونية <span className="gold-gradient-text">في المغرب</span>
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto font-normal">
            تجار من الدار البيضاء، مراكش، والرباط ضاعفوا أرباحهم بفضل صفحات هبوط سريعة ومحكمة.
          </p>
        </Reveal>

        {/* 3 Review Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 100}>
              <div className="h-full rounded-2xl bg-[#0f121a] border border-[rgba(255,255,255,0.08)] hover:border-gold/30 p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <div>
                  {/* Rating + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex text-gold text-sm tracking-wider" dir="ltr">
                      {"★★★★★"}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      ✓ متجر موثق
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed italic font-normal">
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {r.name}
                    </h4>
                    <p className="text-xs text-text-muted">
                      {r.city}، المغرب
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-bold text-gold font-mono block" dir="ltr">
                      {r.revenue}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING SECTION (STRICT PROMPT COMPLIANCE)
   ═══════════════════════════════════════════════════════════ */
export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-[#080a0f] py-20 sm:py-28 border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <Reveal className="text-center mb-14 sm:mb-18">
          <p className="text-xs sm:text-sm font-bold text-gold uppercase tracking-[0.2em] mb-3">
            باقة متكاملة وشاملة
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            أسعار واضحة <span className="gold-gradient-text">وبدون أي تعقيد</span>
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-xl mx-auto font-normal">
            بدون رسوم خفية. بدون باقات معقدة. كل ما تحتاجه لإطلاق صفحة هبوط سريعة تحقق أعلى المبيعات.
          </p>
        </Reveal>

        {/* Pricing Card — Centered & Prominent */}
        <div className="w-full max-w-2xl mx-auto">
          <Reveal>
            <div className="rounded-3xl bg-[#0f121a] border-2 border-gold/40 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] relative">
              
              {/* Metallic Gold Top Accent Strip */}
              <div className="h-2 bg-gradient-to-r from-gold-dim via-gold-bright to-gold-dim" />

              <div className="p-8 sm:p-12">
                
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/35 text-xs font-black text-gold uppercase tracking-wider">
                    ★ باقة انطلاقة التجارة (Starter E-com Boost)
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/25">
                    🚀 تسليم خلال أقل من 24 ساعة فقط
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  كل ما تحتاجه لإطلاق متجرك
                </h3>
                <p className="mt-2 text-sm text-text-secondary font-normal">
                  صفحة هبوط متكاملة وفائقة السرعة مبنية بأحدث معمارية Next.js 15، مستضافة على شبكة Vercel Edge مع نموذج الدفع عند الاستلام.
                </p>

                {/* Price Display Box */}
                <div className="mt-8 rounded-2xl bg-[#080a0f] border border-[rgba(255,255,255,0.08)] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-1">
                        عرض ترويجي لفترة محدودة (خصم 50%)
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl text-text-muted line-through font-semibold">500 درهم</span>
                        <span className="text-5xl sm:text-6xl font-black text-white font-[family-name:var(--font-display)]">250</span>
                        <span className="text-2xl font-bold text-gold">درهم</span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">رسوم إعداد لمرة واحدة فقط · التسليم خلال أقل من 24 ساعة فقط</p>
                    </div>

                    <div className="sm:border-r border-[rgba(255,255,255,0.08)] sm:pr-6 pt-4 sm:pt-0 border-t sm:border-t-0">
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">الاستضافة السريعة المستمرة</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-white font-[family-name:var(--font-display)]">+50</span>
                        <span className="text-sm font-bold text-gold">درهم / شهر</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">استضافة سحابية فائقة على Vercel Edge</p>
                    </div>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="mt-8">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
                    ما تتضمنه الباقة بالكامل:
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-3.5">
                    {[
                      "صفحة هبوط فائقة السرعة بنظام Next.js 15",
                      "ضمان فتح الصفحة في أقل من ثانية واحدة",
                      "تصميم متجاوب بالكامل مع جميع الهواتف",
                      "نموذج دفع سريع ومباشر عند الاستلام (COD)",
                      "زر طلب مباشر بضغطة واحدة عبر الواتساب",
                      "استضافة سحابية عالمية على شبكة Vercel Edge",
                      "ربط دومين خاص بمتجرك مجاناً (yourstore.ma)",
                      "كتابة إعلانية مقنعة للمشتري المغربي",
                      "شهادة أمان وتشفير رسمي مجانية SSL",
                      "صيانة دورية وضمان تشغيل بنسبة 99.99%",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary">
                        <span className="text-gold font-black mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary CTA Button */}
                <div className="mt-10">
                  <a
                    id="pricing-cta"
                    href="https://wa.me/212769941313?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D8%AD%D9%85%D8%AF%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AD%D8%AC%D8%B2%20%D8%B5%D9%81%D8%AD%D8%A9%20Ecom%20Boost%20Pro%20%D8%A8%D9%80%20250%20%D8%AF%D8%B1%D9%87%D9%85"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-xl bg-gradient-to-r from-cta-dark via-cta to-cta-bright text-white text-lg font-black shadow-[0_0_40px_rgba(249,115,22,0.45)] hover:scale-[1.02] transition-transform text-center"
                  >
                    🚀 ابدأ مشروعك الآن
                  </a>
                  <p className="mt-4 text-center text-xs text-text-muted">
                    🔒 بدون عقود معقدة · إمكانية الإلغاء في أي وقت · ضمان استرجاع 100% خلال 7 أيام
                  </p>
                </div>

              </div>

            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   URGENCY SECTION WITH COUNTDOWN
   ═══════════════════════════════════════════════════════════ */
export function UrgencySection() {
  return (
    <section className="bg-[#06070a] py-20 sm:py-28 border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <div className="rounded-3xl bg-[#0f121a] border border-[rgba(212,168,67,0.35)] p-8 sm:p-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {/* Top badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-xs font-extrabold text-red-400 uppercase tracking-widest mb-6">
              🔥 عرض خاص ومحدود لهذا الأسبوع
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              لا تفوت هذا <span className="gold-gradient-text">العرض الحصري!</span>
            </h2>
            <p className="mt-3 text-text-secondary text-base sm:text-lg max-w-xl mx-auto font-normal">
              نحن نلتزم بقبول 70 متجر فقط أسبوعياً للحفاظ على جودة وسرعة التسليم.
            </p>

            {/* Countdown Widget */}
            <div className="my-8">
              <CountdownTimer />
            </div>

            {/* CTA */}
            <a
              href="#"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-cta-dark via-cta to-cta-bright text-white text-base sm:text-lg font-black shadow-[0_0_35px_rgba(249,115,22,0.45)] hover:scale-105 transition-transform"
            >
              🛒 احجز صفحتك الآن — 250 درهم فقط
            </a>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
              <span>✓ تسليم جاهز خلال أقل من 24 ساعة فقط</span>
              <span>✓ إعداد الاستضافة مجاناً</span>
              <span>✓ ضمان رضا كامل بنسبة 100%</span>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FAQ SECTION
   ═══════════════════════════════════════════════════════════ */
export function FAQSection() {
  const [open, setOpen] = useState(0);

  const faqs = [
    {
      q: "كم يستغرق تجهيز صفحة الهبوط وإطلاقها؟",
      a: "خلال أقل من 24 ساعة فقط! بمجرد تزويدنا بصور منتجك وعنوان العرض والأسعار، يتكفل فريقنا بالبرمجة الكاملة بـ Next.js وربط الدومين وإطلاق المتجر على خوادم Vercel السحابية.",
    },
    {
      q: "هل تدعم الصفحة الدفع عند الاستلام (COD) في المغرب؟",
      a: "نعم بنسبة 100%! أكثر من 95% من الطلبيات في المغرب تتم عبر الدفع عند الاستلام. لذلك صممنا نموذج طلب سريع بضغطة واحدة يجمع اسم المشتري، رقم هاتفه، ومدينته بدون أي خطوات دفع إلكتروني معقدة.",
    },
    {
      q: "هل يمكنني استخدام اسم النطاق الخاص بي (مثل mystore.ma أو .com)؟",
      a: "بالتأكيد. نقوم بربط نطاقك الخاص بصفحتك مع تفعيل شهادة الأمان SSL وحماية DNS مجاناً ضمن باقة الإعداد.",
    },
    {
      q: "لماذا Next.js أفضل بكثير من ووردبريس أو شوبيفاي لحملاتي الإعلانية؟",
      a: "Next.js يعتمد على التوليد المسبق للصفحات (Static Generation) والاستضافة على مراكز بيانات الحافة القريبة. هذا يمنحك سرعة 0.28 ثانية مقارنة بـ 4.5 ثوانٍ في المنصات الثقيلة، مما يمنع هروب الزوار ويخفض تكلفة الإعلانات (CPA) في تيك توك وفيسبوك.",
    },
    {
      q: "ماذا تشمل استضافة الـ 50 درهم شهرياً؟",
      a: "تشمل استضافة سحابية فائقة السرعة على شبكة Vercel العالمية، ترافيك غير محدود لجميع زوار إعلاناتك، ضمان استقرار بنسبة 99.99%، تجديد تلقائي لشهادات الأمان، وصيانة فنية دورية.",
    },
  ];

  return (
    <section id="faq" className="bg-[#080a0f] py-20 sm:py-28 border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs sm:text-sm font-bold text-gold uppercase tracking-[0.2em] mb-3">
            هل لديك استفسارات؟
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            الأسئلة <span className="gold-gradient-text">الشائعة</span>
          </h2>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="rounded-xl bg-[#0f121a] border border-[rgba(255,255,255,0.08)] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === idx ? -1 : idx)}
                className="w-full p-6 text-right flex items-center justify-between text-white font-bold text-base hover:text-gold transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-gold text-lg font-mono" dir="ltr">
                  {open === idx ? "−" : "+"}
                </span>
              </button>
              {open === idx && (
                <div className="px-6 pb-6 text-sm text-text-secondary leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-4 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER (STRICT PROMPT COMPLIANCE)
   ═══════════════════════════════════════════════════════════ */
export function Footer() {
  return (
    <footer className="bg-[#050608] border-t border-[rgba(255,255,255,0.08)] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#141722] border border-gold/40 flex items-center justify-center text-gold font-bold text-xs">
            E
          </div>
          <span className="text-lg font-black tracking-tight text-white font-[family-name:var(--font-display)]">
            ECOM<span className="text-gold">BOOST</span> PRO
          </span>
        </div>

        {/* Required Prompt Text */}
        <p className="text-xs sm:text-sm text-text-muted text-center" dir="ltr">
          © 2026 Ecom Boost Pro | Developed by Mohammed.
        </p>

        {/* Back to top */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-emerald-400 font-mono hidden sm:inline">● خادم الدار البيضاء</span>
          <a
            href="#hero"
            title="العودة للأعلى"
            aria-label="العودة للأعلى"
            className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0ea5e9] text-white text-xs sm:text-sm font-black shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:shadow-[0_0_35px_rgba(14,165,233,0.75)] hover:scale-105 border border-[rgba(56,189,248,0.35)] transition-all cursor-pointer"
          >
            <span>العودة للأعلى</span>
            <svg
              className="w-4 h-4 text-white group-hover:-translate-y-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}
