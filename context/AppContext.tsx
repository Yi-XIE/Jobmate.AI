
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
  saveCurrentResume: () => void;
  // User & History
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  chatHistory: ChatSession[];
  saveChatSession: (messages: Message[], title: string) => void;
  loadChatSession: (id: string) => void;
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
    id: 'w1',
    type: 'work',
    title: '电商后台高并发优化项目',
    date: '2024-02',
    situation: '这是我入职后面临的第一个重大挑战。当时正值“双11”大促备战期，业务部门预测今年的流量峰值将达到去年的 5 倍（约 5000 QPS）。\n\n然而，现有的订单系统是一个 3 年前构建的单体应用，代码历史包袱重，且数据库存在严重的单点瓶颈。在之前的几次小规模促销中，系统经常出现响应超时甚至宕机的情况，不仅影响用户体验，更带来了直接的营收损失。',
    task: '作为后端核心开发人员，我被任命为“交易链路稳定性”攻坚小组的技术骨干。我的核心指标非常明确且严苛：\n1. 将核心下单接口的 QPS 承载能力从 800 提升至 5000+。\n2. 确保大促期间核心链路“零宕机”。\n3. 将接口平均响应时间（RT）控制在 500ms 以内。',
    action: '我主导并执行了以下关键技术改造：\n\n1. **架构拆分与异步化**：将臃肿的订单服务拆分为“订单创建”、“库存扣减”、“支付回调”三个微服务。引入 RocketMQ 消息队列，将非核心逻辑（如积分发放、发货通知）从主链路剥离，实现异步解耦。\n\n2. **数据库优化**：针对数据库单点瓶颈，我设计并实施了分库分表方案（ShardingSphere），将数据按 UserID 进行水平拆分，分散读写压力。同时，引入 Redis Cluster 缓存高频商品信息，拦截了 90% 的数据库读请求。\n\n3. **全链路压测**：编写了自动化压测脚本，模拟真实流量模型进行全链路压测。通过压测发现了连接池配置过小、慢 SQL 等 10+ 个隐蔽问题，并逐一修复。',
    result: '最终结果超出了预期：\n\n1. 在大促当晚，系统成功扛住了 5200 QPS 的流量洪峰，且 CPU 使用率保持在 60% 以下。\n2. 核心接口平均响应时间从 1.2秒 降低至 320毫秒，用户下单体验丝滑。\n3. 因为此次出色的稳定性保障，我获得了部门年度“技术攻坚”奖，并被邀请在团队内部分享高并发架构经验。',
    tags: ['高并发', '架构设计', 'Redis', '工作产出']
  },
  {
    id: 'w2',
    title: '企业级 CRM 系统重构',
    type: 'work',
    date: '2024-01',
    situation: '随着公司 B 端客户数量的激增，原有的 CRM（客户关系管理）系统逐渐不堪重负。该系统早期由外包团队开发，代码耦合度极高，是一个典型的“大泥球”架构。\n\n每当销售团队提出一个新的报表需求，开发团队往往需要耗时两周才能上线，且经常因为修改一个功能导致其他模块报错，客户投诉率居高不下。',
    task: 'CTO 决定对 CRM 系统进行彻底重构。我作为核心开发者，需要在 2 个月的时间内，在保证旧系统业务不中断的前提下，完成核心模块（客户管理、商机跟进）的微服务化迁移，并将新需求的交付周期缩短 50%。',
    action: '为了解决代码耦合和维护难的问题，我采取了以下行动：\n\n1. **引入领域驱动设计 (DDD)**：我组织了 3 场 Event Storming（事件风暴）工作坊，与产品经理和业务专家一起重新梳理了业务边界，识别出“销售域”、“客户域”、“审批域”等核心领域，建立了清晰的限界上下文。\n\n2. **双写迁移方案**：制定了平滑迁移策略。在重构期间，采用“双写”机制，即数据同时写入新旧数据库，并通过定时脚本进行数据核对，确保了数据的一致性。利用网关层（Gateway）逐步将流量切分到新服务，实现了“开着飞机换引擎”。\n\n3. **建立工程规范**：引入了 CI/CD 流水线和代码审查（Code Review）机制，强制要求单元测试覆盖率达到 80% 以上，从源头保证代码质量。',
    result: '重构项目按期上线，效果显著：\n\n1. 开发效率大幅提升，新功能的平均交付周期从 10 天缩短至 4 天，提升了 60%。\n2. 系统稳定性增强，客户关于系统卡顿和数据错误的投诉率下降了 90%。\n3. 新的架构具有良好的扩展性，该架构模式随后被推广到了公司的供应链系统重构中。',
    tags: ['微服务', '重构', 'DDD', '效率提升']
  },
  {
    id: 'w3',
    title: 'Q3 市场营销自动化工具开发',
    type: 'work',
    date: '2023-12',
    situation: '在与运营团队的协作中，我发现他们每天需要花费大量时间处理机械性工作。例如，每天早上需要人工从三个不同的后台导出数据，手动合并 Excel 表格来生成日报；发送营销邮件时，也是人工筛选用户邮箱并逐个群发。\n\n这种工作方式不仅效率极低（每天耗时约 4 小时），而且经常出现数据复制粘贴错误，导致决策偏差。',
    task: '为了释放运营团队的人力，使其专注于更高价值的策略分析，我主动提议并负责开发一套“营销自动化工具集”，目标是实现报表的一键生成和营销邮件的精准自动发送。',
    action: '作为唯一的开发者，我独立完成了需求分析到上线的全过程：\n\n1. **数据自动化管道**：利用 Python 编写脚本，对接内部 BI 系统的 API 接口，每天凌晨定时拉取数据，使用 Pandas 进行清洗和聚合，并自动生成可视化的 HTML 格式日报邮件推送到管理层邮箱。\n\n2. **精准营销模块**：开发了一个基于规则的筛选引擎，允许运营人员设置标签（如“近30天活跃”、“高净值用户”），系统自动圈选目标用户群。集成 SendGrid API 实现邮件的高并发发送。\n\n3. **A/B 测试功能**：增加了 A/B 测试支持，允许运营配置不同的邮件标题和内容，系统自动分流并在后台统计打开率和点击率。',
    result: '工具上线后，成为了运营团队的得力助手：\n\n1. 运营团队每周节省了超过 20 个工时，不再被繁琐的 Excel 困扰。\n2. 通过精准筛选和 A/B 测试优化，营销邮件的平均点击率（CTR）从 2.5% 提升到了 4.3%，直接带来了 15% 的转化增长。\n3. 该工具被评为公司季度的“最佳微创新”项目。',
    tags: ['Python', '自动化', '工具开发']
  },
  {
    id: '1',
    type: 'campus',
    title: '校园音乐节组织者',
    date: '2023-05',
    situation: '这是我校规模最大的年度活动，预计参与人数超过 500 人。然而，就在活动开始前两周，学校突然通知因经费紧张，原定的活动预算被削减了 40%（约 5000 元）。\n\n如果不解决资金缺口，我们不得不取消压轴乐队的演出或缩减舞台设备，这将严重影响活动质量和同学们的期待。团队内部士气低落，甚至有人提议取消活动。',
    task: '作为活动总策划，我必须在两周内填补这 40% 的资金缺口，或者找到等价的替代资源，确保音乐节不降级举行，并稳住团队军心。',
    action: '面对危机，我迅速调整策略，采取了“开源”和“节流”双管齐下的行动：\n\n1. **紧急外联赞助**：我带领外联部同学，在 3 天内跑遍了学校周边的 50 多家商户。我们调整了赞助方案，不再只求现金，而是接受物资置换。最终成功说服一家健身房提供现金赞助，两家奶茶店提供饮品支持。\n\n2. **资源置换与成本控制**：针对安保费用（原计划聘请校外公司），我主动联系了校跆拳道协会，以“活动现场独家招新宣传位”作为交换，请他们派出 20 名成员负责现场秩序维护，直接省去了 3000 元安保费。\n\n3. **团队激励**：我召开了紧急全员会，透明化了财务困境和解决方案，并设立了“突出贡献奖”，重新点燃了大家的热情。',
    result: '在预算大幅削减的情况下，音乐节不仅如期举行，而且效果超乎预期：\n\n1. 我们不仅填补了资金缺口，还额外拉到了价值 2000 元的实物赞助。\n2. 现场观众达到 500+ 人，气氛热烈，没有发生任何安全事故。\n3. 活动结束后结算，我们甚至实现了 10% 的盈利（约 800 元），全部捐赠给了学校的流浪动物救助社团。',
    tags: ['领导力', '商务谈判', '危机管理']
  },
  {
    id: '2',
    type: 'campus',
    title: '数据科学课程项目',
    date: '2023-11',
    situation: '在《数据挖掘与分析》课程的期末项目中，我们需要预测某城市的房价走势。老师提供的数据集非常原始且混乱，包含 5 万条记录，但其中有超过 30% 的关键字段（如房屋面积、建成年份）存在缺失值。\n\n很多小组选择了直接删除缺失数据，导致样本量不足，模型预测偏差很大。我们小组的目标是拿到课程的 A+ 成绩。',
    task: '我负责项目中最关键的“数据清洗”和“特征工程”环节。我的任务是尽可能保留有效样本，从混乱的数据中提取出能显著提升模型准确率的特征。',
    action: '我没有简单地删除数据，而是利用 Python 的 Pandas 和 Scikit-learn 库进行了深度处理：\n\n1. **智能填补缺失值**：对于“建成年份”等连续变量，我没有用均值填补，而是使用了 KNN（K-Nearest Neighbors）算法，根据地理位置相邻房屋的信息进行插值填补，大大提高了数据的真实性。\n\n2. **构建交互特征**：基于业务理解，我构建了几个新特征。例如，结合“总价”和“面积”计算出“单价”；结合“经纬度”计算房屋到市中心地标的距离。这些特征后来被证明对模型贡献巨大。\n\n3. **异常值处理**：通过箱线图识别并剔除了一些明显的数据录入错误（如面积为 0 的房屋），净化了训练集。',
    result: '数据预处理的效果立竿见影：\n\n1. 经过我清洗后的数据集，保留了 95% 的原始样本量，远高于其他小组的 70%。\n2. 在使用相同的 XGBoost 模型进行测试时，我们小组的模型 R2 Score（拟合优度）达到了 0.92，是全班最高的。\n3. 教授在点评时特别表扬了我们的特征工程思路，最终我们小组获得了该课程的最高分。',
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
  { id: 'c1', title: '挖掘校园音乐节经历', date: '2024-03-20 10:30' },
  { id: 'c2', title: '优化自我介绍', date: '2024-03-19 14:00' },
  { id: 'c3', title: '面试技巧咨询', date: '2024-03-12 09:00' },
];

// Add messages to ChatSession type interface augmentation locally if needed, but in our case we might need to store messages in the session
// For simplicity, we'll assume ChatSession in types.ts is just metadata, but let's extend it or use a separate store.
// To keep it simple, we will store the actual messages in memory in this context for "mock" persistence.
const mockChatMessagesStore: Record<string, Message[]> = {
    'c1': [{id:'1', role:'model', text:'请问你在这个项目中担任什么角色？'}, {id:'2', role:'user', text:'我是总负责人。'}],
    'c2': [{id:'1', role:'model', text:'你的自我介绍太长了，建议精简。'}],
    'c3': [{id:'1', role:'model', text:'回答缺点时要真诚。'}]
};

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
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(mockChatHistory);
  const [interviewFeedbacks] = useState<InterviewFeedback[]>(mockInterviewFeedbacks);
  
  // Global Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("");

  // Store messages for history sessions in memory
  const [archivedMessages, setArchivedMessages] = useState<Record<string, Message[]>>(mockChatMessagesStore);

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

  const saveChatSession = (msgs: Message[], title: string) => {
      const sessionId = Date.now().toString();
      const newSession: ChatSession = {
          id: sessionId,
          title: title || '未命名对话',
          date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory(prev => [newSession, ...prev]);
      setArchivedMessages(prev => ({ ...prev, [sessionId]: msgs }));
  };

  const loadChatSession = (id: string) => {
      const msgs = archivedMessages[id];
      const session = chatHistory.find(c => c.id === id);
      if (msgs) {
          setMessages(msgs);
          setCurrentChatTitle(session?.title || "");
          setMode(AppMode.DASHBOARD);
      }
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
      saveChatSession,
      loadChatSession,
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
