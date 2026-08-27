import React from 'react';
import { Menu, Database, ShieldCheck, User } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, role } = useAuth();
  const onlineSupabase = isSupabaseConfigured();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Year</span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            2026–2027
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Supabase Status Indicator */}
        <div
          title={onlineSupabase ? 'Connected to online Supabase PostgreSQL database' : 'Running in local reactive database mode'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            onlineSupabase
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-semibold">
            {onlineSupabase ? 'Supabase Online' : 'Database Active'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.full_name?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name}</p>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] text-slate-500 font-medium capitalize">
                {role === 'head_master' ? 'Head Master' : role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
