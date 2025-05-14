import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  HelpCircle, 
  Settings,
  Receipt
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 hidden md:block bg-slate-900/80 backdrop-blur-md border-r border-slate-800 shadow-xl">
      <div className="py-6 px-4">
        <nav className="space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/apply" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <FileText className="mr-3 h-5 w-5" />
            Apply for Mortgage
          </NavLink>
          
          <NavLink 
            to="/wallet" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Wallet className="mr-3 h-5 w-5" />
            Wallet
          </NavLink>
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resources
            </h3>
          </div>
          
          <a 
            href="#" 
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Receipt className="mr-3 h-5 w-5" />
            Documentation
          </a>
          
          <a 
            href="#" 
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <HelpCircle className="mr-3 h-5 w-5" />
            Help & Support
          </a>
          
          <a 
            href="#" 
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;