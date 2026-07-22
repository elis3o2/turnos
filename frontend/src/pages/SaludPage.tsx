import { useState } from "react";

/**
 * Secretaría de Salud — Turnos de Salud Pública
 * Sitio institucional de referencia (single-file React component).
 *
 * NOTA IMPORTANTE ANTES DE PUBLICAR:
 * 1. Reemplazar el placeholder de logo (ver componente <Logo />) por el
 *    archivo oficial (SVG o PNG) de la Secretaría de Salud.
 * 2. Verificar que https://salud1.dyndns.org/turnos/politica-privacidad.html
 *    esté online y accesible antes de reenviar la verificación a Meta.
 * 3. Los datos de contacto de abajo deben coincidir EXACTAMENTE con los
 *    cargados en el Business Manager / Portfolio comercial de Meta.
 */

const CONTACT = {
  nombreLegal: "Secretaría de Salud",
  direccion: "San Luis 2020, Rosario, Santa Fe (2000)",
  telefono: "+54 9 341 671-7398",
  telefonoHref: "5493416717398",
  politicaPrivacidadUrl:
    "https://salud1.dyndns.org/turnos/politica-privacidad.html",
};

const SERVICIOS = [
  {
    titulo: "Turnos de atención primaria",
    descripcion:
      "Solicitá turno para consultas de medicina general y control de salud en tu centro de salud de referencia.",
  },
  {
    titulo: "Turnos con especialistas",
    descripcion:
      "Acceso a turnos programados con especialistas médicos derivados desde tu centro de atención primaria.",
  },
  {
    titulo: "Vacunación",
    descripcion:
      "Consultá el calendario vigente y reservá turno para vacunación en los vacunatorios municipales.",
  },
  {
    titulo: "Turnos por WhatsApp",
    descripcion:
      "Gestioná, confirmá o cancelá tus turnos desde WhatsApp, sin necesidad de trasladarte hasta el centro de salud.",
  },
];

function Logo({ size = 40 }) {
  // Placeholder de logo institucional — reemplazar por el archivo oficial.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="23" fill="#0F5C6B" stroke="#0B4450" strokeWidth="2" />
      <path
        d="M24 12v24M12 24h24"
        stroke="#F4F7F5"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SecretariaSaludHome({ onIrAPrivacidad }: any) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navLinks = [
    { href: "#servicios", label: "Servicios" },
    { href: "#como-funciona", label: "Cómo pedir un turno" },
    { href: "#contacto", label: "Contacto" },
    { href: "#privacidad", label: "Política de privacidad", onClick: onIrAPrivacidad },
  ];

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            <Logo />
            <div>
              <p style={styles.brandEyebrow}>Municipalidad de Rosario</p>
              <h1 style={styles.brandName}>{CONTACT.nombreLegal}</h1>
            </div>
          </div>

          <nav style={styles.navDesktop} aria-label="Navegación principal">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                style={styles.navLink}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            style={styles.menuButton}
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-label="Abrir menú de navegación"
          >
            {menuAbierto ? "✕" : "☰"}
          </button>
        </div>

        {menuAbierto && (
          <nav style={styles.navMobile} aria-label="Navegación móvil">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={styles.navMobileLink}
                onClick={(e) => {
                  setMenuAbierto(false);
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <h2 style={styles.heroTitle}>
            Secretaría Salud · Rosario, Santa Fe
          </h2>
          <p style={styles.heroSubtitle}>
            La {CONTACT.nombreLegal} gestiona la asignación de turnos para
            atención primaria, especialidades y vacunación en los centros de
            salud municipales.
          </p>
          <div style={styles.heroActions}>
            <a href="#servicios" style={styles.secondaryButton}>
              Ver servicios
            </a>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" style={styles.section}>
        <h3 style={styles.sectionTitle}>Servicios</h3>
        <p style={styles.sectionLead}>
          Estas son las prestaciones que podés gestionar a través de nuestro
          sistema de turnos.
        </p>
        <div style={styles.grid}>
          {SERVICIOS.map((s) => (
            <div key={s.titulo} style={styles.card}>
              <h4 style={styles.cardTitle}>{s.titulo}</h4>
              <p style={styles.cardText}>{s.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" style={styles.sectionAlt}>
        <h3 style={styles.sectionTitle}>Cómo pedir un turno</h3>
        <ol style={styles.steps}>
          <li style={styles.step}>
            <span style={styles.stepNum}>1</span>
            <div>
              <strong>Escribinos por WhatsApp</strong>
              <p style={styles.stepText}>
                Enviá un mensaje al {CONTACT.telefono} indicando el centro de
                salud y el motivo de consulta.
              </p>
            </div>
          </li>
          <li style={styles.step}>
            <span style={styles.stepNum}>2</span>
            <div>
              <strong>Elegí día y horario</strong>
              <p style={styles.stepText}>
                Te ofrecemos las disponibilidades vigentes según el servicio
                solicitado.
              </p>
            </div>
          </li>
          <li style={styles.step}>
            <span style={styles.stepNum}>3</span>
            <div>
              <strong>Confirmación</strong>
              <p style={styles.stepText}>
                Recibís la confirmación del turno con fecha, horario y
                dirección del centro de salud correspondiente.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={styles.section}>
        <h3 style={styles.sectionTitle}>Contacto</h3>
        <div style={styles.contactGrid}>
          <div style={styles.contactCard}>
            <p style={styles.contactLabel}>Organismo</p>
            <p style={styles.contactValue}>{CONTACT.nombreLegal}</p>
          </div>
          <div style={styles.contactCard}>
            <p style={styles.contactLabel}>Dirección</p>
            <p style={styles.contactValue}>{CONTACT.direccion}</p>
          </div>
          <div style={styles.contactCard}>
            <p style={styles.contactLabel}>Teléfono / WhatsApp</p>
            <p style={styles.contactValue}>{CONTACT.telefono}</p>
          </div>
          <div style={styles.contactCard}>
            <p style={styles.contactLabel}>Política de privacidad</p>
            <a
              href="#privacidad"
              onClick={(e) => {
                e.preventDefault();
                onIrAPrivacidad();
              }}
              style={styles.contactLink}
            >
              Ver documento
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <Logo size={32} />
            <div>
              <p style={styles.footerName}>{CONTACT.nombreLegal}</p>
              <p style={styles.footerAddress}>{CONTACT.direccion}</p>
              <p style={styles.footerAddress}>{CONTACT.telefono}</p>
            </div>
          </div>
          <div style={styles.footerLinks}>
            <a
              href="#privacidad"
              onClick={(e) => {
                e.preventDefault();
                onIrAPrivacidad();
              }}
              style={styles.footerLink}
            >
              Política de privacidad
            </a>
            <a href="#contacto" style={styles.footerLink}>
              Contacto
            </a>
          </div>
        </div>
        <p style={styles.footerCopy}>
          © {new Date().getFullYear()} {CONTACT.nombreLegal}. Todos los
          derechos reservados.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    color: "#132B2F",
    backgroundColor: "#F7F9F8",
    minHeight: "100vh",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E1E8E6",
  },
  headerInner: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandEyebrow: {
    margin: 0,
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#5B7671",
  },
  brandName: {
    margin: "2px 0 0",
    fontSize: 18,
    fontWeight: 700,
    color: "#0F5C6B",
  },
  navDesktop: {
    display: "flex",
    gap: 28,
  },
  navLink: {
    color: "#254B49",
    textDecoration: "none",
    fontSize: 14.5,
    fontWeight: 500,
  },
  menuButton: {
    display: "none",
    background: "none",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    color: "#0F5C6B",
  },
  navMobile: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 24px 16px",
    gap: 12,
    borderTop: "1px solid #E1E8E6",
  },
  navMobileLink: {
    color: "#254B49",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 500,
  },
  hero: {
    background: "linear-gradient(135deg, #0F5C6B 0%, #0B4450 100%)",
    color: "#F4F7F5",
    padding: "72px 24px",
  },
  heroInner: { maxWidth: 780, margin: "0 auto", textAlign: "center" },
  heroEyebrow: {
    fontSize: 13,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#9CC7BE",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: "clamp(28px, 4vw, 42px)",
    lineHeight: 1.15,
    fontWeight: 800,
    margin: "0 0 16px",
  },
  heroSubtitle: {
    fontSize: 16.5,
    lineHeight: 1.6,
    color: "#DCEAE6",
    margin: "0 auto 32px",
    maxWidth: 620,
  },
  heroActions: {
    display: "flex",
    gap: 14,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#F4F7F5",
    color: "#0B4450",
    padding: "13px 26px",
    borderRadius: 8,
    fontWeight: 700,
    textDecoration: "none",
    fontSize: 15,
  },
  secondaryButton: {
    border: "1.5px solid #9CC7BE",
    color: "#F4F7F5",
    padding: "13px 26px",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 15,
  },
  section: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "64px 24px",
  },
  sectionAlt: {
    backgroundColor: "#EEF3F1",
    padding: "64px 24px",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0B4450",
    margin: "0 0 8px",
  },
  sectionLead: {
    color: "#4C6864",
    fontSize: 15.5,
    margin: "0 0 32px",
    maxWidth: 620,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E1E8E6",
    borderRadius: 12,
    padding: "22px 20px",
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: 700,
    color: "#0F5C6B",
    margin: "0 0 8px",
  },
  cardText: {
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "#3E5450",
    margin: 0,
  },
  steps: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    maxWidth: 760,
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  step: { display: "flex", gap: 16, alignItems: "flex-start" },
  stepNum: {
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#0F5C6B",
    color: "#F4F7F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
  },
  stepText: {
    margin: "4px 0 0",
    color: "#3E5450",
    fontSize: 14.5,
    lineHeight: 1.55,
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E1E8E6",
    borderRadius: 12,
    padding: "18px 20px",
  },
  contactLabel: {
    margin: "0 0 6px",
    fontSize: 12,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#7C948F",
  },
  contactValue: { margin: 0, fontSize: 15.5, fontWeight: 600, color: "#132B2F" },
  contactLink: { color: "#0F5C6B", fontWeight: 600, fontSize: 15 },
  footer: {
    backgroundColor: "#0B4450",
    color: "#DCEAE6",
    padding: "36px 24px 24px",
  },
  footerInner: {
    maxWidth: 1120,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 24,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  footerBrand: { display: "flex", gap: 12, alignItems: "flex-start" },
  footerName: { margin: "0 0 4px", fontWeight: 700, color: "#F4F7F5", fontSize: 15.5 },
  footerAddress: { margin: 0, fontSize: 13.5, color: "#B9D3CC" },
  footerLinks: { display: "flex", gap: 20, flexWrap: "wrap" },
  footerLink: { color: "#DCEAE6", textDecoration: "none", fontSize: 14 },
  footerCopy: {
    maxWidth: 1120,
    margin: "16px auto 0",
    fontSize: 12.5,
    color: "#93B3AC",
  },
} as const;

/* ══════════════════════════════════════════════════════════════
   POLÍTICA DE PRIVACIDAD
   Misma identidad visual que el documento HTML original:
   navy #0a1628, teal #0d7f74, DM Serif Display + Outfit.
   ══════════════════════════════════════════════════════════════ */

const ARCO = [
  {
    letra: "A",
    nombre: "Acceso",
    texto: "Acceder a sus datos personales en poder de la Secretaría.",
  },
  {
    letra: "R",
    nombre: "Rectificación",
    texto: "Rectificar información inexacta o desactualizada.",
  },
  {
    letra: "C",
    nombre: "Cancelación",
    texto:
      "Suprimir o cancelar sus datos cuando no sean necesarios para las finalidades descritas, solicitando la baja del servicio.",
  },
  {
    letra: "O",
    nombre: "Oposición",
    texto:
      "Oponerse al uso de sus datos para notificaciones administrativas no esenciales.",
  },
];

const SECCIONES_PRIVACIDAD = [
  { id: "intro", label: "Introducción" },
  { id: "s1", label: "1. Información recopilada" },
  { id: "s2", label: "2. Finalidad del tratamiento" },
  { id: "s3", label: "3. Confidencialidad y terceros" },
  { id: "s4", label: "4. Seguridad" },
  { id: "s5", label: "5. Derechos ARCO" },
  { id: "s6", label: "6. Retención de datos" },
  { id: "s7", label: "7. Contacto" },
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="white" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
    </svg>
  );
}

function PoliticaPrivacidad({ onVolver }: any) {
  const [activo, setActivo] = useState("intro");

  return (
    <div style={pStyles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>

      {/* TOP BAR */}
      <div style={pStyles.topbar}>
        🏛 Municipalidad de Rosario &nbsp;·&nbsp;{" "}
        <span style={pStyles.topbarAccent}>{CONTACT.nombreLegal}</span>
        &nbsp;·&nbsp; Canal Oficial WhatsApp
      </div>

      {/* HERO */}
      <header style={pStyles.hero}>
        <div style={pStyles.heroGrid} />
        <div style={pStyles.heroGlow} />
        <div style={pStyles.shieldIcon}>
          <ShieldIcon />
        </div>
        <p style={pStyles.heroLabel}>Documento oficial</p>
        <h1 style={pStyles.heroTitle}>
          <em style={pStyles.heroTitleEm}>{CONTACT.nombreLegal}</em>{" "}
          — Política de Privacidad y Seguridad
        </h1>

        <button onClick={onVolver} style={pStyles.backButton}>
          ← Volver al sitio
        </button>
      </header>

      <div style={pStyles.pageWrap}>
        {/* SIDEBAR */}
        <aside style={pStyles.sidebar}>
          <p style={pStyles.sidebarTitle}>Contenido</p>
          <nav>
            {SECCIONES_PRIVACIDAD.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActivo(s.id)}
                style={{
                  ...pStyles.sidebarLink,
                  ...(activo === s.id ? pStyles.sidebarLinkActive : {}),
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div style={pStyles.sidebarBadge}>
            <strong style={pStyles.sidebarBadgeStrong}>
              🔒 Sus datos están protegidos
            </strong>
            No comercializamos ni compartimos su información con terceros
            privados.
          </div>
        </aside>

        {/* CONTENIDO */}
        <main style={pStyles.content}>
          <section id="intro">
            <div style={pStyles.introCard}>
              La presente Política de Privacidad describe cómo la{" "}
              <strong style={pStyles.introStrong}>
                {CONTACT.nombreLegal}
              </strong>{" "}
              recopila, utiliza, procesa y protege la información personal de
              los ciudadanos al interactuar con nuestros servicios oficiales
              de chatbot y mensajería a través de la plataforma{" "}
              <strong style={pStyles.introStrong}>WhatsApp</strong>.
            </div>
          </section>

          <section id="s1" style={pStyles.section}>
            <SectionHeader num="01" title="Información que Recopilamos" />
            <div style={pStyles.card}>
              <h3 style={pStyles.cardH3}>
                Información proporcionada por el Usuario
              </h3>
              <ul style={pStyles.ul}>
                <li style={pStyles.li}>
                  <strong>Identificación y Contacto:</strong> nombre completo,
                  número de documento (si se requiere para validación),
                  dirección y número de teléfono vinculados a su historial en
                  los centros de salud municipales.
                </li>
                <li style={pStyles.li}>
                  <strong>Gestión de Turnos:</strong> fecha, hora y
                  especialidad de los turnos reservados. A través de este
                  canal no se solicita información detallada sobre
                  diagnósticos médicos sensibles, salvo lo estrictamente
                  necesario para la derivación administrativa.
                </li>
                <li style={pStyles.li}>
                  <strong>Datos de Comunicación:</strong> contenido de los
                  mensajes, consultas y archivos enviados por el Usuario para
                  recibir asistencia.
                </li>
              </ul>

              <h3 style={pStyles.cardH3}>
                Información de la plataforma (API de WhatsApp Business)
              </h3>
              <p style={pStyles.p}>
                Recibimos automáticamente su número de teléfono y el nombre
                de perfil configurado en WhatsApp para identificar la sesión
                de chat.
              </p>
            </div>
          </section>

          <section id="s2" style={pStyles.section}>
            <SectionHeader num="02" title="Finalidad del Tratamiento de Datos" />
            <div style={pStyles.card}>
              <p style={pStyles.p}>
                La Secretaría utiliza su información exclusivamente para los
                siguientes fines de interés público:
              </p>
              <ul style={pStyles.ul}>
                <li style={pStyles.li}>
                  <strong>Prestación del Servicio:</strong> operar el chatbot
                  para la autogestión de turnos, consultas de ubicación de
                  centros de salud y programas sanitarios.
                </li>
                <li style={pStyles.li}>
                  <strong>Comunicación Oficial:</strong> enviar recordatorios
                  de turnos, alertas sanitarias, campañas de vacunación y
                  respuestas a consultas ciudadanas, siempre bajo consentimiento
                  previo.
                </li>
                <li style={pStyles.li}>
                  <strong>Mejora del Servicio:</strong> análisis estadísticos
                  anónimos sobre el uso del chatbot para optimizar la
                  respuesta y la experiencia del ciudadano.
                </li>
                <li style={pStyles.li}>
                  <strong>Cumplimiento Legal:</strong> atender requerimientos
                  de autoridades judiciales o administrativas competentes.
                </li>
              </ul>
            </div>
          </section>

          <section id="s3" style={pStyles.section}>
            <SectionHeader num="03" title="Confidencialidad y Terceros" />
            <div style={pStyles.card}>
              <ul style={pStyles.ul}>
                <li style={pStyles.li}>
                  <strong>No Comercialización:</strong> la Secretaría no
                  vende, no alquila ni comparte sus datos personales ni el
                  contenido de sus conversaciones con empresas privadas o
                  terceros con fines de marketing o publicidad.
                </li>
                <li style={pStyles.li}>
                  <strong>Uso Exclusivo:</strong> la información se utiliza
                  únicamente para el funcionamiento del servicio de salud
                  pública y la mejora de la atención al ciudadano.
                </li>
                <li style={pStyles.li}>
                  <strong>Proveedores Tecnológicos:</strong> los datos pueden
                  procesarse a través de la infraestructura de Meta
                  (WhatsApp) bajo sus propios términos de servicio de la API
                  de Business, garantizando el cifrado de extremo a extremo.
                </li>
              </ul>
            </div>
          </section>

          <section id="s4" style={pStyles.section}>
            <SectionHeader num="04" title="Seguridad de la Información" />
            <div style={pStyles.card}>
              <p style={pStyles.p}>
                Implementamos medidas técnicas y organizativas rigurosas para
                proteger sus datos contra acceso no autorizado, alteración o
                pérdida. Esto incluye protocolos de seguridad en nuestros
                servidores y acceso restringido al personal administrativo
                autorizado de la Secretaría.
              </p>
              <div style={pStyles.noteBlock}>
                <span aria-hidden="true">⚠</span>
                <span>
                  Si bien WhatsApp ofrece cifrado de extremo a extremo, el
                  Usuario debe ser consciente de que la seguridad de su
                  propio dispositivo es su responsabilidad.
                </span>
              </div>
            </div>
          </section>

          <section id="s5" style={pStyles.section}>
            <SectionHeader num="05" title="Derechos del Usuario (ARCO)" />
            <div style={pStyles.card}>
              <p style={pStyles.p}>
                El Usuario tiene derecho en todo momento a ejercer las
                siguientes acciones:
              </p>
              <div style={pStyles.arcoGrid}>
                {ARCO.map((item) => (
                  <div key={item.letra} style={pStyles.arcoItem}>
                    <div style={pStyles.arcoLetter}>{item.letra}</div>
                    <div style={pStyles.arcoName}>{item.nombre}</div>
                    <p style={pStyles.arcoText}>{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="s6" style={pStyles.section}>
            <SectionHeader num="06" title="Retención de Datos" />
            <div style={pStyles.card}>
              <p style={pStyles.p}>
                Los datos se conservarán únicamente durante el tiempo
                necesario para cumplir con la prestación del servicio
                solicitado o para cumplir con las normativas legales de
                archivo de documentos públicos de salud.
              </p>
            </div>
          </section>

          <section id="s7" style={pStyles.section}>
            <SectionHeader num="07" title="Contacto" />
            <div style={pStyles.contactCard}>
              <h3 style={pStyles.contactCardH3}>
                ¿Consultas sobre esta política?
              </h3>
              <p style={pStyles.contactCardP}>
                Para consultas sobre esta política o para ejercer sus
                derechos sobre sus datos, el ciudadano puede dirigirse a la{" "}
                <strong>
                  sede central de la {CONTACT.nombreLegal} en{" "}
                  {CONTACT.direccion}
                </strong>{" "}
                o comunicarse al {CONTACT.telefono}.
              </p>
            </div>
          </section>
        </main>
      </div>

      <footer style={pStyles.footer}>
        © {CONTACT.nombreLegal} &nbsp;·&nbsp;{" "}
        <span style={pStyles.footerAccent}>Municipalidad de Rosario</span>
        &nbsp;·&nbsp; Todos los derechos reservados
      </footer>
    </div>
  );
}

function SectionHeader({ num, title }: any) {
  return (
    <div style={pStyles.sectionHeader}>
      <div style={pStyles.sectionNum}>{num}</div>
      <h2 style={pStyles.sectionH2}>{title}</h2>
    </div>
  );
}

const pColors = {
  navy: "#0a1628",
  navyMid: "#122040",
  teal: "#0d7f74",
  tealLight: "#12a899",
  accent: "#e8f5f3",
  gold: "#c8a84b",
  white: "#f8faf9",
  grayText: "#4a5568",
  grayLight: "#e2e8f0",
};

const pStyles = {
  page: {
    fontFamily: "'Outfit', sans-serif",
    background: pColors.white,
    color: pColors.navy,
    lineHeight: 1.7,
    fontSize: 16,
    minHeight: "100vh",
  },
  topbar: {
    background: pColors.navy,
    color: "#8ba3c7",
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "0.55rem 2rem",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    flexWrap: "wrap",
  },
  topbarAccent: { color: pColors.tealLight },
  hero: {
    background: pColors.navy,
    position: "relative",
    overflow: "hidden",
    padding: "4rem 2rem 3rem",
    textAlign: "center",
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  heroGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 70% 60% at 15% 100%, rgba(13,127,116,0.28) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 90% 0%, rgba(13,127,116,0.15) 0%, transparent 55%)",
    pointerEvents: "none",
  },
  shieldIcon: {
    position: "relative",
    width: 56,
    height: 56,
    margin: "0 auto 1.5rem",
    background: `linear-gradient(135deg, ${pColors.teal}, ${pColors.tealLight})`,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(13,127,116,0.4)",
  },
  heroLabel: {
    position: "relative",
    fontSize: "0.72rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: pColors.tealLight,
    fontWeight: 600,
    marginBottom: "0.8rem",
  },
  heroTitle: {
    position: "relative",
    fontFamily: "'DM Serif Display', serif",
    fontSize: "clamp(1.8rem, 4.5vw, 2.9rem)",
    color: "#fff",
    lineHeight: 1.2,
    maxWidth: 760,
    margin: "0 auto 1.6rem",
    fontWeight: 400,
  },
  heroTitleEm: { fontStyle: "italic", color: pColors.tealLight },
  backButton: {
    position: "relative",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#c8d8f0",
    borderRadius: 50,
    padding: "0.55rem 1.3rem",
    fontSize: "0.82rem",
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
  },
  pageWrap: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "3rem 1.5rem 5rem",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "3rem",
    alignItems: "start",
  },
  sidebar: { position: "sticky", top: "2rem", padding: "1.4rem 0" },
  sidebarTitle: {
    fontSize: "0.68rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: pColors.teal,
    fontWeight: 600,
    marginBottom: "1rem",
    paddingLeft: "1rem",
  },
  sidebarLink: {
    display: "block",
    padding: "0.5rem 1rem",
    fontSize: "0.83rem",
    color: pColors.grayText,
    textDecoration: "none",
    borderLeft: `2px solid ${pColors.grayLight}`,
    marginBottom: "0.15rem",
    lineHeight: 1.4,
  },
  sidebarLinkActive: {
    color: pColors.teal,
    borderLeftColor: pColors.teal,
    background: pColors.accent,
    paddingLeft: "1.2rem",
  },
  sidebarBadge: {
    marginTop: "1.8rem",
    background: pColors.navy,
    borderRadius: 10,
    padding: "1rem",
    color: "#8ba3c7",
    fontSize: "0.75rem",
    lineHeight: 1.6,
  },
  sidebarBadgeStrong: {
    color: pColors.tealLight,
    display: "block",
    marginBottom: "0.3rem",
    fontSize: "0.8rem",
  },
  content: {},
  section: { marginTop: "2.5rem" },
  introCard: {
    background: `linear-gradient(135deg, ${pColors.navy} 0%, ${pColors.navyMid} 100%)`,
    borderRadius: 16,
    padding: "2rem 2.2rem",
    color: "#c8d8f0",
    fontSize: "0.93rem",
    fontWeight: 300,
    lineHeight: 1.8,
    borderLeft: `4px solid ${pColors.teal}`,
  },
  introStrong: { color: pColors.tealLight },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    marginBottom: "1.2rem",
  },
  sectionNum: {
    width: 34,
    height: 34,
    background: pColors.teal,
    color: "white",
    borderRadius: 8,
    fontSize: "0.78rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: "0.02em",
  },
  sectionH2: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "1.35rem",
    color: pColors.navy,
    fontWeight: 400,
    margin: 0,
  },
  card: {
    background: "#fff",
    border: `1px solid ${pColors.grayLight}`,
    borderRadius: 12,
    padding: "1.6rem 1.8rem",
    boxShadow: "0 2px 12px rgba(10,22,40,0.05)",
  },
  p: { color: pColors.grayText, fontSize: "0.92rem", margin: "0 0 0.9rem" },
  cardH3: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.82rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: pColors.teal,
    margin: "1.3rem 0 0.6rem",
    paddingBottom: "0.4rem",
    borderBottom: `1px dashed ${pColors.grayLight}`,
  },
  ul: { listStyle: "none", padding: 0, margin: 0 },
  li: {
    color: pColors.grayText,
    fontSize: "0.92rem",
    padding: "0.42rem 0 0.42rem 1.3rem",
    position: "relative",
    borderBottom: "1px solid rgba(226,232,240,0.5)",
  },
  noteBlock: {
    background: "#fffbeb",
    border: "1px solid #f6d860",
    borderLeft: `4px solid ${pColors.gold}`,
    borderRadius: 8,
    padding: "0.9rem 1.1rem",
    fontSize: "0.84rem",
    color: "#7a5c10",
    marginTop: "1rem",
    display: "flex",
    gap: "0.6rem",
  },
  arcoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.9rem",
    marginTop: "1.1rem",
  },
  arcoItem: {
    background: pColors.accent,
    borderRadius: 10,
    padding: "1rem 1.1rem",
    borderLeft: `3px solid ${pColors.teal}`,
  },
  arcoLetter: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "1.6rem",
    color: pColors.teal,
    lineHeight: 1,
    marginBottom: "0.3rem",
  },
  arcoName: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: pColors.navy,
    marginBottom: "0.3rem",
  },
  arcoText: { fontSize: "0.8rem", color: pColors.grayText, margin: 0 },
  contactCard: {
    background: `linear-gradient(135deg, ${pColors.teal} 0%, #0a5c55 100%)`,
    borderRadius: 12,
    padding: "1.8rem 2rem",
    color: "white",
  },
  contactCardH3: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.75rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  },
  contactCardP: { color: "rgba(255,255,255,0.88)", fontSize: "0.9rem", margin: 0 },
  footer: {
    background: pColors.navy,
    color: "#4a6080",
    textAlign: "center",
    padding: "1.8rem 2rem",
    fontSize: "0.78rem",
    letterSpacing: "0.04em",
  },
  footerAccent: { color: "#8ba3c7" },
} as const;

/* ══════════════════════════════════════════════════════════════
   APP — alterna entre el sitio institucional y la política
   de privacidad, ambos dentro del mismo dominio/SPA.
   ══════════════════════════════════════════════════════════════ */

export default function SecretariaSaludApp() {
  const [vista, setVista] = useState("inicio");

  return vista === "privacidad" ? (
    <PoliticaPrivacidad onVolver={() => setVista("inicio")} />
  ) : (
    <SecretariaSaludHome onIrAPrivacidad={() => setVista("privacidad")} />
  );
}