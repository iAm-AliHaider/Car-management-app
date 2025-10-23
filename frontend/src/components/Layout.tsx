import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/cars', label: 'My Cars' },
    { to: '/services', label: 'Services' },
    { to: '/fuel', label: 'Fuel' },
    { to: '/expenses', label: 'Expenses' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/parts', label: 'Parts' },
    { to: '/orders', label: 'Orders' },
    { to: '/rental-marketplace', label: 'Rent Cars' },
    { to: '/rental-bookings', label: 'My Rentals' },
    { to: '/fleets', label: 'Fleets' },
    { to: '/fleet-services', label: 'Fleet Services' },
    { to: '/accident-reports', label: 'Accidents' },
    { to: '/insurance-claims', label: 'Insurance' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-white text-xl font-bold">
                  Car Manager
                </Link>
              </div>
              {isAuthenticated && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive(link.to)
                          ? 'border-white text-white'
                          : 'border-transparent text-primary-100 hover:border-primary-300 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {isAuthenticated && (
              <div className="flex items-center">
                <span className="text-primary-100 mr-4">Welcome, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
