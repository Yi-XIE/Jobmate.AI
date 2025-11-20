import React, { useState } from 'react';
import { Plus, Clipboard, Send, Check, Trash2 } from 'lucide-react';
import { generateWeeklyReport } from '../services/geminiService';

const ModuleCopilot: React.FC = () => {
  const [tasks, setTasks] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const addTask = () => {
    if (currentTask.trim()) {
      setTasks([...tasks, currentTask]);
      setCurrentTask('');
    }
  };

  const handleGenerate = async () => {
    if (tasks.length === 0) return;
    setLoading(true);
    try {
      const result = await generateWeeklyReport(tasks);
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {!report ? (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-800 mb-1">周报生成器</h2>
            <p className="text-xs text-slate-500 mb-4">输入本周的流水账，我来帮你生成专业周报。</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="例如：修复了登录接口的 Bug..."
                className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm"
              />
              <button 
                onClick={addTask}
                className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 px-1 pb-4">
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                <Clipboard className="w-8 h-8 mb-2 opacity-20" />
                暂无记录
              </div>
            )}
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-slate-700 text-sm line-clamp-2">{t}</span>
                </div>
                <button onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 bg-slate-50">
             <button
              onClick={handleGenerate}
              disabled={tasks.length === 0 || loading}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'AI 正在撰写...' : (
                <>
                  <Clipboard className="w-4 h-4" /> 生成专业周报
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 bg-white overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">预览</h2>
            <button onClick={() => setReport('')} className="text-sm text-slate-500 hover:text-primary">
              返回编辑
            </button>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-5 overflow-y-auto font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
            {report}
          </div>
          <div className="mt-4 flex gap-3">
             <button onClick={() => {navigator.clipboard.writeText(report); alert('已复制！')}} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl">
               复制文本
             </button>
             <button className="flex-1 py-3 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/20">
               发送邮件
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleCopilot;