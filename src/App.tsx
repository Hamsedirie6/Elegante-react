import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import Navbar from './components/Navbar';
import { checkAuth, logout } from './utils/auth';
import './App.css';
import HomeView from './views/home';
import MenuView from './views/menu';
import ReservationView from './views/Reservation';
import CartView from './views/Cart';
import CheckoutView from './views/Checkout';
import OrderView from './views/Order';
import KitchenView from './views/Kitchen';
import AdminView from './views/Admin';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsChecking(true);
    const result = await checkAuth();
    setIsAuthenticated(result.isAuthenticated);
    (globalThis as any).__AUTH__ = result.isAuthenticated;
    if (result.user) {
      setUsername(result.user.username);
      setRoles(Array.isArray(result.user.roles) ? result.user.roles : []);
    } else {
      setRoles([]);
    }
    setIsChecking(false);
  };

  const handleLoginSuccess = async () => {
    await checkAuthStatus();
    // expose auth state globally for CartContext guard
    (globalThis as any).__AUTH__ = true;
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUsername('');
    setRoles([]);
    (globalThis as any).__AUTH__ = false;
  };

  // removed auth-based HTML class toggle (menu buttons always visible)

  if (isChecking) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CartProvider>
    <BrowserRouter>
    <AuthProvider value={{ isAuthenticated, roles }}>
      {isAuthenticated && (
        <div className="logout-bar">
          Logged in as: <strong>{username}</strong> |{' '}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      )}
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/menu" element={<MenuView />} />
        <Route path="/boka-bord" element={isAuthenticated ? <ReservationView /> : <Navigate to="/login" replace />} />
        <Route path="/varukorg" element={isAuthenticated ? <CartView /> : <Navigate to="/login" replace />} />
        <Route path="/kassa" element={isAuthenticated ? <CheckoutView /> : <Navigate to="/login" replace />} />
        <Route path="/order/:id" element={<OrderView />} />
        {/* Kökssida (dold – vi begränsar behörighet senare) */}
        <Route path="/kok" element={roles.includes('Kitchen') || roles.includes('Administrator') ? <KitchenView /> : <Navigate to="/" replace />} />
        {/* Admin (dold – framtida behörighet) */}
        <Route path="/admin" element={roles.includes('Administrator') ? <AdminView /> : <Navigate to="/" replace />} />
        <Route path="/registrera" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/upload" element={isAuthenticated ? <FileUpload /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </BrowserRouter>
    </CartProvider>
  );
}
