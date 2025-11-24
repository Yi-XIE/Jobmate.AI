
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Zap, Search, Filter, Layers, MessageSquareQuote, ThumbsUp, AlertCircle, Sparkles, Loader2, Briefcase, GraduationCap, ChevronRight, ArrowLeft, ArrowUpDown, Check, Clock, RotateCcw, X } from 'lucide-react';
import { generateFeedbackAnalysis } from '../services/geminiService';

const ModuleAssets: React.FC = () => {
  const { experiences, interviewFeedbacks } = useApp();
  const [activeTab, setActiveTab] = useState<'experience' | 'feedback'>('experience');
  
  // State for AI Analysis
  const [analysisMap, setAnalysisMap] = useState<Record<string, string>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Detail View State
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);

  // --- Filtering & Sorting State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'recent'>('recent');

  // --- Derived Data ---

  // 1. Get Unique Tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    experiences.forEach(exp => exp.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [experiences]);

  // 2. Filter & Sort Experiences
  const processedExperiences = useMemo(() => {
    let result = [...experiences];

    // Search
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(lowerTerm) || 
        e.situation.toLowerCase().includes(lowerTerm)
      );
    }

    // Tag Filter
    if (selectedTags.length > 0) {
      result = result.filter(e => e.tags.some(t => selectedTags.includes(t)));
    }

    // Sorting
    if (sortOrder === 'date-desc') {
       // Sort by Date Descending (Newest first)
       result.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortOrder === 'date-asc') {
       // Sort by Date Ascending (Oldest first)
       result.sort((a, b) => a.date.localeCompare(b.date));
    } else {
       // 'recent' - assumes the array order in context is "most recently added/edited" at the top
    }

    return result;
  }, [experiences, searchTerm, selectedTags, sortOrder]);

  const handleAnalyzeFeedback = async (fb: any) => {
    if (analysisMap[fb.id]) return; // Already generated
    
    setAnalyzingId(fb.id);
    try {
      const analysis = await generateFeedbackAnalysis(fb);
      setAnalysisMap(prev => ({ ...prev, [fb.id]: analysis }));
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const selectedExp = experiences.find(e => e.id === selectedExpId);

  // --- Detail View Render ---
  if (selectedExp) {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
            <button 
              onClick={() => setSelectedExpId(null)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-slate-800">经历详情</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 pb-20">
            {/* Header Info */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                     {selectedExp.type === 'work' ? (
                       <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
                         <Briefcase className="w-3.5 h-3.5" /> 职场经历
                       </span>
                     ) : (
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
                         <GraduationCap className="w-3.5 h-3.5" /> 校园经历
                       </span>
                     )}
                     <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {selectedExp.date}
                     </span>
                </div>
                
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight mb-4">{selectedExp.title}</h1>
                
                <div className="flex flex-wrap gap-2">
                    {selectedExp.tags.map(t => (
                       <span key={t} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
                         #{t}
                       </span>
                    ))}
                </div>
            </div>

            {/* STAR Content Timeline */}
            <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-4 bottom-8 w-0.5 bg-slate-200"></div>

                {[
                    { label: 'Situation', title: '情境背景', content: selectedExp.situation, color: 'bg-blue-500', ring: 'ring-blue-100', icon: 'S' },
                    { label: 'Task', title: '任务挑战', content: selectedExp.task, color: 'bg-indigo-500', ring: 'ring-indigo-100', icon: 'T' },
                    { label: 'Action', title: '关键行动', content: selectedExp.action, color: 'bg-purple-500', ring: 'ring-purple-100', icon: 'A' },
                    { label: 'Result', title: '最终结果', content: selectedExp.result, color: 'bg-emerald-500', ring: 'ring-emerald-100', icon: 'R' }
                ].map((item, idx) => (
                    <div key={idx} className="relative pl-12 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-md ring-4 ring-white z-10`}>
                            {item.icon}
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide flex items-center gap-2">
                              {item.title}
                              <span className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-300 font-normal tracking-normal">{item.label}</span>
                            </h3>
                            <p className="text-[15px] leading-7 text-slate-700 whitespace-pre-line">{item.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
               <p className="text-xs text-slate-400">已保存至您的个人经历库</p>
            </div>
        </div>
      </div>
    );
  }

  // --- Toolbar Component (Extracted to prevent overflow clipping) ---
  const ExperienceToolbar = () => (
    <div className="px-4 py-3 bg-slate-50 flex items-center gap-2 z-30 relative shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
        {/* Search */}
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索 STAR 经历..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
        </div>
              
        {/* Filter Button */}
        <div className="relative">
            <button 
                onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                className={`p-2 rounded-xl border shadow-sm transition-colors flex items-center gap-1.5 ${
                selectedTags.length > 0 || showFilterMenu 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
            >
                <Filter className="w-4 h-4" />
                {selectedTags.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {selectedTags.length}
                </span>
                )}
            </button>

            {/* Filter Dropdown */}
            {showFilterMenu && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-700">标签筛选</h4>
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium">
                        清空
                        </button>
                    )}
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {allTags.map(tag => (
                        <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                            selectedTags.includes(tag)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'
                        }`}
                        >
                        {tag}
                        </button>
                    ))}
                    </div>
                </div>
                </>
            )}
        </div>

        {/* Sort Button */}
        <div className="relative">
            <button 
                onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                className={`p-2 rounded-xl border shadow-sm transition-colors ${
                showSortMenu ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
            >
                <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Sort Dropdown */}
            {showSortMenu && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50 border-b border-slate-50">
                    排序方式
                    </div>
                    {[
                    { id: 'recent', label: '最近编辑', icon: RotateCcw },
                    { id: 'date-desc', label: '时间倒序 (最新)', icon: Clock },
                    { id: 'date-asc', label: '时间正序 (最旧)', icon: Clock }
                    ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => { setSortOrder(opt.id as any); setShowSortMenu(false); }}
                        className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        sortOrder === opt.id ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <opt.icon className="w-3.5 h-3.5 opacity-70" />
                            {opt.label}
                        </div>
                        {sortOrder === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                    ))}
                </div>
                </>
            )}
        </div>
    </div>
  );

  // --- Main List Render ---
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

      {/* Toolbar Area (Moved outside of overflow-hidden container to prevent clipping) */}
      {activeTab === 'experience' && <ExperienceToolbar />}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-0">
        
        {/* --- Experience Tab --- */}
        {activeTab === 'experience' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
              {processedExperiences.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Zap className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">没有找到匹配的经历</p>
                  <p className="text-xs mt-1">尝试更换筛选条件</p>
                </div>
              ) : (
                processedExperiences.map(exp => {
                  const isWork = exp.type === 'work';
                  return (
                    <div 
                      key={exp.id}
                      onClick={() => setSelectedExpId(exp.id)}
                      className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer active:scale-[0.99] ${
                        isWork ? 'bg-indigo-50/40 border-indigo-100' : 'bg-white border-slate-100'
                      }`}
                    >
                      {/* Decoration for work items */}
                      {isWork && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-100 to-transparent opacity-50 rounded-bl-3xl -mr-4 -mt-4 pointer-events-none"></div>}

                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                             {isWork ? (
                               <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded flex items-center gap-1">
                                 <Briefcase className="w-3 h-3" /> 职场经历
                               </span>
                             ) : (
                               <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded flex items-center gap-1">
                                 <GraduationCap className="w-3 h-3" /> 校园经历
                               </span>
                             )}
                          </div>
                          <h4 className={`font-bold text-sm mb-1 transition-colors ${
                            isWork ? 'text-indigo-900 group-hover:text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'
                          }`}>{exp.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {exp.date}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isWork ? 'text-indigo-300' : 'text-slate-300'}`} />
                           <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                            {exp.tags.slice(0, 2).map(t => (
                                <span key={t} className={`px-1.5 py-0.5 rounded-md text-[10px] border whitespace-nowrap ${
                                isWork ? 'bg-indigo-100/50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>{t}</span>
                            ))}
                            {exp.tags.length > 2 && <span className="text-[10px] text-slate-400">+{exp.tags.length - 2}</span>}
                           </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-3 relative z-10">
                        <div className="flex gap-2 items-start">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                            isWork ? 'text-indigo-500 bg-indigo-100' : 'text-slate-400 bg-slate-100'
                          }`}>S</span>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-1">{exp.situation}</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                            isWork ? 'text-indigo-500 bg-indigo-100' : 'text-slate-400 bg-slate-100'
                          }`}>A</span>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-1">{exp.action}</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                            isWork ? 'text-indigo-500 bg-indigo-100' : 'text-slate-400 bg-slate-100'
                          }`}>R</span>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-1">{exp.result}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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

                      {/* AI Analysis Section */}
                      <div className="mt-5 border-t border-slate-100 pt-4">
                          {!analysisMap[fb.id] ? (
                            <button 
                              onClick={() => handleAnalyzeFeedback(fb)}
                              disabled={analyzingId === fb.id}
                              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-indigo-100 shadow-sm"
                            >
                              {analyzingId === fb.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 fill-current" />}
                              生成 AI 深度点评
                            </button>
                          ) : (
                            <div className="bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                              <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1 bg-indigo-100 rounded-full">
                                    <Sparkles className="w-3 h-3 text-indigo-600 fill-current" />
                                  </div>
                                  <span className="text-xs font-bold text-indigo-900">AI 深度点评报告</span>
                              </div>
                              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-1">
                                {analysisMap[fb.id]}
                              </div>
                            </div>
                          )}
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
