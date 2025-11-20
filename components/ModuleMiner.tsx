import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Save, Bot } from 'lucide-react';
import { createMiningChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import { useApp } from '../context/AppContext';
import { AppMode } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ModuleMiner: React.FC = () => {
  const { addExperience, setMode } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'model', text: "你好！我是你的职场伴侣。最近有什么有趣的项目、社团活动，或者让你觉得棘手的事情吗？跟我说说，我帮你挖掘简历亮点。" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createMiningChat();
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
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
      console.error("Mining error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveAsset = () => {
    const newExp = {
      id: Date.now().toString(),
      title: '近期对话挖掘',
      date: new Date().toISOString().slice(0, 7),
      situation: '通过 AI 聊天挖掘',
      task: '从对话中提取',
      action: '待进一步润色',
      result: '待量化',
      tags: ['沟通能力', '待审核']
    };
    addExperience(newExp);
    alert("经历草稿已保存到知识库！");
    setMode(AppMode.DASHBOARD); // Return to dashboard after saving
  };

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden relative">
      <div className="p-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI 正在引导挖掘...</span>
        </div>
        <button 
          onClick={handleSaveAsset}
          className="px-4 py-1.5 text-xs bg-secondary text-white hover:bg-secondary/90 rounded-full font-medium flex items-center gap-1 transition-colors shadow-sm shadow-secondary/20"
        >
          <Save className="w-3 h-3" />
          保存到资产库
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-primary to-indigo-600' : 'bg-white border border-slate-100'}`}>
                {msg.role === 'user' ? <span className="text-white text-xs font-bold">我</span> : <Bot className="text-secondary w-5 h-5" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-sm' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center">
                <Bot className="text-secondary w-5 h-5" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
             </div>
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      <div className="p-3 bg-white border-t border-slate-100 safe-pb">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="描述你的经历..."
            className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border-transparent transition-all"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
            className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleMiner;