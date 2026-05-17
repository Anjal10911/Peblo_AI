import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, tags } = await req.json();

  const note = await prisma.note.create({
    data: {
      title: title || "Untitled Note",
      content: content || "",
      userId: session.user.id,
      tags: {
        connectOrCreate: (tags || []).map((tag: string) => ({
          where: { name_userId: { name: tag, userId: session.user.id } },
          create: { name: tag, userId: session.user.id },
        })),
      },
    },
    include: { tags: true },
  });

  return NextResponse.json(note);
}
