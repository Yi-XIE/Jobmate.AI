import React, { useState } from 'react';
import { RefreshCw, CheckCircle, Settings2, Eye, Loader2, Target, ChevronRight, Edit3, Save, Download, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateResumeContent } from '../services/geminiService';
import { AppMode } from '../types';

// Enhanced Simple Markdown Renderer
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  const parseInline = (text: string) => {
    // Handle bold: **text** or __text__
    // We split by the bold markers.
    // Using a simpler regex that captures the bolded text including markers
    const parts = text.split(/(\*\*.+?\*\*|__.+?__)/g);
    
    return parts.map((part, index) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };
  
  return (
    <div className="prose prose-sm max-w-none text-slate-700">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        
        // Skip empty lines in some contexts or render spacer
        if (!trimmed) {
          return <div key={index} className="h-3"></div>;
        }

        // H1
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">{parseInline(line.replace('# ', ''))}</h1>;
        }
        // H2
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-lg font-bold text-slate-800 mt-6 mb-3 flex items-center"><span className="w-1.5 h-5 bg-primary rounded-full mr-2"></span>{parseInline(line.replace('## ', ''))}</h2>;
        }
        // H3
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-base font-bold text-slate-800 mt-4 mb-2">{parseInline(line.replace('### ', ''))}</h3>;
        }
        
        // Bullet points - more robust regex for spacing
        if (/^[-*•]\s/.test(trimmed)) {
           const content = trimmed.replace(/^[-*•]\s+/, '');
           return (
             <div key={index} className="flex gap-2 text-slate-600 text-sm leading-relaxed ml-1 mb-1.5">
               <span className="text-primary/60 mt-1.5 text-[6px] flex-shrink-0">●</span>
               <span className="flex-1">{parseInline(content)}</span>
             </div>
           )
        }
        
        // Numbered lists (simple support)
        if (/^\d+\.\s/.test(trimmed)) {
            const content = trimmed.replace(/^\d+\.\s+/, '');
            const number = trimmed.match(/^\d+/)?.[0];
            return (
                <div key={index} className="flex gap-2 text-slate-600 text-sm leading-relaxed ml-1 mb-1.5">
                    <span className="text-slate-500 font-bold text-xs mt-0.5 min-w-[16px]">{number}.</span>
                    <span className="flex-1">{parseInline(content)}</span>
                </div>
            )
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
            return <hr key={index} className="my-4 border-slate-200" />;
        }

        // Plain text (potentially with inline formatting)
        return <p key={index} className="text-slate-600 text-sm mb-1.5 leading-relaxed">{parseInline(line)}</p>;
      })}
    </div>
  );
};

const SaveSuccessModal: React.FC<{ onClose: () => void, onView: () => void }> = ({ onClose, onView }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-slate-100">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-green-50/50">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 mb-2">保存成功</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed px-2">
          您的简历已安全保存至云端。<br/>
          请前往 <span className="font-bold text-slate-700">“我的简历”</span> 列表查看或管理。
        </p>
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={onView}
            className="w-full py-3 bg-primary text-white text-sm rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            前往我的简历
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-50 text-slate-600 text-sm rounded-xl font-bold hover:bg-slate-100 transition-colors active:scale-95"
          >
            继续编辑
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ModuleResume: React.FC = () => {
  const { experiences, resumeText, setResumeText, setMode, saveCurrentResume } = useApp();
  const [targetRole, setTargetRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExpIds, setSelectedExpIds] = useState<Set<string>>(new Set(experiences.map(e => e.id)));
  const [activeTab, setActiveTab] = useState<'config' | 'editor' | 'preview'>('config');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const toggleExp = (id: string) => {
    const newSet = new Set(selectedExpIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedExpIds(newSet);
  };

  const handleGenerate = async () => {
    if (!targetRole) return alert("请输入目标岗位");
    setIsGenerating(true);
    try {
      const activeExps = experiences.filter(e => selectedExpIds.has(e.id));
      const newContent = await generateResumeContent(activeExps, targetRole);
      // Ensure we have a clean markdown format
      const newResume = `# 申请岗位：${targetRole}\n\n${newContent}`;
      setResumeText(newResume);
      setActiveTab('preview');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    saveCurrentResume();
    setShowSaveModal(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Save Success Modal Overlay */}
      {showSaveModal && (
        <SaveSuccessModal 
          onClose={() => setShowSaveModal(false)} 
          onView={() => { setShowSaveModal(false); setMode(AppMode.RESUME_LIST); }} 
        />
      )}

      {/* Top Bar with Tabs & Actions */}
      <div className="bg-white border-b border-slate-200 px-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex gap-6 pt-2">
          <button 
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <Settings2 className="w-4 h-4" /> 定制
          </button>
          <button 
            onClick={() => setActiveTab('editor')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'editor' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <Edit3 className="w-4 h-4" /> 编辑
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <Eye className="w-4 h-4" /> 预览
          </button>
        </div>

        {(activeTab === 'editor' || activeTab === 'preview') && (
           <button 
             onClick={handleSave}
             className="mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 active:scale-95"
           >
             <Save className="w-3 h-3" /> 保存
           </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        
        {/* --- 1. Configuration Tab --- */}
        <div className={`absolute inset-0 overflow-y-auto p-4 space-y-4 transition-opacity duration-300 ${activeTab === 'config' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">1. 目标岗位 (Target Role)</h3>
            <input 
              type="text" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="例如：产品经理、数据分析师"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">2. 选择经历 (Experience Library)</h3>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div 
                  key={exp.id}
                  onClick={() => toggleExp(exp.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedExpIds.has(exp.id) 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/50' 
                    : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">{exp.title}</h4>
                    {selectedExpIds.has(exp.id) && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{exp.situation} {exp.action}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            生成专属简历
          </button>
        </div>

        {/* --- 2. Editor Tab (Markdown) --- */}
        <div className={`absolute inset-0 bg-white flex flex-col transition-opacity duration-300 ${activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <div className="flex-1 p-4 overflow-hidden">
             <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-full resize-none outline-none text-slate-700 font-mono text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              placeholder="# 简历标题..."
            />
           </div>
           <div className="px-4 pb-4 text-center text-xs text-slate-400">
             支持 Markdown 语法编辑 (使用 **加粗**)
           </div>
        </div>

        {/* --- 3. Preview Tab (Rendered) --- */}
        <div className={`absolute inset-0 bg-white flex flex-col transition-opacity duration-300 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
             <div className="max-w-2xl mx-auto bg-white min-h-[800px] shadow-sm border border-slate-100 p-8 rounded-sm">
                <SimpleMarkdownRenderer content={resumeText} />
             </div>
           </div>
           
           {/* Action Bar for Match */}
           <div className="p-4 border-t border-slate-100 bg-white flex gap-3 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-10">
             <button className="flex-1 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50">
               <Download className="w-4 h-4" /> 导出 PDF
             </button>
             <button
              onClick={() => setMode(AppMode.MATCH)}
              className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              去检测 (Check Match)
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ModuleResume;