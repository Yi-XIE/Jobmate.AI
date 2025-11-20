import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Clock, ChevronRight, FileCode } from 'lucide-react';

const ModuleResumeList: React.FC = () => {
  const { savedResumes, loadResume } = useApp();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Context */}
      <div className="px-6 py-4 bg-white border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">我的简历库</h2>
        <p className="text-sm text-slate-500 mt-1">AI 自动生成并优化的历史版本</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {savedResumes.map((resume) => (
          <button
            key={resume.id}
            onClick={() => loadResume(resume.id)}
            className="w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors"></div>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-primary transition-colors">
                    {resume.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Clock className="w-3 h-3" />
                    {resume.date}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 pr-4">
                    {resume.preview}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all mt-3" />
            </div>
          </button>
        ))}
        
        <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs text-slate-400">
                <FileCode className="w-3 h-3" />
                仅展示最近 30 天的生成记录
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleResumeList;