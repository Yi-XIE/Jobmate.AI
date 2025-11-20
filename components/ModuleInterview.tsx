import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MessageSquare, Sparkles } from 'lucide-react';
import { getInterviewerResponse } from '../services/geminiService';

const ModuleInterview: React.FC = () => {
  const [active, setActive] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [transcript, setTranscript] = useState<{role: string, content: string}[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<'behavioral' | 'technical' | 'pressure'>('behavioral');

  const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

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

  const startInterview = () => {
    setActive(true);
    setStatus('speaking');
    const intro = "你好，我是你的面试官。感谢你今天的参与。请先做一个简短的自我介绍吧。";
    setTranscript([{ role: 'interviewer', content: intro }]);
    speak(intro);
  };

  const stopInterview = () => {
    setActive(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.onend = () => {
      setStatus('listening');
      startListening();
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
      
      const newTranscript = [...transcript, { role: 'candidate', content: text }];
      setTranscript(newTranscript);
      
      try {
        const response = await getInterviewerResponse(newTranscript, text, mode);
        setTranscript(prev => [...prev, { role: 'interviewer', content: response }]);
        setStatus('speaking');
        speak(response);
      } catch (e) {
        console.error(e);
        setStatus('idle');
      }
    };

    recognition.start();
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 rounded-none relative overflow-hidden">
      {/* Main Stage */}
      <div className="flex-1 relative flex flex-col">
        
        {/* AI Interviewer Area */}
        <div className="flex-1 flex items-center justify-center bg-white relative">
           {/* Background decorative elements */}
           <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

           {!active ? (
             <div className="text-center space-y-8 px-6 max-w-sm mx-auto relative z-10">
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
             <div className="w-full h-full flex flex-col items-center pt-16 px-6 relative z-10">
                {/* Avatar */}
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-500 ${
                      status === 'speaking' ? 'border-green-500 scale-110 shadow-green-200' : 'border-white'
                    }`}>
                      <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Interviewer&backgroundColor=f8fafc" className="w-full h-full object-cover bg-slate-100" alt="AI" />
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white ${
                        status === 'speaking' ? 'bg-green-500 text-white' : 
                        status === 'listening' ? 'bg-blue-500 text-white' : 
                        'bg-slate-800 text-white'
                    }`}>
                        {status === 'speaking' ? 'Speaking' : status === 'listening' ? 'Listening' : 'Thinking'}
                    </div>
                </div>
                
                <div className="mt-8 text-center max-w-xs">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">AI 面试官</h3>
                  <p className="text-xs text-slate-400">正在进行：{mode === 'behavioral' ? '行为面试' : mode === 'technical' ? '技术面试' : '压力面试'}</p>
                </div>
                
                {/* Transcript Bubble */}
                <div className="mt-auto mb-8 w-full max-w-sm">
                  <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 text-center">
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">
                      "{transcript.length > 0 ? transcript[transcript.length - 1].content : '...'}"
                    </p>
                  </div>
                </div>
             </div>
           )}
        </div>

        {/* User Camera Pip */}
        {active && (
          <div className="absolute top-4 right-4 w-24 h-32 bg-slate-200 rounded-xl overflow-hidden shadow-xl border-2 border-white z-20">
            {cameraOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                <VideoOff className="w-8 h-8 opacity-50" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      {active && (
        <div className="bg-white border-t border-slate-100 pb-safe pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
          <div className="flex items-center justify-between max-w-xs mx-auto">
             <button 
              onClick={() => setMicOn(!micOn)}
              className={`p-4 rounded-full transition-all shadow-sm ${micOn ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-500'}`}
            >
              {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={stopInterview}
              className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/30 active:scale-95 transition-transform"
            >
              <PhoneOff className="w-8 h-8 fill-current" />
            </button>

            <button 
              onClick={() => setCameraOn(!cameraOn)}
              className={`p-4 rounded-full transition-all shadow-sm ${cameraOn ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-500'}`}
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