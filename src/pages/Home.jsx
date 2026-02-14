import "./Home.css"
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container">
      <div className="card-container">
      {/* Hero Card */}
      <section className="heroCard">
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 500 }}>
          Welcome 👋
        </h1>

        <p
          style={{
            marginTop: "0.75rem",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          I post about things I’m building, learning, and thinking about.
          Keeping things Minimal. Honest. Personal.
        </p>
      </section>

      {/* App-style buttons */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <Card title="Blog" subtitle="Writing & thoughts 🚀" />
        <Card title="Projects" subtitle="Things I’ve made 🛠️" />
        <Card title="About" subtitle="Me, briefly 👋" />
        <Card title="Contact" subtitle="Say hello 📩" />
      </section>
    </div>
    </div>
  );
}

function Card({ title, subtitle }) {
  return (
    <Link to={title.toLowerCase()}>
    <div className="card">
      <span style={{ fontWeight: 500 }}>{title}</span>
      <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>
        {subtitle}
      </span>
    </div>
    </Link>
  );
}
