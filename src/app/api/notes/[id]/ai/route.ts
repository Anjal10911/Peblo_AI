import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();

  const note = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!note || !note.content) {
    return NextResponse.json({ error: "Note not found or empty" }, { status: 400 });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Mock response for demo purposes when API key is not set
      await new Promise(r => setTimeout(r, 1500)); // Simulate delay
      if (action === "summary") return NextResponse.json({ result: "This is a mock summary of the notes. It identifies the key points discussed." });
      if (action === "actions") return NextResponse.json({ result: ["Follow up with the team", "Draft the proposal"] });
      if (action === "title") return NextResponse.json({ result: "Project Meeting Notes" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let prompt = "";
    if (action === "summary") {
      prompt = `Summarize the following notes concisely in 2-3 sentences:\n\n${note.content}`;
    } else if (action === "actions") {
      prompt = `Extract a list of actionable items from the following notes. Return ONLY a JSON array of strings, nothing else. If there are no action items, return an empty array [].\n\nNotes:\n${note.content}`;
    } else if (action === "title") {
      prompt = `Suggest a short, catchy title (max 5 words) for the following notes. Return ONLY the title string, no quotes.\n\n${note.content}`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let finalResult: string | string[] = responseText.trim();
    
    // Parse actions if it's supposed to be JSON array
    if (action === "actions") {
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          finalResult = JSON.parse(jsonMatch[0]);
        } else {
          finalResult = [];
        }
      } catch {
        finalResult = [];
      }
    }

    return NextResponse.json({ result: finalResult });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
