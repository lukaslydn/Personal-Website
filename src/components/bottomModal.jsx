import "./bottomModal.css";
import { useState } from "react";

export default function Navbar() {
  const [Copied, setCopied] = useState(false)
    const copyEmail = () => {
      navigator.clipboard.writeText("l.lydn32@gmail.com");
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    };
  return (
    <div className="footer">
      <div className="bottom-modal">
        <a href="https://github.com/lukaslydn" target="_blank" rel="noreferrer">
          <ion-icon name="logo-github"></ion-icon>
        </a>

        <a href="https://www.linkedin.com/in/lukaslydon" target="_blank" rel="noreferrer">
          <ion-icon name="logo-linkedin"></ion-icon>
        </a>

      <div className="icon-wrapper">
        {Copied && (
          <div className="copy-pill">
            <ion-icon name="clipboard-outline"></ion-icon>
            <span>Email copied to clipboard</span>
          </div>
        )}

        <a onClick={copyEmail}>
          <ion-icon name="mail-outline"></ion-icon>
        </a>
      </div>

      </div>

      <p className="footer-name">Lukas Lydon</p>
    </div>
  );
}

