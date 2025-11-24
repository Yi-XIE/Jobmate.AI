import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { StarExperience } from '../types';

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
      你的目标是帮助学生挖掘过去的经历。
      
      **核心原则（必须遵守）：**
      1. **像真人一样聊天**：回复要口语化、自然、简短。不要像机器人一样列一堆点。
      2. **极简主义**：除非用户明确要求详细解释，否则每次回复**严格控制在 50 字以内**。
      3. **单点突破**：一次只问一个问题，不要连珠炮似的发问。
      4. **情绪共鸣**：先肯定用户的情绪，再进行引导。
      5. **始终使用中文**。
      
      示例风格：
      用户："我最近搞了个音乐节，但预算被砍了。"
      你："天哪，预算被砍真的很头疼！那你当时是怎么应对这个突发状况的？" 
      (而不是："收到。这是一个体现危机管理能力的好机会。请问你采取了什么行动？1... 2... 3...")
      `,
    },
    history: currentHistory,
  });
};

/**
 * Generates a short title for the chat based on the first message
 */
export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  const prompt = `
    请根据以下用户输入，生成一个极简短的对话标题（摘要）。
    要求：
    1. 不超过 8 个中文字符。
    2. 不要包含标点符号。
    3. 只要返回标题文本本身。
    
    用户输入: "${firstMessage}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: prompt,
    });
    return response.text?.trim() || "新对话";
  } catch (error) {
    return "新对话";
  }
};

/**
 * Analyzes a full chat history and extracts a structured STAR experience
 */
export const generateStarFromChat = async (messages: {role: string, text: string}[]): Promise<Partial<StarExperience>> => {
  const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
  
  const prompt = `
    请分析以下对话记录，提取用户描述的核心经历，并将其整理为标准的 STAR 法则格式。
    
    对话记录:
    ${conversationText}

    要求：
    1. 提取最核心的一个故事或项目。
    2. 如果信息不完整，请根据上下文合理推断或概括。
    3. 返回 JSON 格式。

    JSON Schema:
    {
      "title": "简短的项目/经历标题 (10字内)",
      "date": "推测的发生时间 (YYYY-MM)，如不清楚则用当前时间",
      "situation": "背景 (S)",
      "task": "任务 (T)",
      "action": "行动 (A)",
      "result": "结果 (R)",
      "tags": ["技能标签1", "技能标签2", "技能标签3"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Failed to generate STAR from chat", error);
    throw new Error("Generation failed");
  }
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
 * Generates a hint/guidance for the user based on the interviewer's question
 */
export const getInterviewHint = async (question: string): Promise<string> => {
  const prompt = `
    作为面试教练，针对面试官的问题：“${question}”
    请给候选人一个简短的回答思路提示（不要直接给答案，指出回答的关键点或STAR方向）。
    限制在30字以内。
    使用中文。
  `;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
  });

  return response.text || "尝试使用 STAR 原则（情境-任务-行动-结果）来构建你的回答。";
};

/**
 * Generates a detailed AI analysis based on interview feedback
 */
export const generateFeedbackAnalysis = async (feedback: any): Promise<string> => {
  const prompt = `
    请作为一位资深的面试教练，对以下面试反馈进行深度解读和总结：

    面试类型: ${feedback.type === 'behavioral' ? '行为面试' : feedback.type === 'technical' ? '技术面试' : '压力面试'}
    得分: ${feedback.score}/100
    原始评价: ${feedback.summary}
    识别出的优点: ${feedback.strengths.join(', ')}
    需要改进点: ${feedback.improvements.join(', ')}

    请输出一段 "AI 深度点评"，包含：
    1. **表现复盘**：用一句话总结表现的核心亮点与不足本质。
    2. **关键提升策略**：针对"需要改进点"，给出2-3条非常具体的训练方法或话术建议。
    3. **下一步计划**：给出一个具体的行动指令。

    要求：
    - 使用清晰的分点列表格式。
    - 语气真诚、一针见血。
    - 控制在 200 字以内。
  `;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
  });

  return response.text || "无法生成分析，请稍后重试。";
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