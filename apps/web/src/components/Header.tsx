import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMeApi, logoutApi } from '../api/auth';
import { ThemeToggle } from '../context/ThemeContext';
import { Icon } from './icons';
import { useT } from '../hooks/useT';

export const Header: React.FC = () => {
  const { t, language, toggleLanguage } = useT();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchToastVisible, setSearchToastVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/login');
    },
  });

  const user = data?.user;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    setSearchToastVisible(true);
    setTimeout(() => setSearchToastVisible(false), 3000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-[var(--accent)] hover:opacity-90 transition-opacity"
          >
            Ishraq Hub
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              to={`/${language}/topics`}
              className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              {t('nav.topics')}
            </Link>
          </nav>
        </div>

        {/* Right: Controls & Auth */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search Icon Placeholder */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-primary)] transition-colors relative"
            aria-label="Search"
            title={t('nav.search')}
          >
            <Icon name="search" size={18} />
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            aria-label="Switch Language"
          >
            {language === 'en' ? 'AM' : 'EN'}
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Auth Controls */}
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-[var(--accent)] border-[var(--border)] rounded-full animate-spin" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors text-xs font-semibold"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--bg-secondary)] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
                <Icon name="chevron-down" size={14} />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg py-1 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[var(--border)]">
                    <p className="font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-[var(--text-muted)] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--accent)] font-mono text-[10px] uppercase">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                  >
                    <Icon name="user" size={14} />
                    <span>{t('nav.dashboard')}</span>
                  </Link>

                  {(user.role === 'contributor' || user.role === 'super_admin') && (
                    <Link
                      to="/admin-demo"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[var(--accent)] hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <Icon name="lock" size={14} />
                      <span>{t('nav.admin')}</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-[var(--danger)] hover:bg-[var(--bg-primary)] transition-colors border-t border-[var(--border)]"
                  >
                    <Icon name="close" size={14} />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                {t('nav.signup')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
            aria-label="Open menu"
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {/* Search Placeholder Toast */}
      {searchToastVisible && (
        <div className="fixed top-20 right-4 z-50 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--accent)] shadow-xl text-xs flex items-center gap-2 animate-bounce">
          <Icon name="search" size={16} />
          <span>{t('search.comingSoon')}</span>
        </div>
      )}

      {/* Mobile Slide-Out Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-4/5 max-w-sm bg-[var(--bg-secondary)] border-l border-[var(--border)] h-full p-6 flex flex-col justify-between z-10 shadow-2xl space-y-6">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-[var(--accent)]"
                >
                  Ishraq Hub
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col space-y-4 text-base font-medium">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors py-1"
                >
                  {t('nav.home')}
                </Link>
                <Link
                  to={`/${language}/topics`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors py-1"
                >
                  {t('nav.topics')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleSearchClick();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors py-1 flex items-center gap-2"
                >
                  <Icon name="search" size={18} />
                  <span>{t('nav.search')}</span>
                </button>
              </nav>

              {/* Language Switcher Mobile */}
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Language / ቋንቋ
                </span>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-3 py-1 rounded text-xs font-bold uppercase border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--accent)]"
                >
                  {language === 'en' ? 'አማርኛ (AM)' : 'English (EN)'}
                </button>
              </div>
            </div>

            {/* Mobile Auth Area */}
            <div className="pt-6 border-t border-[var(--border)]">
              {user ? (
                <div className="space-y-3">
                  <div className="p-3 rounded bg-[var(--bg-primary)] border border-[var(--border)]">
                    <p className="font-bold text-sm text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 text-center rounded font-semibold text-xs border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    className="block w-full py-2 text-center rounded font-semibold text-xs bg-[var(--danger)] text-white"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded font-semibold text-sm border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)]"
                  >
                    {t('nav.signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
