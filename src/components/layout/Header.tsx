'use client';

import { useState } from 'react';
import { Sun, Menu, X, MapPin, Calendar, Sparkles, User, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-sunshine-400 to-coral-400 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg leading-tight text-gray-900">
                  Austin Camp Finder
                </h1>
                <p className="text-[10px] text-gray-400 -mt-0.5 font-medium tracking-wide uppercase">
                  Summer 2026
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/" icon={<MapPin className="w-4 h-4" />} label="Browse Camps" />
              <NavLink href="/calendar" icon={<Calendar className="w-4 h-4" />} label="My Calendar" />
              <NavLink href="/planner" icon={<Sparkles className="w-4 h-4" />} label="AI Planner" />
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="" width={28} height={28} className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-sky-600" />
                      </div>
                    )}
                    <span className="font-medium text-gray-700 max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* User dropdown */}
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1">
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/calendar"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-gray-400" />
                          My Calendar
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => { signOut(); setShowUserMenu(false); }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors text-sm font-semibold"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              <MobileNavLink href="/" icon={<MapPin className="w-4 h-4" />} label="Browse Camps" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="/calendar" icon={<Calendar className="w-4 h-4" />} label="My Calendar" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="/planner" icon={<Sparkles className="w-4 h-4" />} label="AI Planner" onClick={() => setMobileMenuOpen(false)} />
              {user ? (
                <>
                  <MobileNavLink href="/profile" icon={<User className="w-4 h-4" />} label="My Profile" onClick={() => setMobileMenuOpen(false)} />
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-sky-700 hover:bg-sky-50 transition-colors w-full text-left"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
