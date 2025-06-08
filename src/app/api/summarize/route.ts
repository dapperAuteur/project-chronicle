import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // --- DIAGNOSTIC LOG ---
  // Let's check if the server is actually reading our API key.
  // This will only show up in your SERVER terminal (the one running `npm run dev`), not the browser console.
  console.log('Is GEMINI_API_KEY available?:', !!process.env.GEMINI_API_KEY);
  
  // Check if the key exists. If not, return a clear error.
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in the environment variables.");
    return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
  }

  // Initialize the AI with the key
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const { focusGoal, completedTasks } = await req.json();

    if (!focusGoal || !completedTasks || completedTasks.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: focusGoal and completedTasks are required.' }, { status: 400 });
    }
    
    // Construct the prompt for the AI
    const prompt = `Based on the following information, write a single, encouraging sentence summarizing the day's achievements. Be concise and positive.
    Today's Main Focus Goal: "${focusGoal}"
    Completed Tasks:
    - ${completedTasks.join('\n- ')}
    
    Summary:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summaryText = response.text();

    return NextResponse.json({ summary: summaryText });

  } catch (error) {
    console.error('Error in summarize API:', error);
    return NextResponse.json({ error: 'Failed to generate summary due to an internal error.' }, { status: 500 });
  }
}
