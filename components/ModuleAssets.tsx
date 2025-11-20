import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Zap, Search, Filter, Award, BarChart3 } from 'lucide-react';

const ModuleAssets: React.FC = () => {
  const { experiences } = useApp();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Stats Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col items-center gap-1 flex-1 border-r border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-blue-500" />
              我的经历
            </div>
            <span className="text-2xl font-bold text-slate-800">{experiences.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              平均竞争力
            </div>
            <span className="text-2xl font-bold text-slate-800">72%</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 py-3 bg-slate-50/50 flex items-center gap-3 sticky top-0 z-10 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索经历..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Zap className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">经历库空空如也</p>
            <p className="text-xs mt-1">快去首页使用“AI 挖掘”添加经历吧</p>
          </div>
        ) : (
          experiences.map(exp => (
            <div key={exp.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{exp.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {exp.date}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                  {exp.tags.map(t => (
                     <span key={t} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] border border-indigo-100 whitespace-nowrap">{t}</span>
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
        <div className="h-6" />
      </div>
    </div>
  );
};

export default ModuleAssets;