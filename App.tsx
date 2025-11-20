import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ModuleResume from './components/ModuleResume';
import ModuleMatch from './components/ModuleMatch';
import ModuleInterview from './components/ModuleInterview';
import ModuleCopilot from './components/ModuleCopilot';
import ModuleAssets from './components/ModuleAssets';
import ModuleResumeList from './components/ModuleResumeList';
import { AppMode } from './types';
import { ChevronLeft, Sparkles, ClipboardCheck, Target, Plus, Send, Bot, Save, FileText, Video, Database, Hexagon } from 'lucide-react';
import { createMiningChat } from './services/geminiService';
import { Chat } from '@google/genai';

// --- Components ---

const JobMateAvatar: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  // 3D Cartoon Child Avatar
  const sizeClasses = size === 'lg' ? 'w-24 h-24 shadow-2xl' : 'w-10 h-10 shadow-sm';
  // Using avatar.iran.liara.run for high quality 3D avatars
  const avatarUrl = "https://avatar.iran.liara.run/public/boy?username=JobMate";

  return (
    <div className={`${sizeClasses} rounded-full bg-white flex items-center justify-center text-white flex-shrink-0 relative overflow-hidden border-2 border-white`}>
       <img src={avatarUrl} alt="JobMate AI" className="w-full h-full object-cover scale-110" />
    </div>
  );
};

// --- Dashboard Chat Component ---
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const DashboardChat: React.FC = () => {
  const { addExperience, setMode } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createMiningChat();
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const modelMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: result.text || "我在听..." 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAttachment = () => {
    alert("打开文件选择器... (支持 PDF, Word, 图片)");
  };

  const handleSaveAsset = () => {
      const newExp = {
        id: Date.now().toString(),
        title: 'AI 对话挖掘经历',
        date: new Date().toISOString().slice(0, 7),
        situation: '通过首页 AI 对话挖掘',
        task: '从对话中提取',
        action: 'AI 自动记录',
        result: '待量化',
        tags: ['沟通能力', '待审核']
      };
      addExperience(newExp);
      alert("经历已保存到经历库！");
  };

  // Updated to horizontal pill style configuration
  const quickActions = [
    { label: '简历生成', icon: FileText, mode: AppMode.RESUME, color: 'text-blue-600' },
    { label: '视频面试', icon: Video, mode: AppMode.INTERVIEW, color: 'text-purple-600' },
    { label: '周报生成', icon: ClipboardCheck, mode: AppMode.COPILOT, color: 'text-emerald-600' },
    { label: '匹配检测', icon: Target, mode: AppMode.MATCH, color: 'text-orange-600' },
  ];

  return (
    <div className="flex flex-col h-full relative bg-slate-50">
      
      {/* Chat Area */}
      {/* Added pt-20 to prevent content from hiding behind the absolute header */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 space-y-6 relative z-0">
        
        {/* Empty State / Greeting Background */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[75%] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 relative group">
               {/* Outer Glow */}
               <div className="absolute inset-0 bg-indigo-400/30 blur-3xl rounded-full scale-150 opacity-60"></div>
               <JobMateAvatar size="lg" />
            </div>
            
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                下午好，我是职伴
              </h2>
              <p className="text-slate-400 text-sm font-medium">你的全周期职场数字分身</p>
            </div>
            
            {/* Conversation Starters (3 Options, Auto-Send) */}
            <div className="w-full max-w-[280px] space-y-3">
               <button onClick={() => handleSendMessage("挖掘一下我最近的项目经历亮点")} className="w-full px-4 py-3.5 bg-white rounded-2xl text-left text-slate-600 text-xs hover:bg-slate-50 hover:shadow-md transition-all border border-slate-100 shadow-sm flex items-center gap-3 group">
                 <span className="text-lg group-hover:scale-110 transition-transform">🚀</span> 挖掘项目经历亮点
               </button>
               <button onClick={() => handleSendMessage("面试遇到不懂的问题该怎么回答？")} className="w-full px-4 py-3.5 bg-white rounded-2xl text-left text-slate-600 text-xs hover:bg-slate-50 hover:shadow-md transition-all border border-slate-100 shadow-sm flex items-center gap-3 group">
                 <span className="text-lg group-hover:scale-110 transition-transform">😰</span> 面试遇到难题怎么救场？
               </button>
               <button onClick={() => handleSendMessage("帮我优化一下我的自我介绍")} className="w-full px-4 py-3.5 bg-white rounded-2xl text-left text-slate-600 text-xs hover:bg-slate-50 hover:shadow-md transition-all border border-slate-100 shadow-sm flex items-center gap-3 group">
                 <span className="text-lg group-hover:scale-110 transition-transform">✨</span> 帮我优化自我介绍
               </button>
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'model' && (
                <div className="mt-1">
                  <JobMateAvatar size="sm" />
                </div>
              )}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
              }`}>
                {msg.text}
                {msg.role === 'model' && messages.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                    <button onClick={handleSaveAsset} className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:bg-indigo-50 transition-colors px-2 py-1 rounded-md">
                      <Save className="w-3 h-3" /> 存为经历
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
           <div className="flex justify-start">
             <div className="flex gap-2 max-w-[80%]">
              <div className="mt-1">
                <JobMateAvatar size="sm" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
             </div>
          </div>
        )}
        <div ref={bottomRef} className="h-24" /> {/* Extra space for bottom controls */}
      </div>

      {/* Bottom Controls Area */}
      <div className="bg-slate-50 safe-pb relative z-20 pt-2">
        
        {/* Quick Action Buttons (Horizontal Pills Scrollable) */}
        <div className="px-4 mb-3 overflow-x-auto no-scrollbar flex gap-3 pb-1">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setMode(action.mode)}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex-shrink-0 active:scale-95"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-xs font-medium text-slate-600">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 items-end bg-white rounded-[24px] p-1.5 border border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleAttachment}
              className="w-9 h-9 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 hover:bg-slate-100 hover:text-indigo-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="发消息..."
              rows={1}
              className="flex-1 bg-transparent text-base py-2 px-2 focus:outline-none max-h-24 resize-none text-slate-800 placeholder:text-slate-400"
              style={{ minHeight: '36px' }}
            />
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
                inputValue.trim() 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {inputValue.trim() ? <Send className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-center mt-1.5">
              <span className="text-[10px] text-slate-300">内容由 AI 生成，请仔细甄别</span>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- Main Layout Parts ---

const MainContent: React.FC = () => {
  const { currentMode } = useApp();

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.RESUME: return <ModuleResume />;
      case AppMode.RESUME_LIST: return <ModuleResumeList />;
      case AppMode.MATCH: return <ModuleMatch />;
      case AppMode.INTERVIEW: return <ModuleInterview />;
      case AppMode.COPILOT: return <ModuleCopilot />;
      case AppMode.ASSETS: return <ModuleAssets />;
      case AppMode.DASHBOARD: 
      default: return <DashboardChat />;
    }
  };

  return (
    <main className="flex-1 relative overflow-hidden w-full bg-slate-50 h-full">
      {renderContent()}
    </main>
  );
};

const MobileHeader: React.FC = () => {
  const { currentMode, setMode } = useApp();

  // Navigation Logic Configuration
  const getHeaderConfig = () => {
    switch(currentMode) {
      case AppMode.DASHBOARD: return { title: "", showBack: false, transparent: true };
      case AppMode.RESUME: return { title: "简历定制", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.RESUME_LIST: return { title: "我的简历", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.MATCH: return { title: "人岗匹配", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.INTERVIEW: return { title: "面试模拟", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.COPILOT: return { title: "周报助手", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.ASSETS: return { title: "我的经历", showBack: true, backTo: AppMode.DASHBOARD };
      default: return { title: "JobMate", showBack: false };
    }
  }

  const config = getHeaderConfig();

  return (
    <div className={`h-14 px-4 flex items-center justify-between flex-shrink-0 z-30 absolute top-0 left-0 right-0 transition-colors ${
      config.transparent ? 'bg-slate-50/90 backdrop-blur-md text-slate-900' : 'bg-white text-slate-900 border-b border-slate-100 shadow-sm sticky'
    }`}>
      <div className="flex items-center gap-2">
        {config.showBack ? (
          <button 
            onClick={() => config.backTo && setMode(config.backTo)}
            className="p-1.5 -ml-2 mr-1 rounded-full active:scale-90 transition-transform hover:bg-slate-100 text-slate-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
           // User Avatar on Left for Dashboard
           <div className="w-9 h-9 rounded-full bg-indigo-100 overflow-hidden border-2 border-white shadow-sm">
              <img src="https://avatar.iran.liara.run/public/job/student/male" alt="User" className="w-full h-full object-cover bg-white" />
           </div>
        )}
        {config.showBack && <span className="font-bold text-lg tracking-tight">{config.title}</span>}
      </div>
      
      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        
        {/* My Resume Button (List View) */}
        <button 
          onClick={() => setMode(AppMode.RESUME_LIST)}
          className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-500"
          aria-label="My Resume"
        >
          <FileText className="w-6 h-6" />
        </button>

        {/* Experience Button (Previously Assets) */}
        <button 
          onClick={() => setMode(AppMode.ASSETS)}
          className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-500"
          aria-label="My Experience"
        >
          <Database className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <MobileHeader />
        <MainContent />
      </div>
    </AppProvider>
  );
};

export default App;