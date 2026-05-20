import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { toggleSidebar, setSidebarOpen, toggleTheme } from '../store/uiSlice';
import {
  LayoutDashboard,
  Camera,
  History,
  BarChart3,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';
import OfflineBadge from './OfflineBadge';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, theme } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AI Meal Scanner', path: '/scan', icon: Camera },
    { name: 'Meal History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile Settings', path: '/profile', icon: User },
  ];

  // If user is admin, append Admin Panel option
  if (user && user.role === 'admin') {
    navItems.push({ name: 'Admin Control', path: '/admin', icon: Shield });
  }

  return (
    <div className="app-shell flex min-h-screen bg-slate-950 text-slate-100 transition-colors duration-200">
      <OfflineBadge />

      {/* Backdrop overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={() => dispatch(setSidebarOpen(false))}
        ></div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col justify-between border-r border-slate-900 bg-slate-950/80 px-6 py-8 backdrop-blur-md transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-lg shadow-indigo-500/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
                FitAI Nutrition
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                MERN Stack Tracker
              </span>
            </div>
            {/* Close sidebar on mobile */}
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-10 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="min-w-0 truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="space-y-4 border-t border-slate-900 pt-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-semibold text-indigo-400 border border-slate-800">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold">{user?.name || 'Loading User...'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Light/Dark Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900/60 px-2 py-2.5 text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-slate-900/55"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Dark</span>
                </>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center rounded-xl bg-slate-900/60 px-3.5 py-2.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-900/55 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- CONTENT CONTAINER --- */}
      <div className={`flex flex-1 flex-col transition-all duration-300 md:pl-72`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-900 bg-slate-950/60 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <Flame className="h-5 w-5 text-indigo-500" />
              <span className="font-bold text-lg">FitAI</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            {user?.role === 'admin' && (
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-indigo-400 border border-indigo-500/20">
                Admin Panel Access
              </span>
            )}
            <span className="hidden sm:inline-block bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              Calorie Goal: <strong className="text-white">{user?.calorieGoal || 2000} kcal</strong>
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-8 animate-fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
