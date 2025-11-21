import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { StarExperience, AppMode, SavedResume, User, ChatSession, Message, InterviewFeedback } from '../types';

interface AppState {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  experiences: StarExperience[];
  addExperience: (exp: StarExperience) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  savedResumes: SavedResume[];
  loadResume: (id: string) => void;
  saveCurrentResume: () => void; // Added
  // User & History
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  chatHistory: ChatSession[];
  // Global Chat State
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  currentChatTitle: string;
  setCurrentChatTitle: Dispatch<SetStateAction<string>>;
  // Interview Feedback
  interviewFeedbacks: InterviewFeedback[];
}

const defaultExperiences: StarExperience[] = [
  {
    id: '1',
    title: '校园音乐节组织者',
    date: '2023-05',
    situation: '在活动开始前两周，年度音乐节的预算被削减了 40%。',
    task: '我的任务是保证活动质量不下降，且不取消任何演出。',
    action: '我与 3 家当地企业谈成了赞助协议，并组织学生志愿者团队代替付费安保，大幅降低了成本。',
    result: '活动顺利举行，吸引了 500+ 观众，最终还实现了 10% 的盈利捐给慈善机构。',
    tags: ['领导力', '商务谈判', '危机管理']
  },
  {
    id: '2',
    title: '数据科学课程项目',
    date: '2023-11',
    situation: '我们需要预测房价，但数据集非常混乱，有 30% 的缺失值。',
    task: '我负责数据清洗和特征工程部分。',
    action: '我使用 Python Pandas 进行处理，利用 KNN 填补缺失值，并构建了新的交互特征。',
    result: '我们的模型在全班取得了最高的准确率 (R2 = 0.92)。',
    tags: ['Python', '数据分析', '机器学习']
  }
];

const defaultResume = `
# 陈小明
某某大学 | 计算机科学 | 意向：产品经理 / 数据分析

## 教育背景
**某某大学**
计算机科学学士，GPA 3.8/4.0

## 项目经历
**校园音乐节组织者**
- 领导 20 人的志愿者团队。
- 在预算削减的情况下，成功拉取 2000 元赞助。

**数据科学实习生**
- 使用 Python 分析大规模数据集。
- 优化了数据处理流程，提升了效率。
`;

const mockSavedResumes: SavedResume[] = [
  {
    id: 'r1',
    title: '产品经理_针对字节跳动_v2.md',
    date: '2024-03-15 14:30',
    preview: '强调了用户思维和数据驱动能力，优化了校园音乐节项目的描述...',
    content: defaultResume
  },
  {
    id: 'r2',
    title: '数据分析师_通用版.md',
    date: '2024-03-10 09:15',
    preview: '突出了 Python 和 SQL 技能，详细展开了课程项目的建模过程...',
    content: defaultResume.replace('产品经理', '数据挖掘工程师')
  },
  {
    id: 'r3',
    title: '运营专员_社团经历侧重.md',
    date: '2024-02-28 18:20',
    preview: '着重描写了组织协调能力和危机处理经验...',
    content: defaultResume
  }
];

const mockUsers: User[] = [
  { 
    id: 'u1', 
    name: '陈小明', 
    role: '应届毕业生', 
    // Cute cartoon avatar
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix' 
  },
  { 
    id: 'u2', 
    name: 'Alex (测试号)', 
    role: '产品经理', 
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex' 
  },
];

const mockChatHistory: ChatSession[] = [
  { id: 'c1', title: '挖掘校园音乐节经历', date: '今天 10:30' },
  { id: 'c2', title: '优化自我介绍', date: '昨天' },
  { id: 'c3', title: '面试技巧咨询：如何回答缺点', date: '3月12日' },
  { id: 'c4', title: '周报生成：第10周', date: '3月5日' },
];

const mockInterviewFeedbacks: InterviewFeedback[] = [
  {
    id: 'if1',
    date: '2024-03-15',
    type: 'behavioral',
    score: 85,
    summary: '在回答“最大的缺点”时，能够坦诚面对并提出改进措施，但具体的改进案例可以更生动一些。',
    strengths: ['态度真诚', '逻辑清晰 (STAR原则)', '眼神交流自信'],
    improvements: ['语速稍快', '缺乏数据支撑改进效果']
  },
  {
    id: 'if2',
    date: '2024-03-10',
    type: 'pressure',
    score: 68,
    summary: '面对连续追问时显得有些慌张，出现了较长时间的停顿。需要加强抗压训练。',
    strengths: ['没有情绪化', '努力维持礼貌'],
    improvements: ['临场反应慢', '回答缺乏结构', '眼神频繁躲闪']
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [experiences, setExperiences] = useState<StarExperience[]>(defaultExperiences);
  const [resumeText, setResumeText] = useState<string>(defaultResume);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>(mockSavedResumes);
  
  // User State
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [users] = useState<User[]>(mockUsers);
  const [chatHistory] = useState<ChatSession[]>(mockChatHistory);
  const [interviewFeedbacks] = useState<InterviewFeedback[]>(mockInterviewFeedbacks);
  
  // Global Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("");

  const addExperience = (exp: StarExperience) => {
    setExperiences(prev => [exp, ...prev]);
  };

  const loadResume = (id: string) => {
    const resume = savedResumes.find(r => r.id === id);
    if (resume) {
      setResumeText(resume.content);
      setMode(AppMode.RESUME);
    }
  };

  const saveCurrentResume = () => {
    const lines = resumeText.split('\n').filter(l => l.trim());
    const title = lines.length > 0 ? lines[0].replace(/^#\s*/, '') : '未命名简历';
    
    const newResume: SavedResume = {
      id: Date.now().toString(),
      title: title.length > 15 ? title.substring(0, 15) + '...' : title,
      date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      preview: resumeText.substring(0, 50).replace(/[#*]/g, '') + '...',
      content: resumeText
    };
    
    setSavedResumes(prev => [newResume, ...prev]);
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  return (
    <AppContext.Provider value={{ 
      currentMode, 
      setMode, 
      experiences, 
      addExperience,
      resumeText,
      setResumeText,
      savedResumes,
      loadResume,
      saveCurrentResume,
      currentUser,
      users,
      switchUser,
      chatHistory,
      messages,
      setMessages,
      interviewFeedbacks,
      currentChatTitle,
      setCurrentChatTitle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};