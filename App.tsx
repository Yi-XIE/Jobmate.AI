
import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ModuleResume from './components/ModuleResume';
import ModuleMatch from './components/ModuleMatch';
import ModuleInterview from './components/ModuleInterview';
import ModuleRadar from './components/ModuleRadar';
import ModuleAssets from './components/ModuleAssets';
import ModuleResumeList from './components/ModuleResumeList';
import UserMenu from './components/UserMenu'; 
import { AppMode, Message, StarExperience } from './types';
import { ChevronLeft, Target, Plus, Send, Bot, FileText, Video, Database, Mic, MicOff, Volume2, VolumeX, PlayCircle, StopCircle, Activity, Archive, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { createMiningChat, generateChatTitle, generateStarFromChat } from './services/geminiService';
import { Chat } from '@google/genai';

// --- Constants & Helpers ---

const suggestionPool = [
  { icon: "🚀", label: "挖掘项目经历亮点", prompt: "挖掘一下我最近的项目经历亮点" },
  { icon: "😰", label: "面试遇到难题怎么救场？", prompt: "面试遇到不懂的问题该怎么回答？" },
  { icon: "✨", label: "帮我优化自我介绍", prompt: "帮我优化一下我的自我介绍" },
  { icon: "🎓", label: "社团经历怎么写？", prompt: "如何把社团活动包装成职场能力？" },
  { icon: "💣", label: "回答“最大的缺点”", prompt: "如何回答“你最大的缺点是什么”？" },
  { icon: "🎯", label: "提炼 STAR 法则", prompt: "帮我把这段经历整理成 STAR 格式" },
  { icon: "💼", label: "入职注意事项", prompt: "入职第一周应该注意什么？" },
  { icon: "📈", label: "量化工作产出", prompt: "帮我量化一下我的工作产出，使其看起来更专业" },
  { icon: "🔍", label: "简历诊断", prompt: "请帮我诊断一下简历中的逻辑漏洞" },
  { icon: "💡", label: "职业规划建议", prompt: "我该选大公司还是创业公司？" },
];

const getRandomSuggestions = () => {
  const shuffled = [...suggestionPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

// --- Components ---

const JobMateAvatar: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  // 3D Cartoon Child Avatar
  const sizeClasses = size === 'lg' ? 'w-24 h-24 shadow-2xl' : 'w-10 h-10 shadow-sm';
  const avatarUrl = "https://avatar.iran.liara.run/public/boy?username=JobMate";

  return (
    <div className={`${sizeClasses} rounded-full bg-white flex items-center justify-center text-white flex-shrink-0 relative overflow-hidden border-2 border-white`}>
       <img src={avatarUrl} alt="JobMate AI" className="w-full h-full object-cover scale-110" />
    </div>
  );
};

// --- Modal for Saving Experience ---
const SaveExperienceModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    messages: Message[], 
    chatTitle: string,
    onSaveSuccess: () => void 
}> = ({ isOpen, onClose, messages, chatTitle, onSaveSuccess }) => {
    const { addExperience, saveChatSession } = useApp();
    const [step, setStep] = useState<'loading' | 'preview'>('loading');
    const [generatedExp, setGeneratedExp] = useState<Partial<StarExperience> | null>(null);

    useEffect(() => {
        if (isOpen && messages.length > 0) {
            setStep('loading');
            generateStarFromChat(messages)
                .then(exp => {
                    setGeneratedExp(exp);
                    setStep('preview');
                })
                .catch(err => {
                    console.error(err);
                    alert("挖掘失败，请重试");
                    onClose();
                });
        }
    }, [isOpen, messages]);

    const handleConfirmSave = () => {
        if (generatedExp) {
            const newExp: StarExperience = {
                id: Date.now().toString(),
                title: generatedExp.title || '未命名经历',
                date: generatedExp.date || new Date().toISOString().slice(0, 7),
                type: 'work', // Default or inferred? AI currently doesn't infer type well, defaulting to work or let user edit later
                situation: generatedExp.situation || '',
                task: generatedExp.task || '',
                action: generatedExp.action || '',
                result: generatedExp.result || '',
                tags: generatedExp.tags || ['沟通能力']
            };
            
            // 1. Save to Experience List
            addExperience(newExp);
            // 2. Archive Chat
            saveChatSession(messages, chatTitle || generatedExp.title || '对话归档');
            
            onSaveSuccess();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                {step === 'loading' ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative">
                            <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                            <div className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">AI 正在提炼经历精华...</h3>
                        <p className="text-sm text-slate-500 mt-2">正在分析对话，整理 STAR 结构</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                             <div className="flex items-center gap-2">
                                 <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                                     <CheckCircle2 className="w-4 h-4" />
                                 </div>
                                 <h3 className="font-bold text-slate-800">挖掘成功</h3>
                             </div>
                             <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                                 <X className="w-5 h-5" />
                             </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                             <div className="space-y-1">
                                 <label className="text-xs font-bold text-slate-400 uppercase">标题</label>
                                 <h2 className="text-lg font-bold text-slate-900">{generatedExp?.title}</h2>
                             </div>
                             
                             <div className="flex flex-wrap gap-2">
                                 {generatedExp?.tags?.map((t, i) => (
                                     <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">{t}</span>
                                 ))}
                             </div>

                             <div className="space-y-3 pt-2">
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded mb-1 inline-block">Situation</span>
                                    <p className="text-xs text-slate-700 leading-relaxed">{generatedExp?.situation}</p>
                                </div>
                                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded mb-1 inline-block">Task</span>
                                    <p className="text-xs text-slate-700 leading-relaxed">{generatedExp?.task}</p>
                                </div>
                                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                                    <span className="text-[10px] font-bold text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded mb-1 inline-block">Action</span>
                                    <p className="text-xs text-slate-700 leading-relaxed">{generatedExp?.action}</p>
                                </div>
                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded mb-1 inline-block">Result</span>
                                    <p className="text-xs text-slate-700 leading-relaxed">{generatedExp?.result}</p>
                                </div>
                             </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm"
                            >
                                放弃
                            </button>
                            <button 
                                onClick={handleConfirmSave}
                                className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                            >
                                保存并归档
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Dashboard Chat Component ---

const DashboardChat: React.FC = () => {
  const { setMode, messages, setMessages, setCurrentChatTitle, currentChatTitle, saveChatSession } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [suggestions, setSuggestions] = useState(getRandomSuggestions());
  
  const chatSessionRef = useRef<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Chat Session
  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createMiningChat();
    }
  }, []);

  // Refresh suggestions when returning to empty chat
  useEffect(() => {
    if (messages.length === 0) {
      setSuggestions(getRandomSuggestions());
    }
  }, [messages.length]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isSpeaking]);

  // --- TTS Logic Setup ---
  useEffect(() => {
    const initSpeech = () => {
      const voices = window.speechSynthesis.getVoices();
      // Just triggering this ensures voices are loaded in some browsers
    };
    initSpeech();
    window.speechSynthesis.onvoiceschanged = initSpeech;
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Speak when new model message arrives
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    
    if (
      autoPlayAudio && 
      lastMsg && 
      lastMsg.role === 'model' && 
      !isTyping && 
      lastMsg.id !== lastReadMessageId
    ) {
      // Slight delay to ensure previous cancel takes effect and browser is ready
      setTimeout(() => {
         speakMessage(lastMsg.text);
         setLastReadMessageId(lastMsg.id);
      }, 100);
    }
  }, [messages, autoPlayAudio, isTyping, lastReadMessageId]);

  const speakMessage = (text: string) => {
    window.speechSynthesis.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // --- Intelligent Voice Selection ---
    const voices = window.speechSynthesis.getVoices();
    const zhVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('CN'));
    
    // Heuristic to find a "better" voice than the default system robotic voice
    let bestVoice = zhVoices.find(v => v.name.includes('Google 普通话')); // Android/Chrome High Quality
    if (!bestVoice) bestVoice = zhVoices.find(v => v.name.includes('Microsoft')); // Edge/Windows Natural
    if (!bestVoice) bestVoice = zhVoices.find(v => v.name.includes('Ting-Ting')); // iOS/Mac Natural
    if (!bestVoice) bestVoice = zhVoices.find(v => !v.localService); // Online voices are usually better
    if (!bestVoice) bestVoice = zhVoices[0]; // Fallback

    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    
    utterance.lang = 'zh-CN';
    utterance.rate = 1.1; 
    utterance.pitch = 1.05; // Slightly higher pitch for a younger, friendlier tone

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || !chatSessionRef.current) return;

    const isFirstMessage = messages.length === 0;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages([...messages, userMsg]);
    setInputValue('');
    setIsTyping(true);
    stopSpeaking(); // Stop AI speech when user sends message

    // Generate title if first message
    if (isFirstMessage) {
       generateChatTitle(textToSend).then(title => {
          setCurrentChatTitle(title);
       });
    }

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

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      alert("当前浏览器不支持语音输入");
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      stopSpeaking(); // Stop AI speaking when user starts recording
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + transcript);
    };

    recognition.start();
  };

  const handleFinishSession = () => {
      if (messages.length < 2) {
          alert("对话内容太少，无法生成经历。请多聊几句！");
          return;
      }
      setShowSaveModal(true);
  };

  const handleSaveSuccess = () => {
      setShowSaveModal(false);
      setMessages([]);
      setCurrentChatTitle("");
      setMode(AppMode.ASSETS); // Redirect to Assets page to see the new item
  };

  const handleAttachment = () => {
    alert("打开文件选择器... (支持 PDF, Word, 图片)");
  };

  // Updated Quick Actions: Compact, Horizontal, Radar replaces Copilot
  const quickActions = [
    { label: '简历生成', icon: FileText, mode: AppMode.RESUME, color: 'text-blue-600' },
    { label: '视频面试', icon: Video, mode: AppMode.INTERVIEW, color: 'text-purple-600' },
    { label: '能力雷达', icon: Activity, mode: AppMode.RADAR, color: 'text-emerald-600' }, // Updated
    { label: '人岗匹配', icon: Target, mode: AppMode.MATCH, color: 'text-orange-600' }, // Updated Label
  ];

  const isChatting = messages.length > 0;
  const { currentUser } = useApp();

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-50 overflow-hidden">
      
      {/* Save Experience Modal */}
      <SaveExperienceModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)}
        messages={messages}
        chatTitle={currentChatTitle}
        onSaveSuccess={handleSaveSuccess}
      />
      
      {/* Chat Area */}
      <div className={`flex-1 space-y-6 relative z-0 overscroll-none ${isChatting ? 'overflow-y-auto p-4 pt-20 no-scrollbar' : 'overflow-hidden flex flex-col pb-0 px-6'}`}>
        
        {/* Empty State - Aligned Higher with pt-32 */}
        {!isChatting && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-700 justify-start h-full pt-32">
            
            <div className="mb-6 relative group">
               <div className="absolute inset-0 bg-indigo-400/30 blur-3xl rounded-full scale-150 opacity-60"></div>
               <JobMateAvatar size="lg" />
            </div>
            
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {getGreeting()}，{currentUser.name}
              </h2>
              <p className="text-slate-400 text-sm font-medium">我是职伴，你的全周期职场数字分身</p>
            </div>
            
            {/* Conversation Starters - Compact Layout */}
            <div className="w-full max-w-[280px] space-y-2">
               {suggestions.map((s, i) => (
                 <button key={i} onClick={() => handleSendMessage(s.prompt)} className="w-full px-4 py-2.5 bg-white rounded-xl text-left text-slate-600 text-sm hover:bg-slate-50 hover:shadow-md transition-all border border-slate-100 shadow-sm flex items-center gap-3 group">
                   <span className="text-lg group-hover:scale-110 transition-transform">{s.icon}</span> <span className="font-medium text-slate-700">{s.label}</span>
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'model' && (
                <div className="mt-1 flex flex-col gap-2 items-center">
                  <JobMateAvatar size="sm" />
                  {/* Manual Play Button for AI messages */}
                  <button 
                    onClick={() => isSpeaking ? stopSpeaking() : speakMessage(msg.text)}
                    className="text-slate-300 hover:text-indigo-500 p-1 rounded-full transition-colors"
                  >
                    {isSpeaking && lastReadMessageId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                </div>
              )}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
              }`}>
                {msg.text}
                
                {/* Visual Feedback for Speaking */}
                {msg.role === 'model' && isSpeaking && lastReadMessageId === msg.id && (
                   <div className="absolute -bottom-6 left-0 flex gap-0.5 h-3 items-end px-2">
                     <span className="w-1 bg-indigo-400 animate-pulse h-1"></span>
                     <span className="w-1 bg-indigo-400 animate-pulse h-2 delay-75"></span>
                     <span className="w-1 bg-indigo-400 animate-pulse h-3 delay-150"></span>
                     <span className="w-1 bg-indigo-400 animate-pulse h-1 delay-200"></span>
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
        <div ref={bottomRef} className={isChatting ? "h-24" : "h-0"} />
      </div>

      {/* Bottom Controls Area */}
      <div className="bg-slate-50 safe-pb relative z-20 pt-2">
        
        {/* Quick Actions - Hidden when chatting */}
        {!isChatting && (
          // Horizontal Layout: flex-row (Icon + Text on one line)
          <div className="px-4 mb-3 flex gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setMode(action.mode)}
                // Reduced padding (py-3) and spacing for compact look
                className="flex-1 flex items-center justify-center gap-2 px-1 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-95"
              >
                <action.icon className={`w-4 h-4 flex-shrink-0 ${action.color}`} />
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Controls Row (Finish & Mute) */}
        {isChatting && (
          <div className="px-4 mb-2 flex justify-between items-center">
             {/* Left: Finish Button (Styled like Auto Read) */}
             <button 
                  onClick={handleFinishSession}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95 shadow-sm"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>结束并保存</span>
             </button>

             <div className="flex items-center gap-3">
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  {isSpeaking ? "正在播放..." : isListening ? "正在听..." : ""}
                </div>
                
                {/* Right: Auto Read Button */}
                <button 
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setAutoPlayAudio(!autoPlayAudio);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors border ${
                    autoPlayAudio ? 'bg-indigo-50 text-indigo-600 border-indigo-50' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {autoPlayAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  {autoPlayAudio ? '自动朗读' : '已静音'}
                </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-end gap-2">
            <div className={`flex-1 flex gap-2 items-end bg-white rounded-[24px] p-1.5 border shadow-[0_2px_15px_rgba(0,0,0,0.05)] transition-all duration-300 ${
                isListening ? 'border-red-400 ring-4 ring-red-50 shadow-red-100' : 'border-slate-200'
            }`}>
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
                placeholder={isListening ? "请说话..." : "发消息..."}
                rows={1}
                className="flex-1 bg-transparent text-base py-2 px-2 focus:outline-none max-h-24 resize-none text-slate-800 placeholder:text-slate-400"
                style={{ minHeight: '36px' }}
                />
                
                {inputValue.trim() ? (
                <button
                    onClick={() => handleSendMessage()}
                    disabled={isTyping}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    <Send className="w-4 h-4" />
                </button>
                ) : (
                <button
                    onClick={handleVoiceInput}
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm duration-200 ${
                    isListening ? 'bg-red-500 text-white scale-110 shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                    {isListening ? <div className="w-3 h-3 bg-white rounded-sm animate-pulse" /> : <Mic className="w-4 h-4" />}
                </button>
                )}
            </div>
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
      case AppMode.RADAR: return <ModuleRadar />; // Changed from ModuleCopilot
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

const MobileHeader: React.FC<{ onAvatarClick: () => void }> = ({ onAvatarClick }) => {
  const { currentMode, setMode, currentUser, messages, setMessages, currentChatTitle, setCurrentChatTitle } = useApp();

  const getHeaderConfig = () => {
    switch(currentMode) {
      case AppMode.DASHBOARD: 
        if (messages.length > 0) {
            return { 
              title: currentChatTitle || "对话", 
              showBack: true, 
              customBack: () => { 
                 setMessages([]); 
                 setCurrentChatTitle("");
                 window.speechSynthesis.cancel(); // Ensure speech stops on exit
              } 
            };
        }
        return { title: "", showBack: false, transparent: true };
        
      case AppMode.RESUME: return { title: "简历定制", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.RESUME_LIST: return { title: "我的简历", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.MATCH: return { title: "人岗匹配", showBack: true, backTo: AppMode.DASHBOARD }; // Updated Title
      case AppMode.INTERVIEW: return { title: "面试模拟", showBack: true, backTo: AppMode.DASHBOARD };
      case AppMode.RADAR: return { title: "能力雷达", showBack: true, backTo: AppMode.DASHBOARD }; // Updated title
      case AppMode.ASSETS: return { title: "我的旅途", showBack: true, backTo: AppMode.DASHBOARD };
      default: return { title: "JobMate", showBack: false };
    }
  }

  const config = getHeaderConfig();

  const handleBack = () => {
      if (config.customBack) {
          config.customBack();
      } else if (config.backTo) {
          setMode(config.backTo);
      }
  };

  return (
    <div className={`h-14 px-4 flex items-center justify-between flex-shrink-0 z-30 absolute top-0 left-0 right-0 transition-colors ${
      config.transparent ? 'bg-slate-50/90 backdrop-blur-md text-slate-900' : 'bg-white text-slate-900 border-b border-slate-100 shadow-sm sticky'
    }`}>
      <div className="flex items-center gap-2">
        {config.showBack ? (
          <button 
            onClick={handleBack}
            className="p-1.5 -ml-2 mr-1 rounded-full active:scale-90 transition-transform hover:bg-slate-100 text-slate-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
           <button 
             onClick={onAvatarClick}
             className="w-9 h-9 rounded-full bg-indigo-100 overflow-hidden border-2 border-white ring-2 ring-slate-100 shadow-sm active:scale-95 transition-transform"
           >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover bg-white" />
           </button>
        )}
        {config.showBack && <span className="font-bold text-lg tracking-tight">{config.title}</span>}
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setMode(AppMode.RESUME_LIST)}
          className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-500"
          aria-label="My Resume"
          title="我的简历"
        >
          <FileText className="w-6 h-6" />
        </button>

        <button 
          onClick={() => setMode(AppMode.ASSETS)}
          className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-500"
          aria-label="My Experience"
          title="我的经历"
        >
          <Database className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <AppProvider>
      <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
        <MobileHeader onAvatarClick={() => setUserMenuOpen(true)} />
        <MainContent />
        <UserMenu isOpen={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
      </div>
    </AppProvider>
  );
};

export default App;
