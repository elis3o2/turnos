import { useState, useEffect } from "react";

const services = [
  { icon: "💻", title: "Infraestructura IT", desc: "Diseño y gestión de redes, servidores y sistemas." },
  { icon: "🔒", title: "Seguridad Informática", desc: "Protección de datos y auditorías de vulnerabilidad." },
  { icon: "☁️", title: "Cloud & Hosting", desc: "Migración y administración de entornos en la nube." },
  { icon: "🛠️", title: "Soporte Técnico", desc: "Asistencia personalizada para empresas y particulares." },
];

export default function Eliseo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Georgia', serif",
      color: "#f0ede6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 1.5rem",
    }}>

      {/* Hero */}
      <section style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}>
        <p style={{
          fontSize: "0.85rem",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#a89ec0",
          marginBottom: "1.5rem",
          fontFamily: "'Trebuchet MS', sans-serif",
        }}>
          Consultoría en Servicios de Informática
        </p>

        <h1 style={{
          fontSize: "clamp(3.5rem, 10vw, 7rem)",
          fontWeight: "700",
          margin: "0",
          lineHeight: "1.05",
          background: "linear-gradient(135deg, #ffffff 30%, #c9bfff 70%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.02em",
        }}>
          Feuli<br />Eliseo
        </h1>

        <div style={{
          width: "60px",
          height: "2px",
          background: "linear-gradient(90deg, #a89ec0, #fff)",
          margin: "2rem auto",
          borderRadius: "2px",
        }} />

        <p style={{
          fontSize: "1.1rem",
          color: "#c4bcd8",
          maxWidth: "480px",
          lineHeight: "1.7",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontWeight: "300",
        }}>
          Soluciones tecnológicas a medida para empresas que quieren crecer con confianza.
        </p>

      </section>

      {/* Services */}
      <section id="servicios" style={{
        width: "100%",
        maxWidth: "900px",
        paddingBottom: "6rem",
      }}>
        <p style={{
          textAlign: "center",
          fontSize: "0.75rem",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#a89ec0",
          marginBottom: "3rem",
          fontFamily: "'Trebuchet MS', sans-serif",
        }}>
          Áreas de trabajo
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "1.25rem",
        }}>
          {services.map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(200,190,255,0.2)",
              borderRadius: "16px",
              padding: "1.75rem 1.5rem",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(200,190,255,0.5)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(200,190,255,0.2)";
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{s.icon}</div>
              <p style={{
                fontWeight: "600",
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: "#e8e3ff",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}>{s.title}</p>
              <p style={{
                fontSize: "0.88rem",
                color: "#a89ec0",
                lineHeight: "1.6",
                fontFamily: "'Trebuchet MS', sans-serif",
                fontWeight: "300",
              }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        paddingBottom: "2.5rem",
        textAlign: "center",
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "0.8rem",
        color: "#6b6480",
        letterSpacing: "0.05em",
      }}>
        © {new Date().getFullYear()} Eliseo Feuli · Consultoría Informática
      </footer>
    </div>
  );
}