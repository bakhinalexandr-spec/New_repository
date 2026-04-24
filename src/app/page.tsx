"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface PlatformStats { totalUsers: number; maleCount: number; femaleCount: number; avgReplyRate: number; secondReplyRate: number; avgAdmirers: number; avgIncoming: number; newToday: number; onlineNow: number; giftsToday: number; messagesLastHour: number; }
interface TopMale { rank: number; name: string; city: string; age: number; attractiveness: number; wealth: number; score: number; avatar: string; }
interface TopFemale { rank: number; name: string; city: string; age: number; messages24h: number; admirers: number; replyRate: number; popularity: string; avatar: string; }
interface TickerItem { text: string; type: "message" | "gift" | "match" | "join"; }

const MOCK_STATS: PlatformStats = { totalUsers: 4821, maleCount: 2903, femaleCount: 1918, avgReplyRate: 34.7, secondReplyRate: 18.2, avgAdmirers: 3.4, avgIncoming: 12.8, newToday: 47, onlineNow: 312, giftsToday: 23, messagesLastHour: 1847 };

const MOCK_TOP_MALES: TopMale[] = [
  { rank: 1, name: "Александр К.", city: "Москва", age: 29, attractiveness: 94, wealth: 88, score: 972, avatar: "АК" },
  { rank: 2, name: "Дмитрий В.", city: "СПб", age: 31, attractiveness: 87, wealth: 95, score: 941, avatar: "ДВ" },
  { rank: 3, name: "Максим Р.", city: "Казань", age: 26, attractiveness: 91, wealth: 72, score: 887, avatar: "МР" },
  { rank: 4, name: "Иван С.", city: "Москва", age: 34, attractiveness: 79, wealth: 91, score: 854, avatar: "ИС" },
  { rank: 5, name: "Артём Н.", city: "Екб", age: 28, attractiveness: 83, wealth: 78, score: 821, avatar: "АН" },
];

const MOCK_TOP_FEMALES: TopFemale[] = [
  { rank: 1, name: "Анна М.", city: "Москва", age: 24, messages24h: 187, admirers: 34, replyRate: 12, popularity: "🔥 Горячая", avatar: "АМ" },
  { rank: 2, name: "Виктория Л.", city: "СПб", age: 22, messages24h: 143, admirers: 28, replyRate: 18, popularity: "⚡ Популярная", avatar: "ВЛ" },
  { rank: 3, name: "Екатерина Ж.", city: "Москва", age: 26, messages24h: 119, admirers: 21, replyRate: 31, popularity: "⚡ Популярная", avatar: "ЕЖ" },
  { rank: 4, name: "Мария К.", city: "Казань", age: 23, messages24h: 98, admirers: 17, replyRate: 42, popularity: "✨ Востребована", avatar: "МК" },
  { rank: 5, name: "Дарья П.", city: "Новосиб", age: 25, messages24h: 84, admirers: 14, replyRate: 55, popularity: "✨ Востребована", avatar: "ДП" },
];

const TICKER_ITEMS: TickerItem[] = [
  { text: "Александр из Москвы отправил подарок Анне", type: "gift" },
  { text: "Новый участник из Санкт-Петербурга", type: "join" },
  { text: "Дмитрий написал 3 новых сообщения за минуту", type: "message" },
  { text: "Виктория ответила впервые за 7 дней", type: "match" },
  { text: "Максим из Казани отправил подарок", type: "gift" },
  { text: "Новая участница получила 12 сообщений за час", type: "message" },
  { text: "Иван поднялся на 2 позиции в рейтинге", type: "match" },
  { text: "Анна набрала 187 сообщений за сутки — рекорд!", type: "match" },
];

function useCountUp(target: number, duration = 1800, start = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const raf = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function StatCard({ label, value, suffix = "", prefix = "", delta, accent = false, animTarget, decimals = 0 }: { label: string; value?: string | number; suffix?: string; prefix?: string; delta?: string; accent?: boolean; animTarget?: number; decimals?: number; }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useCountUp(animTarget ?? 0, 1800, visible && animTarget !== undefined);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const displayVal = animTarget !== undefined ? animated.toLocaleString("ru-RU") : typeof value === "number" ? value.toLocaleString("ru-RU") : value;
  return (
    <div ref={ref} className={`stat-card ${accent ? "stat-card--accent" : ""}`} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{prefix}{displayVal}{suffix}</div>
      {delta && <div className="stat-delta">{delta}</div>}
    </div>
  );
}

function Ticker() {
  const [pos, setPos] = useState(0);
  useEffect(() => { const id = setInterval(() => setPos(p => (p + 1) % TICKER_ITEMS.length), 3500); return () => clearInterval(id); }, []);
  const typeColor: Record<string, string> = { gift: "#f59e0b", join: "#10b981", message: "#60a5fa", match: "#f472b6" };
  return (
    <div className="ticker-wrap">
      <span className="ticker-badge">LIVE</span>
      <div className="ticker-track">
        {TICKER_ITEMS.map((item, i) => (
          <span key={i} className="ticker-item" style={{ opacity: i === pos ? 1 : 0, position: "absolute", left: 0, right: 0, transition: "opacity 0.4s" }}>
            <span style={{ color: typeColor[item.type], marginRight: 6 }}>{item.type === "gift" ? "🎁" : item.type === "join" ? "👤" : item.type === "match" ? "💫" : "✉"}</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function MaleRankRow({ m, delay }: { m: TopMale; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 }); if (ref.current) obs.observe(ref.current); }, delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div ref={ref} className="rank-row" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-16px)", transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms` }}>
      <div className="rank-num">#{m.rank}</div>
      <div className="rank-avatar rank-avatar--male">{m.avatar}</div>
      <div className="rank-info"><div className="rank-name">{m.name}</div><div className="rank-meta">{m.city} · {m.age} лет</div></div>
      <div className="rank-bars">
        <div className="rank-bar-row"><span className="rank-bar-label">Привл.</span><div className="rank-bar-track"><div className="rank-bar-fill rank-bar-fill--blue" style={{ width: `${m.attractiveness}%` }} /></div><span className="rank-bar-val">{m.attractiveness}</span></div>
        <div className="rank-bar-row"><span className="rank-bar-label">Обесп.</span><div className="rank-bar-track"><div className="rank-bar-fill rank-bar-fill--amber" style={{ width: `${m.wealth}%` }} /></div><span className="rank-bar-val">{m.wealth}</span></div>
      </div>
      <div className="rank-score">{m.score}</div>
    </div>
  );
}

function FemaleRankRow({ f, delay }: { f: TopFemale; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 }); if (ref.current) obs.observe(ref.current); }, delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div ref={ref} className="rank-row" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(16px)", transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms` }}>
      <div className="rank-num">#{f.rank}</div>
      <div className="rank-avatar rank-avatar--female">{f.avatar}</div>
      <div className="rank-info"><div className="rank-name">{f.name}</div><div className="rank-meta">{f.city} · {f.age} лет</div></div>
      <div className="rank-stats-col"><div className="rank-stat-pill rank-stat-pill--pink">{f.messages24h} сообщ/сут</div><div className="rank-stat-pill rank-stat-pill--purple">{f.admirers} поклон.</div></div>
      <div className="rank-popularity">{f.popularity}</div>
    </div>
  );
}

export default function HomePage() {
  const stats = MOCK_STATS;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="logo"><span className="logo-mark">DM</span><span className="logo-text">DateMarket</span><span className="logo-tag">RU</span></div>
          <nav className="nav">
            <Link href="/ratings" className="nav-link">Рейтинги</Link>
            <Link href="/girls" className="nav-link">Девушки</Link>
            <Link href="/guys" className="nav-link">Парни</Link>
          </nav>
          <div className="header-actions">
            <Link href="/login" className="btn-ghost">Войти</Link>
            <Link href="/register" className="btn-primary">Начать</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-inner">
          <div className="hero-eyebrow" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(8px)", transition: "all 0.6s ease 0.1s" }}>
            <span className="live-dot" /> Рынок знакомств · {stats.onlineNow} онлайн сейчас
          </div>
          <h1 className="hero-title" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)", transition: "all 0.7s ease 0.2s" }}>
            Знакомства с открытой<br /><span className="hero-title-accent">статистикой рынка</span>
          </h1>
          <p className="hero-sub" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transition: "all 0.7s ease 0.35s" }}>
            Рейтинги мужчин и девушек, реальные метрики спроса и предложения, публичная статистика платформы — обновляется каждый час.
          </p>
          <div className="hero-cta" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transition: "all 0.7s ease 0.5s" }}>
            <Link href="/register?gender=female" className="btn-primary btn-lg">🎁 Девушкам — подарок при регистрации</Link>
            <Link href="/register?gender=male" className="btn-outline btn-lg">Войти в рейтинг</Link>
          </div>
        </div>
        <Ticker />
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-header"><h2 className="section-title">Статистика платформы</h2><span className="section-badge">Обновлено 15 мин назад</span></div>
          <div className="stats-grid">
            <StatCard label="Всего участников" animTarget={stats.totalUsers} delta={`+${stats.newToday} за сутки`} accent />
            <StatCard label="Мужчин / Женщин" value={`${stats.maleCount.toLocaleString("ru-RU")} / ${stats.femaleCount.toLocaleString("ru-RU")}`} delta="Соотношение 60/40" />
            <StatCard label="Avg Reply Rate" value={stats.avgReplyRate.toFixed(1)} suffix="%" delta="First reply" />
            <StatCard label="Second Reply Rate" value={stats.secondReplyRate.toFixed(1)} suffix="%" />
            <StatCard label="Среднее поклонников" value={stats.avgAdmirers.toFixed(1)} suffix=" чел" />
            <StatCard label="Сообщений за час" animTarget={stats.messagesLastHour} delta="📈 +12% к вчера" accent />
            <StatCard label="Подарков сегодня" animTarget={stats.giftsToday} delta="🎁 через Ozon" />
            <StatCard label="Новых сегодня" animTarget={stats.newToday} delta="🆕 регистраций" />
          </div>
          <div className="ratio-bar-wrap">
            <div className="ratio-bar-labels">
              <span className="ratio-label-male">👨 Мужчины {Math.round((stats.maleCount / stats.totalUsers) * 100)}%</span>
              <span className="ratio-label-female">👩 Женщины {Math.round((stats.femaleCount / stats.totalUsers) * 100)}%</span>
            </div>
            <div className="ratio-bar"><div className="ratio-bar-male" style={{ width: `${(stats.maleCount / stats.totalUsers) * 100}%` }} /><div className="ratio-bar-female" /></div>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="section-inner">
          <div className="rankings-grid">
            <div>
              <div className="section-header"><h2 className="section-title">Рейтинг мужчин</h2><Link href="/ratings/men" className="section-link">Все →</Link></div>
              <div className="rank-legend"><span>Привлекательность</span><span>Обеспеченность</span><span>Очки</span></div>
              {MOCK_TOP_MALES.map((m, i) => <MaleRankRow key={m.rank} m={m} delay={i * 80} />)}
            </div>
            <div>
              <div className="section-header"><h2 className="section-title">Рейтинг девушек</h2><Link href="/ratings/women" className="section-link">Все →</Link></div>
              <div className="rank-legend"><span>Сообщений/сут</span><span>Поклонники</span><span>Статус</span></div>
              {MOCK_TOP_FEMALES.map((f, i) => <FemaleRankRow key={f.rank} f={f} delay={i * 80} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2.5rem" }}>Как это работает</h2>
          <div className="how-grid">
            {[
              { icon: "📊", title: "Открытая статистика", desc: "Реальные данные по спросу. Видно, сколько парней написало девушке сегодня." },
              { icon: "🏆", title: "Рейтинги в реальном времени", desc: "Мужчины соревнуются по привлекательности и обеспеченности. Девушки — по популярности." },
              { icon: "🎁", title: "Подарки через Ozon", desc: "Девушки получают приветственный подарок 300–500 ₽. Вишлист — до 3 позиций." },
              { icon: "⚡", title: "Виральные метрики", desc: "Дашборды созданы для скриншотов и TikTok. Делись своим рейтингом." },
            ].map((item, i) => (
              <div key={i} className="how-card"><div className="how-icon">{item.icon}</div><h3 className="how-title">{item.title}</h3><p className="how-desc">{item.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cta">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <h2 className="cta-title">Готов войти в рейтинг?</h2>
          <p className="cta-sub">Регистрация за 2 минуты. Девушкам — подарок сразу.</p>
          <div className="hero-cta"><Link href="/register?gender=female" className="btn-primary btn-lg">Я девушка 🎁</Link><Link href="/register?gender=male" className="btn-outline btn-lg">Я парень</Link></div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="logo"><span className="logo-mark">DM</span><span className="logo-text">DateMarket</span><span className="logo-tag">RU</span></div>
          <div className="footer-links"><Link href="/privacy">Конфиденциальность</Link><Link href="/terms">Условия</Link><Link href="/support">Поддержка</Link></div>
          <p className="footer-copy">© 2025 DateMarket.ru</p>
        </div>
      </footer>
    </div>
  );
}