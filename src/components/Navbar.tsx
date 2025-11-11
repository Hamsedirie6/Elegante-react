import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { items } = useCart();
  const { isAuthenticated, roles } = useAuth();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">Elegante</NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : undefined}>Hem</NavLink>
          <NavLink to="/menu" className={({isActive}) => isActive ? 'active' : undefined}>Meny</NavLink>
          {isAuthenticated && (
            <NavLink to="/boka-bord" className={({isActive}) => isActive ? 'active' : undefined}>Boka bord</NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/varukorg" className={({isActive}) => isActive ? 'active' : undefined}>
              Varukorg{count > 0 ? ` ${count}` : ''}
            </NavLink>
          )}
          {(roles.includes('Kitchen') || roles.includes('Administrator')) && (
            <NavLink to="/kok" className={({isActive}) => isActive ? 'active' : undefined}>Kök</NavLink>
          )}
          {roles.includes('Administrator') && (
            <NavLink to="/admin" className={({isActive}) => isActive ? 'active' : undefined}>Admin</NavLink>
          )}
          {!isAuthenticated && (
            <NavLink to="/login" className={({isActive}) => isActive ? 'active' : undefined}>Logga in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
