import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppMode } from '../types';

const Sidebar: React.FC = () => {
  const { currentMode, setMode } = useApp();

  // Logic: If inside a sub-module (Miner or Match), highlight the parent tab
  const menuItems = [
    { 
      id: AppMode.DASHBOARD, 
      label: '首页', 
      icon: LayoutDashboard,
      // Copilot/Radar is accessed from Dashboard tools
      isActive: (mode: AppMode) => mode === AppMode.DASHBOARD || mode === AppMode.RADAR
    },
    { 
      id: AppMode.RESUME, 
      label: '简历', 
      icon: FileText,
      // Match and Resume List are accessed from Resume (or Dashboard shortcut, but logically under Resume)
      isActive: (mode: AppMode) => mode === AppMode.RESUME || mode === AppMode.MATCH || mode === AppMode.RESUME_LIST
    },
    { 
      id: AppMode.INTERVIEW, 
      label: '面试', 
      icon: Video,
      isActive: (mode: AppMode) => mode === AppMode.INTERVIEW 
    },
    { 
      id: AppMode.ASSETS, 
      label: '资产', 
      icon: Database,
      isActive: (mode: AppMode) => mode === AppMode.ASSETS 
    },
  ];

  return (
    <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 pb-safe">
      {menuItems.map((item) => {
        const active = item.isActive(currentMode);
        return (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95 ${
              active 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors duration-300 ${active ? 'bg-primary/10' : 'bg-transparent'}`}>
              <item.icon className={`w-5 h-5 ${active ? 'fill-primary/20' : ''}`} />
            </div>
            <span className={`text-[10px] font-medium mt-1 transition-colors ${active ? 'text-primary' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;