
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { StarExperience } from '../types';
import { 
  MINER_SYSTEM_INSTRUCTION, 
  generateChatTitlePrompt, 
  generateStarFromChatPrompt, 
  generateResumeContentPrompt, 
  analyzeJobMatchPrompt, 
  getInterviewerSystemInstruction, 
  getInterviewHintPrompt, 
  generateFeedbackAnalysisPrompt, 
  generateWeeklyReportPrompt 
} from '../prompts/index';

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
      systemInstruction: MINER_SYSTEM_INSTRUCTION,
    },
    history: currentHistory,
  });
};

/**
 * Generates a short title for the chat based on the first message
 */
export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  const prompt = generateChatTitlePrompt(firstMessage);

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
  const prompt = generateStarFromChatPrompt(conversationText);

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
  const prompt = generateResumeContentPrompt(JSON.stringify(experiences), targetRole);

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
  const prompt = analyzeJobMatchPrompt(resumeText, jobDescription);

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
  
  const systemInstruction = getInterviewerSystemInstruction(interviewType);
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
  const prompt = getInterviewHintPrompt(question);

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
  const prompt = generateFeedbackAnalysisPrompt(feedback);

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
  const tasksList = tasks.map(t => `- ${t}`).join('\n');
  const prompt = generateWeeklyReportPrompt(tasksList);

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
  });

  return response.text || "";
};
