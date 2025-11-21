import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeJobMatch } from '../services/geminiService';
import { MatchResult, AppMode } from '../types';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Target, AlertTriangle, CheckCircle2, Sparkles, Loader2, ArrowLeft, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const ModuleMatch: React.FC = () => {
  const { resumeText, setResumeText, savedResumes } = useApp();
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('current');

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      const jsonStr = await analyzeJobMatch(resumeText, jdText);
      // Simple cleanup if markdown code blocks are included
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
    if (id === 'current') {
        // Keep current text (or you might want to clear/reset if tracking current draft separately)
    } else {
        const selected = savedResumes.find(r => r.id === id);
        if (selected) {
            setResumeText(selected.content);
        }
    }
  };

  const chartData = result ? [
    { name: 'Match Score', uv: result.score, fill: result.score > 75 ? '#10B981' : result.score > 50 ? '#F59E0B' : '#EF4444' }
  ] : [];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto relative">
      
      <div className="p-4 space-y-4 pb-20">
        
        {/* Resume Selection */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
             <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">选择用于匹配的简历</label>
             <div className="relative">
                 <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <select 
                    value={selectedResumeId}
                    onChange={handleResumeChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none text-slate-700"
                 >
                     <option value="current">📄 当前编辑草稿</option>
                     <optgroup label="我的简历库">
                        {savedResumes.map(r => (
                            <option key={r.id} value={r.id}>{r.title} ({r.date})</option>
                        ))}
                     </optgroup>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             </div>
        </div>

        {/* Resume Context Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <button 
            onClick={() => setShowResumePreview(!showResumePreview)}
            className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              当前选中简历内容 ({resumeText.length} 字)
            </div>
            {showResumePreview ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showResumePreview && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-mono line-clamp-6 whitespace-pre-wrap">{resumeText}</p>
            </div>
          )}
        </div>

        {/* JD Input */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            粘贴职位描述 (JD)
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            placeholder="请将招聘网站上的职位详情粘贴到这里..."
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !jdText.trim()}
            className="w-full mt-3 py-3 bg-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-400" />}
            开始匹配分析
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
              <div className="z-10">
                <p className="text-sm text-slate-500 font-medium mb-1">岗位匹配度</p>
                <div className="text-4xl font-bold text-slate-800 flex items-baseline gap-1">
                  {result.score}
                  <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
                <p className={`text-xs font-bold mt-2 px-2 py-1 rounded-full inline-block ${
                  result.score > 75 ? 'bg-green-100 text-green-700' : result.score > 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {result.score > 75 ? '高度匹配' : result.score > 50 ? '中等风险' : '不匹配'}
                </p>
              </div>
              <div className="w-24 h-24 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="60%" 
                      outerRadius="100%" 
                      barSize={10} 
                      data={chartData} 
                      startAngle={90} 
                      endAngle={-270}
                    >
                      <RadialBar background dataKey="uv" cornerRadius={10} />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                   <Target className="w-6 h-6 opacity-20" />
                 </div>
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                缺失关键技能
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100">
                    {kw}
                  </span>
                ))}
                {result.missingKeywords.length === 0 && <span className="text-sm text-slate-400">未检测到明显缺失</span>}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">优化建议</h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {result.suggestions}
              </p>
            </div>

            {/* Action */}
            {result.optimizedSummary && (
              <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI 建议修改后的个人总结
                </h3>
                <div className="text-sm text-slate-700 italic bg-white/60 p-3 rounded-xl mb-3 border border-indigo-50">
                  "{result.optimizedSummary}"
                </div>
                <button 
                  onClick={() => alert('已复制优化后的内容，请返回简历编辑页面粘贴。')}
                  className="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors"
                >
                  复制优化内容
                </button>
              </div>
            )}
            
            <div className="h-4"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleMatch;