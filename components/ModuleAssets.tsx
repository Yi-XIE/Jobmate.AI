
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Zap, Search, Filter, Layers, MessageSquareQuote, ThumbsUp, AlertCircle } from 'lucide-react';

const ModuleAssets: React.FC = () => {
  const { experiences, interviewFeedbacks } = useApp();
  const [activeTab, setActiveTab] = useState<'experience' | 'feedback'>('experience');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Tab Switcher */}
      <div className="bg-white border-b border-slate-100 px-4 pt-2 sticky top-0 z-20">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('experience')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'experience' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            我的经历
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'feedback' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            面试反馈
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        
        {/* --- Experience Tab --- */}
        {activeTab === 'experience' && (
          <>
            {/* Search & Filter */}
            <div className="px-4 py-3 bg-slate-50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索 STAR 经历..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm hover:bg-slate-100 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
              {experiences.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Zap className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">经历库空空如也</p>
                  <p className="text-xs mt-1">快去首页使用“AI 挖掘”添加经历吧</p>
                </div>
              ) : (
                experiences.map(exp => (
                  <div key={exp.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-4">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{exp.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {exp.date}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                        {exp.tags.map(t => (
                           <span key={t} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] border border-slate-100 whitespace-nowrap">{t}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">S</span>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{exp.situation}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">A</span>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{exp.action}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">R</span>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{exp.result}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- Interview Feedback Tab --- */}
        {activeTab === 'feedback' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
             {interviewFeedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <MessageSquareQuote className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">暂无面试反馈</p>
                  <p className="text-xs mt-1">去参加“面试模拟”获取 AI 建议吧</p>
                </div>
              ) : (
                interviewFeedbacks.map(fb => (
                  <div key={fb.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Card Header */}
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide border ${
                            fb.type === 'behavioral' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            fb.type === 'technical' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-orange-50 text-orange-600 border-orange-100'
                          }`}>
                            {fb.type === 'behavioral' ? '行为面试' : fb.type === 'technical' ? '技术面试' : '压力面试'}
                          </span>
                          <span className="text-[10px] text-slate-400">{fb.date}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                         <span className={`text-xl font-bold ${
                           fb.score >= 80 ? 'text-emerald-600' : fb.score >= 60 ? 'text-orange-500' : 'text-red-500'
                         }`}>{fb.score}</span>
                         <span className="text-xs text-slate-300">/100</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4">
                      <p className="text-sm text-slate-700 leading-relaxed mb-4 font-medium">
                        "{fb.summary}"
                      </p>

                      <div className="space-y-3">
                        <div>
                           <h5 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-1.5">
                             <ThumbsUp className="w-3 h-3 text-emerald-500" /> 亮点
                           </h5>
                           <div className="flex flex-wrap gap-1.5">
                             {fb.strengths.map((s, i) => (
                               <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded-lg border border-emerald-100">
                                 {s}
                               </span>
                             ))}
                           </div>
                        </div>

                        <div>
                           <h5 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-1.5">
                             <AlertCircle className="w-3 h-3 text-orange-500" /> 需要改进
                           </h5>
                           <div className="space-y-1">
                             {fb.improvements.map((imp, i) => (
                               <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                 <span className="w-1 h-1 bg-orange-300 rounded-full mt-1.5 flex-shrink-0"></span>
                                 {imp}
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ModuleAssets;
