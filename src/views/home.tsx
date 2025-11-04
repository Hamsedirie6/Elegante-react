export default function Home() {
  return (
    <>
      {/* Fullbredds-hero */}
      <section className="home-hero">
        <div className="home-hero-image">
          <div className="home-hero-overlay">
            <h1>Välkommen till Elegante</h1>
            <p>smak, stil och glädje</p>
            <a className="btn primary" href="/menu">Se vår meny</a>
          </div>
        </div>
      </section>

      {/* Info-kort (Öppettider/Kontakt) */}
      <section className="home-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-title">
                <span className="info-icon">⏱️</span>
                <h3>Öppettider</h3>
              </div>
              <ul className="info-list">
                <li><span>Måndag – Torsdag</span><span>17:00 – 22:00</span></li>
                <li><span>Fredag – Lördag</span><span>17:00 – 24:00</span></li>
                <li><span>Söndag</span><span>Stängt</span></li>
              </ul>
            </div>

            <div className="info-card">
              <div className="info-title">
                <span className="info-icon">📞</span>
                <h3>Kontakt</h3>
              </div>
              <ul className="info-list">
                <li><span>08‑123 45 67</span></li>
                <li><span>info@elegante.se</span></li>
                <li><span>Storgatan 15, Stockholm</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer-delen på startsidan */}
      <section className="home-footer">
        <div className="container home-footer-inner">
          <div className="home-footer-col">
            <h4>Elegante</h4>
            <p>En kulinarisk upplevelse som kombinerar traditionell elegans med modern gastronomi.</p>
          </div>
          <div className="home-footer-col">
            <h4>Kontakt</h4>
            <p>Storgatan 15, 111 51</p>
            <p>Stockholm</p>
            <p>info@elegante.se</p>
            <p>08‑123 45 67</p>
          </div>
        </div>
      </section>
    </>
  );
}
