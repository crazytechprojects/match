import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar({ transparent = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user?.onboarded ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Matchwise</span>
          </Link>

          {user?.onboarded && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" active={isActive("/dashboard")}>
                <MessageCircle className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/profile" active={isActive("/profile")}>
                <User className="w-4 h-4" />
                Profile
              </NavLink>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user?.onboarded ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm text-surface-300">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-surface-800 text-surface-400 cursor-pointer"
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-400 hover:to-accent-400 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && user?.onboarded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-900/95 backdrop-blur-xl border-b border-surface-800"
          >
            <div className="px-4 py-3 space-y-1">
              <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                <MessageCircle className="w-4 h-4" /> Dashboard
              </MobileNavLink>
              <MobileNavLink to="/profile" onClick={() => setMenuOpen(false)}>
                <User className="w-4 h-4" /> Profile
              </MobileNavLink>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-surface-800 text-white"
          : "text-surface-400 hover:text-white hover:bg-surface-800/50"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
    >
      {children}
    </Link>
  );
}
