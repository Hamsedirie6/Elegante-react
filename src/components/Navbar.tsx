import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">Elegante</NavLink>
        <nav className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : undefined}>Hem</NavLink>
          <NavLink to="/menu" className={({isActive}) => isActive ? 'active' : undefined}>Meny</NavLink>
          <NavLink to="/boka-bord" className={({isActive}) => isActive ? 'active' : undefined}>Boka bord</NavLink>
          <NavLink to="/varukorg" className={({isActive}) => isActive ? 'active' : undefined}>
            Varukorg{count > 0 ? ` ${count}` : ''}
          </NavLink>
          <NavLink to="/login" className={({isActive}) => isActive ? 'active' : undefined}>Logga in</NavLink>
        </nav>
      </div>
    </header>
  );
}
