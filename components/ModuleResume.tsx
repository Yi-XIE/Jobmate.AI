import React, { useState } from 'react';
import { FileText, RefreshCw, CheckCircle, Settings2, Eye, Loader2, Target, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateResumeContent } from '../services/geminiService';
import { AppMode } from '../types';

const ModuleResume: React.FC = () => {
  const { experiences, resumeText, setResumeText, setMode } = useApp();
  const [targetRole, setTargetRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExpIds, setSelectedExpIds] = useState<Set<string>>(new Set(experiences.map(e => e.id)));
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');

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
      const newResume = `# 申请岗位：${targetRole}\n\n${newContent}`;
      setResumeText(newResume);
      setActiveTab('preview');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Mobile Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 pt-2">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            <Settings2 className="w-4 h-4" /> 定制
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            <Eye className="w-4 h-4" /> 预览
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Configuration Tab */}
        <div className={`absolute inset-0 overflow-y-auto p-4 space-y-4 transition-opacity duration-300 ${activeTab === 'config' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">1. 目标岗位 (Target Role)</h3>
            <input 
              type="text" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="例如：产品经理、数据分析师"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">2. 选择经历 (Experience Library)</h3>
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
                    <h4 className="font-medium text-slate-800 text-sm">{exp.title}</h4>
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
            className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 sticky bottom-0"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            生成专属简历
          </button>
        </div>

        {/* Preview Tab */}
        <div className={`absolute inset-0 bg-white flex flex-col transition-opacity duration-300 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <div className="flex-1 p-6 overflow-y-auto">
             <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-full resize-none outline-none text-slate-700 font-mono text-sm leading-relaxed bg-transparent"
              placeholder="生成的简历将显示在这里..."
            />
           </div>
           
           {/* Action Bar for Match */}
           <div className="p-4 border-t border-slate-100 bg-slate-50">
             <button
              onClick={() => setMode(AppMode.MATCH)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              人岗匹配检测 (Check Match)
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleResume;