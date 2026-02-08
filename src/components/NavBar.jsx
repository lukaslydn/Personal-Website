import "./NavBar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar-wrapper">
      <div className="navbar">
        <span className="brand">Lukas Lydon</span>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/projects">Projects</Link>
        </div>
      </div>
    </nav>
  );
}
