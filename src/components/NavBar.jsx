import "./NavBar.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);

  }, []);
  return (
    <nav className={"navbar-wrapper"}>
      <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <span className={`brand ${scrolled ? "hidden" : ""}`}>
          Lukas Lydon
        </span>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/projects">Projects</Link>
        </div>
      </div>
    </nav>
  );
}
