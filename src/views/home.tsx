export default function Home() {
  return (
    <div className="container">
      <section>
        <h1>Välkommen till Elegante</h1>
        <p>smak, stil och glädje</p>
        <a className="btn primary" href="/menu">Se vår meny</a>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Öppettider</h3>
        <p>Måndag – Torsdag: 17:00 – 22:00</p>
        <p>Fredag – Lördag: 17:00 – 24:00</p>
        <p>Söndag: Stängt</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Kontakt</h3>
        <p>08-123 45 67</p>
        <p>info@elegante.se</p>
        <p>Storgatan 15, Stockholm</p>
      </section>
    </div>
  ); return (
    <div className="container">
      <section className="hero">
        <div className="hero-overlay">
          <h1>Välkommen till Elegante</h1>
          <p>smak, stil och glädje</p>
          <a className="btn primary" href="/menu">Se vår meny</a>
        </div>
      </section>

      <section className="cards">
        <div className="card">
          <h3>Öppettider</h3>
          <p>Måndag – Torsdag: 17:00 – 22:00</p>
          <p>Fredag – Lördag: 17:00 – 24:00</p>
          <p>Söndag: Stängt</p>
        </div>
        <div className="card">
          <h3>Kontakt</h3>
          <p>08-123 45 67</p>
          <p>info@elegante.se</p>
          <p>Storgatan 15, Stockholm</p>
        </div>
      </section>
    </div>
  );
}


