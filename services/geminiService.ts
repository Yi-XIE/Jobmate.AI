import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const models = {
  flash: 'gemini-2.5-flash',
  pro: 'gemini-3-pro-preview',
};

/**
 * Starts a chat session for the Experience Mining Agent
 */
export const createMiningChat = (currentHistory: {role: string, parts: {text: string}[]}[] = []): Chat => {
  return ai.chats.create({
    model: models.flash,
    config: {
      systemInstruction: `你是 "职伴 (JobMate)"，一个富有同理心且专业的职业生涯规划师。
      你的目标是使用 STAR 法则（情境 Situation、任务 Task、行动 Action、结果 Result）帮助学生挖掘过去的经历，将其转化为简历素材。
      
      1. 针对他们最近的项目、社团活动或遇到的困难提出探索性问题。
      2. 当描述模糊时，追问“具体的障碍是什么？”或“你具体采取了什么行动？”。
      3. 既要给予鼓励（提供情绪价值），又要理性分析。
      4. 保持回复简洁，像朋友聊天一样自然。
      5. 请始终使用中文回复。
      `,
    },
    history: currentHistory,
  });
};

/**
 * Generates a resume summary or bullet points based on stored experiences and a target role
 */
export const generateResumeContent = async (experiences: any[], targetRole: string): Promise<string> => {
  const prompt = `
    我正在申请这个岗位: ${targetRole}。
    这是我的原始 STAR 经历数据: ${JSON.stringify(experiences)}。
    
    请为我的简历生成一段专业的“工作/项目经历”部分，专门针对这个岗位进行优化。
    - 突出与岗位匹配的技能。
    - 使用强有力的动词（如：主导、优化、实现）。
    - 尽可能量化结果。
    - 请直接返回 Markdown 格式的文本内容，不要包含其他废话。
    - 使用中文。
  `;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
  });

  return response.text || "无法生成内容，请重试。";
};

/**
 * Analyzes the gap between a resume text and a Job Description
 */
export const analyzeJobMatch = async (resumeText: string, jobDescription: string): Promise<string> => {
  const prompt = `
    简历内容:
    ${resumeText}

    职位描述 (JD):
    ${jobDescription}

    请扮演 ATS (招聘管理系统) 和招聘经理的角色。
    1. 计算匹配度百分比 (0-100)。
    2. 识别缺失的关键词或技能。
    3. 识别简历中的亮点。
    4. 提供针对此 JD 的具体修改建议。
    5. 重新编写一段更匹配该 JD 的“个人总结”。

    请以有效的 JSON 格式返回，Schema 如下:
    {
      "score": number,
      "missingKeywords": string[],
      "strengths": string[],
      "suggestions": string,
      "optimizedSummary": string
    }
  `;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return response.text || "{}";
};

/**
 * Simulates an interviewer response for the Interview Coach
 */
export const getInterviewerResponse = async (
  history: {role: string, content: string}[], 
  lastUserMessage: string,
  interviewType: 'behavioral' | 'technical' | 'pressure'
): Promise<string> => {
  
  let systemInstruction = "你是一位专业的面试官。请用中文与候选人交流。";
  if (interviewType === 'pressure') systemInstruction += " 这是一个压力面试。保持怀疑态度，偶尔打断，追问细节，测试候选人的抗压能力。";
  if (interviewType === 'technical') systemInstruction += " 这是一个技术面试。专注于技术深度、代码概念和系统设计逻辑。";
  if (interviewType === 'behavioral') systemInstruction += " 这是一个行为面试（宝洁八大问）。考察候选人的软素质和领导力准则。";

  const conversation = history.map(h => `${h.role}: ${h.content}`).join('\n') + `\nUser: ${lastUserMessage}`;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: conversation,
    config: {
      systemInstruction: systemInstruction,
      maxOutputTokens: 150, // Keep it conversational
    }
  });

  return response.text || "抱歉，我没听清，请您再说一遍？";
};

/**
 * Generates a weekly report for the Copilot
 */
export const generateWeeklyReport = async (tasks: string[]): Promise<string> => {
  const prompt = `
    这是我本周完成的流水账任务:
    ${tasks.map(t => `- ${t}`).join('\n')}

    请生成一份专业的周报。
    结构:
    1. 本周核心产出 (Key Achievements - 关注影响力)
    2. 项目进度 (Progress)
    3. 下周计划 (Plans)
    4. 风险与困难 (Blocker/Risks)
    
    语调: 专业、简洁、主动。使用中文。
  `;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
  });

  return response.text || "";
};