import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">Elegante</NavLink>
        <nav className="nav-links">
          <NavLink to="/">Hem</NavLink>
          <NavLink to="/menu">Meny</NavLink>
          <NavLink to="/boka-bord">Boka bord</NavLink>
          <NavLink to="/varukorg">Varukorg</NavLink>
          <NavLink to="/login">Logga in</NavLink>
        </nav>
      </div>
    </header>
  );
}

