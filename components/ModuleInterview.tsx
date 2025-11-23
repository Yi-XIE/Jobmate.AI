import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MessageSquare, Sparkles, X, User, Bot, Lightbulb } from 'lucide-react';
import { getInterviewerResponse, getInterviewHint } from '../services/geminiService';

const ModuleInterview: React.FC = () => {
  const [active, setActive] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [transcript, setTranscript] = useState<{role: string, content: string}[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [mode, setMode] = useState<'behavioral' | 'technical' | 'pressure'>('behavioral');
  const [showHistory, setShowHistory] = useState(false);
  
  // Practice Mode State
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [hint, setHint] = useState('');
  // Ref to track latest practice mode state in callbacks
  const isPracticeModeRef = useRef(isPracticeMode);

  const videoRef = useRef<HTMLVideoElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  useEffect(() => {
    isPracticeModeRef.current = isPracticeMode;
  }, [isPracticeMode]);

  // Camera handling
  useEffect(() => {
    if (cameraOn && active) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera error", err));
    } else {
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [cameraOn, active]);

  // Scroll to bottom of history when it changes or opens
  useEffect(() => {
    if (showHistory && historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, showHistory]);

  const startInterview = () => {
    setActive(true);
    setStatus('speaking');
    const intro = "你好，我是你的面试官。感谢你今天的参与。请先做一个简短的自我介绍吧。";
    setTranscript([{ role: 'interviewer', content: intro }]);
    speak(intro);
  };

  const stopInterview = () => {
    setActive(false);
    setShowHistory(false);
    setHint('');
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    
    utterance.onend = () => {
      setStatus('listening');
      startListening();
      
      // Hint Logic: If in practice mode, generate hint for the question just asked
      if (active && isPracticeModeRef.current) {
         setHint('AI 正在思考回答提示...');
         getInterviewHint(text).then(h => {
             // Only set if we are still waiting
             setHint(h);
         }).catch(() => setHint(''));
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!Recognition) {
      alert("当前浏览器不支持语音识别，请使用 Chrome。");
      return;
    }
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.lang = 'zh-CN';
    
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setStatus('thinking');
      setHint(''); // Clear hint when user starts/finishes answering
      
      const newTranscript = [...transcript, { role: 'candidate', content: text }];
      setTranscript(newTranscript);
      
      try {
        const response = await getInterviewerResponse(newTranscript, text, mode);
        const updatedTranscript = [...newTranscript, { role: 'interviewer', content: response }];
        setTranscript(updatedTranscript);
        setStatus('speaking');
        speak(response);
      } catch (e) {
        console.error(e);
        setStatus('idle');
      }
    };
    
    recognition.onend = () => {
       if (status === 'listening') {
           // Optional: restart listening if silence? 
       }
    };

    recognition.start();
  };

  const lastInterviewerMessage = [...transcript].reverse().find(t => t.role === 'interviewer');

  return (
    <div className="h-full flex flex-col bg-slate-50 rounded-none relative overflow-hidden">
      {/* Main Stage */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-white">
        
        {/* AI Interviewer Area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
           {/* Background decorative elements */}
           <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

           {!active ? (
             <div className="text-center space-y-8 px-6 max-w-sm mx-auto relative z-10 overflow-y-auto max-h-full py-8 no-scrollbar">
               <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-200 transform rotate-3">
                 <VideoIcon className="w-10 h-10 text-white" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">沉浸式面试陪练</h2>
                 <p className="text-slate-500 text-sm leading-relaxed">
                   AI 将模拟真实面试场景，分析你的微表情与回答逻辑。请选择面试模式：
                 </p>
               </div>
               
               <div className="grid grid-cols-1 gap-3">
                 {[
                   {id: 'behavioral', label: '行为面试 (宝洁八大问)', desc: '考察软素质与领导力'}, 
                   {id: 'technical', label: '技术面试 (Hard Skills)', desc: '考察专业深度'}, 
                   {id: 'pressure', label: '压力面试 (高强度)', desc: '考察抗压与临场反应'}
                  ].map((m) => (
                   <button
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${
                      mode === m.id 
                      ? 'bg-white border-primary ring-2 ring-primary/10 shadow-md' 
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                   >
                     <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold text-sm ${mode === m.id ? 'text-primary' : 'text-slate-700'}`}>{m.label}</span>
                        {mode === m.id && <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm"></div>}
                     </div>
                     <p className="text-xs text-slate-400">{m.desc}</p>
                   </button>
                 ))}
               </div>

               <button 
                onClick={startInterview}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
               >
                 <Sparkles className="w-5 h-5 text-yellow-300 fill-current" />
                 开始全真模拟
               </button>
             </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center pt-20 px-6 relative z-10">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className={`w-32 h-32 rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-500 ${
                      status === 'speaking' ? 'border-green-500 scale-110 shadow-green-200' : 'border-white'
                    }`}>
                      <img src="https://avatar.iran.liara.run/public/girl?username=Sophia" className="w-full h-full object-cover bg-slate-100" alt="AI Interviewer" />
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white ${
                        status === 'speaking' ? 'bg-green-500 text-white' : 
                        status === 'listening' ? 'bg-blue-50 text-white' : 
                        'bg-slate-800 text-white'
                    }`}>
                        {status === 'speaking' ? 'Speaking' : status === 'listening' ? 'Listening' : 'Thinking'}
                    </div>
                </div>
                
                <div className="mt-4 text-center max-w-xs flex-shrink-0">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">AI 面试官 (Sophia)</h3>
                  <p className="text-xs text-slate-400">正在进行：{mode === 'behavioral' ? '行为面试' : mode === 'technical' ? '技术面试' : '压力面试'}</p>
                </div>

                {/* Latest Question Bubble - Moved higher */}
                <div className="flex-1 w-full max-w-sm mt-4 flex flex-col items-center justify-start relative">
                  {lastInterviewerMessage ? (
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full relative animate-in fade-in slide-in-from-bottom-4 group">
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-600 px-3 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wide border border-white shadow-sm">
                              提问
                         </div>
                         <p className="text-slate-700 text-left text-base font-medium leading-relaxed mt-2">
                              "{lastInterviewerMessage.content}"
                         </p>
                         
                          <button 
                              onClick={() => setShowHistory(true)}
                              className="mx-auto mt-4 flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-500 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              查看对话记录
                          </button>
                    </div>
                  ) : (
                    <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl h-24 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                           <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                           等待提问...
                        </div>
                    </div>
                  )}

                  {/* Hint Card (When in Practice Mode and Waiting) */}
                  {active && isPracticeMode && hint && (
                    <div className="mt-3 w-full bg-yellow-50 border border-yellow-200 p-3 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2 shadow-sm">
                       <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                       <div>
                         <span className="text-xs font-bold text-yellow-700 block mb-1">面试小锦囊</span>
                         <p className="text-xs text-yellow-800 leading-relaxed">
                             {hint === 'AI 正在思考回答提示...' ? <span className="animate-pulse">AI 正在思考回答思路...</span> : hint}
                         </p>
                       </div>
                    </div>
                  )}

                  {/* Practice Mode Toggle */}
                  <div className="mt-4 flex items-center justify-center w-full">
                    <button 
                      onClick={() => {
                        const newMode = !isPracticeMode;
                        setIsPracticeMode(newMode);
                        // If toggling on while listening, trigger hint immediately
                        if (newMode && status === 'listening' && lastInterviewerMessage) {
                             setHint('AI 正在思考回答提示...');
                             getInterviewHint(lastInterviewerMessage.content).then(h => setHint(h));
                        } else {
                            if (!newMode) setHint('');
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm ${
                        isPracticeMode 
                          ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' 
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isPracticeMode ? 'fill-indigo-300' : 'text-slate-400'}`} />
                      {isPracticeMode ? '练习模式已开启' : '开启练习模式'}
                    </button>
                  </div>

                </div>
             </div>
           )}

            {/* Full History Overlay */}
            {active && showHistory && (
              <div className="absolute inset-0 z-40 bg-slate-50/95 backdrop-blur-lg flex flex-col animate-in slide-in-from-bottom-full duration-300">
                 <div className="px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center flex-shrink-0">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      面试记录
                    </h3>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {transcript.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'candidate' ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-center gap-2 mb-1">
                              {msg.role === 'interviewer' && (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <Bot className="w-3 h-3 text-indigo-600" />
                                </div>
                              )}
                              <span className="text-[10px] text-slate-400 font-medium">
                                {msg.role === 'candidate' ? '我' : '面试官'}
                              </span>
                              {msg.role === 'candidate' && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                  <User className="w-3 h-3 text-slate-500" />
                                </div>
                              )}
                           </div>
                           <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                             msg.role === 'candidate' 
                             ? 'bg-indigo-600 text-white rounded-tr-sm' 
                             : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                           }`}>
                             {msg.content}
                           </div>
                        </div>
                      </div>
                    ))}
                    <div ref={historyEndRef} />
                 </div>
              </div>
            )}
        </div>

        {/* User Camera Pip */}
        {active && (
          <div className={`absolute top-4 right-4 w-24 h-32 bg-slate-900 rounded-xl overflow-hidden shadow-xl border-2 border-white z-30 transition-all duration-300 ${showHistory ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {cameraOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                <VideoOff className="w-8 h-8" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      {active && (
        <div className="bg-white border-t border-slate-100 pb-6 pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex-shrink-0 relative">
          <div className="flex items-center justify-between max-w-xs mx-auto">
             <button 
              onClick={() => setMicOn(!micOn)}
              className={`p-3.5 rounded-full transition-all shadow-sm ${micOn ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-500'}`}
            >
              {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={stopInterview}
              className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/30 active:scale-95 transition-transform"
            >
              <PhoneOff className="w-7 h-7 fill-current" />
            </button>

            <button 
              onClick={() => setCameraOn(!cameraOn)}
              className={`p-3.5 rounded-full transition-all shadow-sm ${cameraOn ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-500'}`}
            >
              {cameraOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleInterview;