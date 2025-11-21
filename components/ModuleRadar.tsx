
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { Zap, TrendingUp, Award, BookOpen, Activity } from 'lucide-react';

const ModuleRadar: React.FC = () => {
  const { currentUser } = useApp();

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
          <ul className="space-y-2">
            <li className="flex gap-2 text-xs text-slate-700 leading-relaxed">
              <span className="text-emerald-500 font-bold">•</span>
              你的<span className="font-bold text-emerald-700">执行力</span>非常出色，在“校园音乐节”项目中展现了极强的落地能力。
            </li>
            <li className="flex gap-2 text-xs text-slate-700 leading-relaxed">
              <span className="text-emerald-500 font-bold">•</span>
              具备良好的<span className="font-bold text-emerald-700">数据思维</span>，能熟练运用 Python 解决实际问题。
            </li>
          </ul>
        </div>

        {/* Improvement Suggestions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            提升建议
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Zap className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">加强领导力叙述</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  虽然你有带队经验，但在简历中对“决策过程”的描述稍显薄弱，建议多补充一些协调冲突的细节。
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5">
                <BookOpen className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">补充商业思维</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  尝试了解项目背后的商业逻辑（如 ROI 分析），这将有助于你申请产品经理类岗位。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default ModuleRadar;
