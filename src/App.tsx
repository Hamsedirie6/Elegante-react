import { CartProvider } from './context/CartContext';
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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsChecking(true);
    const result = await checkAuth();
    setIsAuthenticated(result.isAuthenticated);
    if (result.user) {
      setUsername(result.user.username);
    }
    setIsChecking(false);
  };

  const handleLoginSuccess = async () => {
    await checkAuthStatus();
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUsername('');
  };

  // removed auth-based HTML class toggle (menu buttons always visible)

  if (isChecking) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  const Home = () => (
    <div className="container">
      <h1>Välkommen till Elegante</h1>
      <p>smak, stil och glädje</p>
    </div>
  );

  const Menu = () => (
    <div className="container">
      <h1>Meny</h1>
      <p>Här visar vi rätter från backend senare.</p>
    </div>
  );

  const Reservation = () => (
    <div className="container">
      <h1>Boka bord</h1>
      <p>Form kommer i nästa steg.</p>
    </div>
  );

  const Cart = () => (
    <div className="container">
      <h1>Varukorg</h1>
      <p>Beställningar visas här.</p>
    </div>
  );

  return (
    <CartProvider>
    <BrowserRouter>
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
        <Route path="/boka-bord" element={<ReservationView />} />
        <Route path="/varukorg" element={<CartView />} />
        <Route path="/kassa" element={<CheckoutView />} />
        <Route path="/order/:id" element={<OrderView />} />
        {/* Kökssida (dold – vi begränsar behörighet senare) */}
        <Route path="/kok" element={<KitchenView />} />
        {/* Admin (dold – framtida behörighet) */}
        <Route path="/admin" element={<AdminView />} />
        <Route path="/registrera" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/upload" element={isAuthenticated ? <FileUpload /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
  );
}
