import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { AppMode } from '../types';
import { Zap, TrendingUp, Award, BookOpen, Activity, Video } from 'lucide-react';

const ModuleRadar: React.FC = () => {
  const { currentUser, setMode } = useApp();

  // Mock Data based on a "Student/Job Seeker" profile
  const radarData = [
    { subject: '沟通力', A: 85, fullMark: 100 },
    { subject: '领导力', A: 65, fullMark: 100 },
    { subject: '执行力', A: 90, fullMark: 100 },
    { subject: '专业技能', A: 80, fullMark: 100 },
    { subject: '逻辑思维', A: 75, fullMark: 100 },
    { subject: '创新能力', A: 70, fullMark: 100 },
  ];

  const skills = [
    { name: 'Python / Data Analysis', level: 85, color: 'bg-blue-500' },
    { name: 'Project Management', level: 70, color: 'bg-indigo-500' },
    { name: 'Public Speaking', level: 60, color: 'bg-emerald-500' },
    { name: 'UI/UX Design', level: 45, color: 'bg-orange-500' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white p-6 pb-8 rounded-b-[32px] shadow-sm border-b border-slate-100 relative z-10">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">能力全景雷达</h2>
          <p className="text-xs text-slate-400 mt-1">基于你的 {radarData.length} 个经历资产分析生成</p>
        </div>

        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name={currentUser.name}
                dataKey="A"
                stroke="#4F46E5"
                strokeWidth={3}
                fill="#4F46E5"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
          {/* Center Score */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <span className="text-2xl font-bold text-indigo-600">78</span>
             <span className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">综合评分</span>
          </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="p-4 space-y-4 -mt-4 relative z-0 pt-6">
        
        {/* Skill Tree */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            技能树 (Skill Tree)
          </h3>
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{skill.name}</span>
                  <span className="text-slate-400">{skill.level}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${skill.color}`} 
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths Analysis */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            核心优势
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-2 text-xs text-slate-700 leading-relaxed">
              <span className="text-emerald-500 font-bold">•</span>
              <span>
                <strong className="text-emerald-700 block mb-0.5">卓越的执行与落地能力</strong>
                在“校园音乐节”和“市场自动化工具”项目中，你展现了从0到1解决问题的能力。不仅能应对突发的预算危机，还能主动通过技术手段优化工作流，这种“结果导向”的特质是雇主非常看重的。
              </span>
            </li>
            <li className="flex gap-2 text-xs text-slate-700 leading-relaxed">
              <span className="text-emerald-500 font-bold">•</span>
              <span>
                <strong className="text-emerald-700 block mb-0.5">数据驱动的思维模式</strong>
                你习惯用数据说话（如“提升15%转化”、“R2 Score 0.92”）。在数据科学项目中，你没有机械地套用模型，而是深入思考了业务场景（地理位置插值），这种将技术与业务结合的能力非常稀缺。
              </span>
            </li>
            <li className="flex gap-2 text-xs text-slate-700 leading-relaxed">
              <span className="text-emerald-500 font-bold">•</span>
              <span>
                <strong className="text-emerald-700 block mb-0.5">跨界融合潜力</strong>
                兼具计算机技术背景与活动组织经验，使你既能理解底层逻辑，又能处理人际协作，非常适合往“技术产品经理”或“项目经理”方向发展。
              </span>
            </li>
          </ul>
        </div>

        {/* Improvement Suggestions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            提升建议
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Zap className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">强化领导力中的“决策细节”</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed text-justify">
                  虽然你有带队经验，但在描述中对于“如何处理团队冲突”或“如何做出艰难决策”的心理博弈过程描述较少。建议在面试中准备 1-2 个关于“说服他人”的具体案例，体现你的软性影响力。
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5">
                <BookOpen className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">补充宏观商业视角</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed text-justify">
                  你的经历多集中在具体的执行层面。为了进阶，建议尝试思考项目背后的商业价值（如 ROI 分析、市场竞品分析）。例如，在介绍自动化工具时，除了提效率提升，还可以预估其节省的人力成本金额。
                </p>
              </div>
            </div>
            
            {/* Targeted Training Button */}
            <div className="pt-2">
                <button 
                  onClick={() => setMode(AppMode.INTERVIEW)}
                  className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 hover:shadow-sm transition-all active:scale-95 group"
                >
                  <span className="p-1 bg-indigo-200 rounded-full group-hover:bg-white transition-colors">
                     <Video className="w-3.5 h-3.5 fill-current" />
                  </span>
                  针对性面试培训 (Video Practice)
                </button>
            </div>
          </div>
        </div>
        
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default ModuleRadar;