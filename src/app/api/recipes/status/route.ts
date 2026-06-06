import { NextResponse } from "next/server";
import { validateGeminiApiKey } from "@/lib/gemini/validateApiKey";

export async function GET() {
  const result = await validateGeminiApiKey(process.env.GEMINI_API_KEY);
  return NextResponse.json(result);
}
