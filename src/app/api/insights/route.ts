import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const totalNotes = await prisma.note.count({ where: { userId } });
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentNotes = await prisma.note.count({
    where: { userId, updatedAt: { gte: oneWeekAgo } },
  });

  const tags = await prisma.tag.findMany({
    where: { userId },
    include: { _count: { select: { notes: true } } },
    orderBy: { notes: { _count: 'desc' } },
    take: 5,
  });

  return NextResponse.json({
    totalNotes,
    recentNotes,
    topTags: tags.map(t => ({ name: t.name, count: t._count.notes })),
  });
}
