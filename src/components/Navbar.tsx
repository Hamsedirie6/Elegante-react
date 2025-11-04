import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">Elegante</NavLink>
        <nav className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : undefined}>Hem</NavLink>
          <NavLink to="/menu" className={({isActive}) => isActive ? 'active' : undefined}>Meny</NavLink>
          <NavLink to="/boka-bord" className={({isActive}) => `btn primary ${isActive ? 'active' : ''}`}>Boka bord</NavLink>
          <NavLink to="/varukorg" className={({isActive}) => isActive ? 'active' : undefined}>Varukorg</NavLink>
          <NavLink to="/login" className={({isActive}) => isActive ? 'active' : undefined}>Logga in</NavLink>
        </nav>
      </div>
    </header>
  );
}

