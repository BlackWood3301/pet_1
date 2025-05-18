import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTwitter, FaHome, FaUser, FaSignOutAlt, FaBell, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Обработка поискового запроса
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (searchQuery.startsWith('#')) {
      // Если поиск начинается с #, это поиск по тегу
      const tag = searchQuery.substring(1).trim();
      if (tag) {
        navigate(`/search?tag=${encodeURIComponent(tag)}`);
      }
    } else {
      // Обычный текстовый поиск
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
    
    // Закрыть мобильное меню если оно открыто
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    
    // Очистить поисковую строку после отправки
    setSearchQuery('');
  };

  return (
    <nav 
      className={`${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white/80 backdrop-blur-md'
      } transition-all duration-300 sticky top-0 z-50`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-primary"
            >
              <FaTwitter className="text-3xl" />
              <span className="font-bold text-xl hidden sm:block">PasteBin</span>
            </Link>
          </div>

          {/* Search Bar - Only on desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по тегу (#тег) или тексту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-extralight/50 focus:bg-white border border-extralight rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </form>
          </div>

          {/* Primary Nav Items */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center px-4 py-2 rounded-full transition ${
                isActive('/') 
                  ? 'text-primary font-semibold bg-blue-50' 
                  : 'text-dark hover:bg-extralight/70'
              }`}
            >
              <FaHome className={`mr-2 ${isActive('/') ? 'text-primary' : 'text-gray-500'}`} />
              <span>Главная</span>
            </Link>
            
            {currentUser && (
              <>
                <Link 
                  to="/profile" 
                  className={`flex items-center px-4 py-2 rounded-full transition ${
                    isActive('/profile') 
                      ? 'text-primary font-semibold bg-blue-50' 
                      : 'text-dark hover:bg-extralight/70'
                  }`}
                >
                  <FaUser className={`mr-2 ${isActive('/profile') ? 'text-primary' : 'text-gray-500'}`} />
                  <span>Профиль</span>
                </Link>
                
                <button 
                  className="ml-2 p-2 text-dark bg-extralight/50 hover:bg-extralight rounded-full transition"
                >
                  <FaBell />
                </button>
              </>
            )}
          </div>

          {/* Right Side Nav */}
          <div className="hidden md:flex items-center ml-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary rounded-full text-white flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-dark font-medium hidden lg:block">{currentUser.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Выйти</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-primary hover:text-blue-600 transition">
                  Вход
                </Link>
                <Link to="/register" className="btn-primary">
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-dark focus:outline-none rounded-full p-2 hover:bg-extralight/60"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path fillRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-extralight shadow-lg absolute w-full left-0">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по тегу (#тег) или тексту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-extralight/50 focus:bg-white border border-extralight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>
            
            <Link 
              to="/" 
              className={`flex items-center py-3 px-4 rounded-lg ${
                isActive('/') 
                  ? 'bg-blue-50 text-primary font-medium' 
                  : 'text-dark hover:bg-extralight/70'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome className="mr-3" />
              Главная
            </Link>
            
            {currentUser && (
              <Link 
                to="/profile" 
                className={`flex items-center py-3 px-4 rounded-lg ${
                  isActive('/profile') 
                    ? 'bg-blue-50 text-primary font-medium' 
                    : 'text-dark hover:bg-extralight/70'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser className="mr-3" />
                Профиль
              </Link>
            )}

            {currentUser ? (
              <div className="pt-3 mt-2 border-t border-extralight">
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="h-8 w-8 bg-primary rounded-full text-white flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-dark font-medium">{currentUser.name}</span>
                </div>
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-3 flex items-center py-3 px-4 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <FaSignOutAlt className="mr-3" />
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-3 border-t border-extralight">
                <Link 
                  to="/login" 
                  className="py-3 px-4 text-center text-primary border border-primary rounded-lg hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Вход
                </Link>
                <Link 
                  to="/register" 
                  className="py-3 px-4 text-center bg-primary text-white rounded-lg hover:bg-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 