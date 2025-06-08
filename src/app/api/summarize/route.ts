import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Get the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { focusGoal, completedTasks } = await req.json();

    if (!focusGoal || !completedTasks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Construct the prompt for the AI
    const prompt = `Based on the following information, write a single, encouraging sentence summarizing the day's achievements.
    Today's Main Focus Goal: "${focusGoal}"
    Completed Tasks:
    - ${completedTasks.join('\n- ')}

    Summary:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });

  } catch (error) {
    console.error('Error in summarize API:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}