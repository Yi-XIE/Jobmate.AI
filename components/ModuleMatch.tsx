
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeJobMatch } from '../services/geminiService';
import { MatchResult } from '../types';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Target, AlertTriangle, CheckCircle2, Sparkles, Loader2, ChevronDown, FileText, ArrowRight, RotateCcw, Copy, Briefcase } from 'lucide-react';

const ModuleMatch: React.FC = () => {
  const { resumeText, setResumeText, savedResumes } = useApp();
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('current');
  const [inputStep, setInputStep] = useState(1); // 1: Inputs, 2: Analyzing (handled by loading), 3: Results (handled by result != null)

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      const jsonStr = await analyzeJobMatch(resumeText, jdText);
      const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '');
      setResult(JSON.parse(cleanJson));
    } catch (e) {
      console.error("Parsing error", e);
      alert("AI 分析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    if (id !== 'current') {
        const selected = savedResumes.find(r => r.id === id);
        if (selected) setResumeText(selected.content);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setInputStep(1);
  };

  // --- Render Results View ---
  if (result) {
     const chartData = [{ name: 'Match Score', uv: result.score, fill: result.score > 75 ? '#10B981' : result.score > 50 ? '#F59E0B' : '#EF4444' }];
     
     return (
       <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
         {/* Results Header with Score */}
         <div className="bg-white px-6 py-8 rounded-b-[32px] border-b border-slate-100 shadow-sm relative z-10 flex flex-col items-center">
             <div className="relative w-32 h-32 mb-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={chartData} startAngle={90} endAngle={-270}>
                      <RadialBar background dataKey="uv" cornerRadius={10} />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className={`text-4xl font-extrabold ${result.score > 75 ? 'text-emerald-500' : result.score > 50 ? 'text-orange-500' : 'text-red-500'}`}>
                     {result.score}
                   </span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">匹配度</span>
                 </div>
             </div>
             
             <div className="text-center max-w-xs">
                <h2 className="text-lg font-bold text-slate-800">
                  {result.score > 85 ? '非常匹配！' : result.score > 60 ? '尚有潜力' : '匹配度较低'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                   {result.score > 85 ? '你的简历与该岗位契合度很高，建议立即投递。' : '建议根据下方的 AI 建议进行针对性优化后再投递。'}
                </p>
             </div>
         </div>

         {/* Detailed Analysis Cards */}
         <div className="p-4 space-y-4 -mt-4 pt-8 relative z-0">
             
             {/* 1. Missing Keywords */}
             <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                       <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">缺失技能 / 关键词</h3>
                 </div>
                 {result.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                       {result.missingKeywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                             {kw}
                          </span>
                       ))}
                    </div>
                 ) : (
                    <p className="text-xs text-slate-400 italic">未检测到明显缺失的关键技能，太棒了！</p>
                 )}
             </div>

             {/* 2. Strengths */}
             <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">简历亮点</h3>
                 </div>
                 <ul className="space-y-2">
                    {result.strengths.map((str, i) => (
                       <li key={i} className="flex gap-2 text-xs text-slate-600">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                          <span className="leading-relaxed">{str}</span>
                       </li>
                    ))}
                 </ul>
             </div>

             {/* 3. Optimization Advice */}
             <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                       <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-bold text-indigo-900">AI 优化建议</h3>
                 </div>
                 <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                    {result.suggestions.split('\n').map((line, i) => (
                       <p key={i}>{line}</p>
                    ))}
                 </div>
             </div>
            
             {/* 4. Optimized Summary */}
             {result.optimizedSummary && (
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-900/20">
                   <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                         <Target className="w-4 h-4 text-yellow-400" />
                         推荐个人总结
                      </h3>
                      <button 
                         onClick={() => { navigator.clipboard.writeText(result.optimizedSummary || ''); alert('已复制'); }}
                         className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                         <Copy className="w-3.5 h-3.5" />
                      </button>
                   </div>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
                      {result.optimizedSummary}
                   </div>
                </div>
             )}

             <button 
                onClick={resetAnalysis}
                className="w-full py-4 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 hover:text-slate-700 transition-colors"
             >
                <RotateCcw className="w-4 h-4" /> 开始新的分析
             </button>
         </div>
       </div>
     );
  }

  // --- Render Input View ---
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
       {/* Hero / Header */}
       <div className="px-6 py-8 bg-white border-b border-slate-100 mb-6">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-orange-500">
             <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">人岗匹配检测</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
             将你的简历与目标职位描述 (JD) 进行 AI 对比，找出差距，获取提升匹配度的具体修改建议。
          </p>
       </div>
       
       <div className="px-4 pb-20 space-y-4">
          
          {/* Step 1: Resume */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
             <label className="flex items-center justify-between text-sm font-bold text-slate-800 mb-4">
                <span className="flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">1</span>
                   选择简历
                </span>
                <span className="text-xs text-indigo-600 font-medium">预览内容</span>
             </label>
             
             <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                 </div>
                 <select 
                    value={selectedResumeId}
                    onChange={handleResumeChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none appearance-none font-medium"
                 >
                     <option value="current">📄 当前编辑草稿</option>
                     {savedResumes.map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.date})</option>
                     ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             </div>
             {resumeText.length > 0 && (
                <div className="mt-3 text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                   {resumeText}
                </div>
             )}
          </div>

          {/* Step 2: JD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
             <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">2</span>
                粘贴职位描述 (JD)
             </label>
             <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed outline-none resize-none placeholder:text-slate-400"
                placeholder="请将招聘网站上的“职位详情”或“任职要求”完整粘贴到这里..."
             />
          </div>

          {/* Action */}
          <button
             onClick={handleAnalyze}
             disabled={loading || !jdText.trim()}
             className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-400" />}
             {loading ? 'AI 正在分析差距...' : '开始匹配分析'}
             {!loading && <ArrowRight className="w-4 h-4 opacity-50" />}
          </button>

       </div>
    </div>
  );
};

export default ModuleMatch;
