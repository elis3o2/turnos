import { useEffect, useState, useRef, useCallback } from "react";

const services = [
  {
    icon: "⬡",
    label: "01",
    title: "Infraestructura IT",
    desc: "Diseño y gestión de redes LAN/WAN, servidores físicos y virtualizados con alta disponibilidad.",
    price: "Desde $80.000/mes",
  },
  {
    icon: "⬡",
    label: "02",
    title: "Seguridad Informática",
    desc: "Pentesting, auditorías, hardening y respuesta ante incidentes para proteger tus activos críticos.",
    price: "Consultar",
  },
  {
    icon: "⬡",
    label: "03",
    title: "Cloud & Hosting",
    desc: "Migración y administración en AWS, Azure o GCP. Optimización de costos y escalabilidad real.",
    price: "Desde $60.000/mes",
  },
  {
    icon: "⬡",
    label: "04",
    title: "Soporte Técnico",
    desc: "Mesa de ayuda, mantenimiento preventivo y asistencia remota para equipos de trabajo.",
    price: "Desde $40.000/mes",
  },
  {
    icon: "⬡",
    label: "05",
    title: "Backup & Recuperación",
    desc: "Estrategias 3-2-1, disaster recovery probado y continuidad del negocio ante fallos críticos.",
    price: "Proyectos",
  },
  {
    icon: "⬡",
    label: "06",
    title: "Monitoreo & Alertas",
    desc: "Dashboards en tiempo real, alertas automáticas y reportes de disponibilidad con Grafana y Zabbix.",
    price: "Incluido en planes",
  },
];

const cases = [
  {
    industry: "Retail · 2024",
    title: "Migración cloud para cadena de 8 sucursales",
    desc: "Migración de sistemas de facturación y stock a una arquitectura centralizada en AWS, sin downtime operativo.",
    result: "40% menos costos operativos",
    color: "#b8ff57",
  },
  {
    industry: "Salud · 2024",
    title: "Red segura para clínica médica",
    desc: "Red segmentada, VPN y política de accesos para clínica con 30 profesionales. Cumplimiento normativo.",
    result: "Aprobó auditoría PDPA",
    color: "#57c8ff",
  },
  {
    industry: "Estudio contable · 2023",
    title: "Backup automatizado y recuperación",
    desc: "Plan de backup 3-2-1 con recuperación ante desastres probada para estudio de 15 personas.",
    result: "RTO menor a 2 horas",
    color: "#ff8c57",
  },
];

const techs = [
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Proxmox VE",
  "VMware ESXi",
  "pfSense",
  "Cisco IOS",
  "Ubuntu Server",
  "Windows Server",
  "Zabbix",
  "Grafana",
  "Veeam",
  "Active Directory",
  "Ansible",
  "Terraform",
];

const testimonials = [
  {
    text: "Eliseo resolvió en una semana lo que otros consultores no pudieron en meses. La red de nuestro depósito funciona sin interrupciones desde que trabajamos con él.",
    name: "Marcelo Gutiérrez",
    role: "Gerente operativo · Distribuidora Gutiérrez e Hijos",
    initials: "MG",
  },
  {
    text: "La migración al cloud fue completamente transparente para nuestro equipo. Cero pérdida de datos, cero tiempo de inactividad. Muy recomendable.",
    name: "Laura Pedraza",
    role: "Directora · Centro Médico del Parque",
    initials: "LP",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = ref.current;
    if (!el) return;

    let mounted = true;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!mounted) return;
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);

    return () => {
      mounted = false;
      obs.disconnect();
    };
  }, [threshold]);

  return [ref, inView] as const;
}

function FadeIn({
  children,
  delay = 0,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`fade-in ${className}`.trim()}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function EliseoFeuli() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHeroVisible(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = "dm-sans-font";
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }, []);

  return (
    <div className="page">
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Nav */}
      <nav className="nav">
        <button
          type="button"
          className="brand"
          onClick={() => scrollTo("top")}
          aria-label="Ir al inicio"
        >
          EF<span className="accent-dot">.</span>
        </button>

        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          {["servicios", "casos", "proceso", "contacto"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => scrollTo(s)}
              className="nav-link"
            >
              {s}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section id="top" className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-accent" aria-hidden="true" />

        <div className="hero-content">
          <div
            className="pill"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(16px)",
              transition: "all 0.5s ease",
            }}
          >
            <span className="pill-dot" />
            <span className="pill-text">Disponible para proyectos</span>
          </div>

          <h1
            className="hero-title"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(24px)",
              transition: "all 0.7s ease 0.1s",
            }}
          >
            Eliseo
            <br />
            <span className="hero-title-outline">Feuli</span>
          </h1>

          <p
            className="hero-subtitle"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(16px)",
              transition: "all 0.7s ease 0.2s",
            }}
          >
            Consultor en infraestructura IT, seguridad y cloud. Soluciones tecnológicas a medida para empresas que quieren crecer con confianza.
          </p>

          <div
            className="hero-actions"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "all 0.7s ease 0.3s",
            }}
          >
            <button type="button" onClick={() => scrollTo("contacto")} className="btn btn-primary">
              Agendar diagnóstico gratis →
            </button>
            <button type="button" onClick={() => scrollTo("servicios")} className="btn btn-secondary">
              Ver servicios
            </button>
          </div>
        </div>

        <div className="stats-bar">
          {[
            ["12+", "Años de experiencia"],
            ["80+", "Clientes atendidos"],
            ["99%", "Satisfacción"],
            ["24h", "Tiempo de respuesta"],
          ].map(([n, l], i) => (
            <div
              key={i}
              className="stat"
              style={{
                opacity: heroVisible ? 1 : 0,
                transition: `all 0.7s ease ${0.4 + i * 0.08}s`,
              }}
            >
              <div className="stat-number">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="section">
        <FadeIn>
          <div className="section-head">
            <h2 className="section-title">Servicios</h2>
            <span className="section-kicker">06 áreas</span>
          </div>
        </FadeIn>

        <div className="services-grid">
          {services.map((s, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="card service-card">
                <div className="card-top">
                  <span className="card-label">{s.label}</span>
                  <span className="card-price">{s.price}</span>
                </div>
                <div className="service-icon" aria-hidden="true">
                  {s.icon}
                </div>
                <h3 className="card-title">{s.title}</h3>
                <p className="card-text">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Cases */}
      <section id="casos" className="section section-divider">
        <FadeIn>
          <h2 className="section-title">Proyectos recientes</h2>
        </FadeIn>

        <div className="cases-grid">
          {cases.map((c, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="card case-card">
                <p className="card-industry">{c.industry}</p>
                <h3 className="card-title">{c.title}</h3>
                <p className="card-text">{c.desc}</p>
                <div className="case-result">
                  <span className="case-dot" style={{ background: c.color }} />
                  <span style={{ color: c.color }}>{c.result}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="proceso" className="section section-divider">
        <FadeIn>
          <h2 className="section-title">Cómo trabajo</h2>
        </FadeIn>

        <div className="process-grid">
          {[
            [
              "Diagnóstico",
              "Auditoría gratuita de 45 min para detectar puntos críticos y entender el estado real de tu infraestructura.",
            ],
            [
              "Propuesta",
              "Plan técnico y económico detallado, sin letras chicas, ajustado a tus necesidades y presupuesto.",
            ],
            [
              "Implementación",
              "Cada cambio con mínima interrupción operativa, con documentación clara de todo lo realizado.",
            ],
            [
              "Soporte continuo",
              "Monitoreo proactivo y canal de consultas directo sin intermediarios, después de cada proyecto.",
            ],
          ].map(([t, d], i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="process-card">
                <span className="process-step">0{i + 1}</span>
                <h3 className="card-title">{t}</h3>
                <p className="card-text">{d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Techs */}
      <section className="section section-divider tech-section">
        <FadeIn>
          <p className="kicker">Stack tecnológico</p>
          <div className="tech-list">
            {techs.map((t) => (
              <span key={t} className="tech-pill">
                {t}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Testimonials */}
      <section className="section section-divider">
        <FadeIn>
          <h2 className="section-title">Clientes</h2>
        </FadeIn>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="card testimonial-card">
                <div className="stars" aria-hidden="true">
                  {[...Array(5)].map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-footer">
                  <div className="avatar">{t.initials}</div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="section section-divider">
        <FadeIn>
          <div className="contact-grid">
            <div>
              <h2 className="section-title">¿Hablamos?</h2>
              <p className="contact-copy">
                Diagnóstico inicial sin costo. Sin compromiso. Si no hay fit, te lo digo directamente.
              </p>
              <a
                href="mailto:eliseo@feuli.com.ar"
                className="btn btn-primary btn-large"
              >
                Agendar diagnóstico gratuito →
              </a>
            </div>

            <div className="contact-box">
              {[
                ["Email", "eliseo@feuli.com.ar"],
                ["Teléfono", "+54 341 555-0192"],
                ["Ubicación", "Rosario, Argentina"],
                ["Modalidad", "Presencial + Remoto"],
              ].map(([l, v]) => (
                <div key={l} className="contact-row">
                  <span className="contact-label">{l}</span>
                  <span className="contact-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span className="brand footer-brand">
          EF<span className="accent-dot">.</span>
        </span>
        <span className="footer-copy">
          © {new Date().getFullYear()} Eliseo Feuli · Consultoría Informática · Rosario, Argentina
        </span>
      </footer>

      <style>{`
        :root {
          color-scheme: dark;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #0a0a0a;
          color: #f0ede6;
        }

        .page {
          background: #0a0a0a;
          color: #f0ede6;
          font-family: "DM Sans", "Helvetica Neue", sans-serif;
          min-height: 100dvh;
          overflow-x: hidden;
          position: relative;
        }

        .grain-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 180px;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          background: rgba(10, 10, 10, 0.8);
        }

        .brand {
          appearance: none;
          border: 0;
          background: transparent;
          color: inherit;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
        }

        .accent-dot {
          color: #b8ff57;
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .nav-link {
          appearance: none;
          background: transparent;
          border: 0;
          color: inherit;
          cursor: pointer;
          font: inherit;
          padding: 0.25rem 0;
          transition: color 0.2s ease;
        }

        .nav-link:hover,
        .nav-link:focus-visible {
          color: #f0ede6;
          outline: none;
        }

        .menu-button {
          display: none;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex-direction: column;
        }

        .menu-button span {
          width: 18px;
          height: 1.5px;
          background: rgba(240, 237, 230, 0.85);
          display: block;
        }

        .hero {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8rem 2rem 0;
          position: relative;
          overflow: hidden;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .hero-accent {
          position: absolute;
          top: 15%;
          right: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184, 255, 87, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content {
          max-width: 900px;
          position: relative;
          z-index: 2;
          padding-bottom: 8rem;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(184, 255, 87, 0.1);
          border: 1px solid rgba(184, 255, 87, 0.25);
          border-radius: 999px;
          padding: 5px 14px;
          margin-bottom: 2rem;
        }

        .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b8ff57;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        .pill-text {
          font-size: 0.75rem;
          color: #b8ff57;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: clamp(3.5rem, 9vw, 7.5rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin: 0 0 1.5rem;
        }

        .hero-title-outline {
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.25);
          color: transparent;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.5);
          max-width: 520px;
          line-height: 1.7;
          margin: 0 0 3rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn {
          appearance: none;
          border: none;
          cursor: pointer;
          padding: 14px 32px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .btn:hover,
        .btn:focus-visible {
          transform: translateY(-1px);
          outline: none;
        }

        .btn-primary {
          background: #b8ff57;
          color: #0a0a0a;
        }

        .btn-primary:hover,
        .btn-primary:focus-visible {
          background: #d4ff8a;
        }

        .btn-secondary {
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .btn-secondary:hover,
        .btn-secondary:focus-visible {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .btn-large {
          padding: 16px 36px;
          font-size: 0.95rem;
          font-weight: 800;
          margin-top: 0.25rem;
        }

        .stats-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(6px);
        }

        .stat {
          padding: 1.5rem;
          text-align: center;
        }

        .stat:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 2px;
          letter-spacing: 0.04em;
        }

        .section {
          padding: 6rem 2rem;
          position: relative;
          z-index: 2;
        }

        .section-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 3rem;
          gap: 1rem;
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .section-kicker,
        .kicker {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .services-grid,
        .cases-grid,
        .testimonials-grid {
          display: grid;
          gap: 1.5rem;
        }

        .services-grid {
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .cases-grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .testimonials-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .card {
          background: #0d0d0d;
        }

        .service-card {
          min-height: 100%;
          padding: 2rem;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .service-card:hover {
          background: #111;
          transform: translateY(-2px);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .card-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.1em;
        }

        .card-price {
          font-size: 0.7rem;
          color: #b8ff57;
          background: rgba(184, 255, 87, 0.1);
          padding: 3px 10px;
          border-radius: 999px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .service-icon {
          margin: 0 0 1rem;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.45);
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 0.75rem;
          line-height: 1.35;
        }

        .card-text {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.7;
          margin: 0;
        }

        .case-card,
        .testimonial-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 2rem;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .case-card:hover,
        .testimonial-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-2px);
        }

        .card-industry {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.3);
          margin: 0 0 0.75rem;
        }

        .case-result {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 1.5rem;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .case-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .process-card {
          padding: 2rem 1.75rem;
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          min-height: 100%;
        }

        .process-step {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 1rem;
        }

        .tech-section {
          padding-top: 4rem;
          padding-bottom: 4rem;
        }

        .tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 1.5rem;
        }

        .tech-pill {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 6px 14px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.02em;
          transition: all 0.2s ease;
        }

        .tech-pill:hover {
          color: #f0ede6;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .stars {
          display: flex;
          gap: 2px;
          margin-bottom: 1.25rem;
        }

        .stars span {
          color: #b8ff57;
          font-size: 14px;
        }

        .testimonial-text {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.75;
          margin: 0 0 1.5rem;
          font-style: italic;
        }

        .testimonial-footer {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(184, 255, 87, 0.12);
          border: 1px solid rgba(184, 255, 87, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #b8ff57;
          flex-shrink: 0;
        }

        .testimonial-name {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
        }

        .testimonial-role {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.35);
          margin: 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 4rem;
          align-items: center;
        }

        .contact-copy {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.7;
          margin: 0 0 2.5rem;
        }

        .contact-box {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .contact-row {
          background: #0a0a0a;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .contact-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .contact-value {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          text-align: right;
        }

        .footer {
          padding: 2rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          position: relative;
          z-index: 2;
        }

        .footer-brand {
          font-size: 1rem;
        }

        .footer-copy {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.25);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 900px) {
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat:nth-child(1),
          .stat:nth-child(3) {
            border-right: 1px solid rgba(255, 255, 255, 0.06);
          }

          .stat:nth-child(1),
          .stat:nth-child(2) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .contact-grid {
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .nav {
            padding: 0.9rem 1rem;
          }

          .menu-button {
            display: inline-flex;
          }

          .nav-links {
            position: absolute;
            top: calc(100% + 1px);
            left: 0;
            right: 0;
            display: none;
            flex-direction: column;
            gap: 0;
            background: rgba(10, 10, 10, 0.98);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0.75rem 1rem 1rem;
          }

          .nav-links.open {
            display: flex;
          }

          .nav-link {
            text-align: left;
            padding: 0.95rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .hero {
            padding: 7rem 1rem 0;
          }

          .hero-content {
            padding-bottom: 12rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section {
            padding: 4.5rem 1rem;
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 2rem;
          }

          .service-card,
          .case-card,
          .testimonial-card,
          .process-card {
            padding: 1.5rem;
          }

          .contact-row {
            padding: 1rem 1rem;
            flex-direction: column;
            align-items: flex-start;
          }

          .contact-value {
            text-align: left;
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: clamp(3rem, 16vw, 5rem);
          }

          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .btn {
            width: 100%;
          }

          .stats-bar {
            grid-template-columns: 1fr 1fr;
          }

          .stat {
            padding: 1rem;
          }

          .stat-number {
            font-size: 1.35rem;
          }

          .contact-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}