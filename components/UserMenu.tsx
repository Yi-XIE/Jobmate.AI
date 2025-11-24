
import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, MessageSquare, X, Settings, ChevronRight } from 'lucide-react';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { currentUser, chatHistory, loadChatSession } = useApp();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header / Profile (Compacted) */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 relative mt-safe">
          <button onClick={onClose} className="absolute top-5 right-4 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover bg-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-base font-bold text-slate-800 leading-tight">{currentUser.name}</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-200/50 px-2 py-0.5 rounded-md inline-block self-start">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Chat History */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">历史对话</h3>
            <div className="space-y-1">
              {chatHistory.length === 0 ? (
                <p className="text-xs text-slate-400 px-2">暂无历史记录</p>
              ) : (
                chatHistory.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => { 
                        loadChatSession(chat.id);
                        onClose(); 
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-100 transition-colors text-left group"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm text-slate-700 font-medium truncate group-hover:text-indigo-700">{chat.title}</div>
                      <div className="text-[10px] text-slate-400">{chat.date}</div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/30 pb-safe">
          <button className="w-full flex items-center gap-3 p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm font-medium">
            <Settings className="w-4 h-4" /> 设置
          </button>
          <button 
            onClick={() => alert("退出登录")}
            className="w-full flex items-center gap-3 p-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      </div>
    </>
  );
};

export default UserMenu;
