import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
    include: { tags: true },
  });

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(note);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, tags, isArchived, isPublic } = await req.json();

  // Handle tags connection
  let tagsUpdate = undefined;
  if (tags !== undefined) {
    tagsUpdate = {
      set: [], // clear existing tags
      connectOrCreate: tags.map((tag: string) => ({
        where: { name_userId: { name: tag, userId: session.user.id } },
        create: { name: tag, userId: session.user.id },
      })),
    };
  }

  const note = await prisma.note.update({
    where: { id, userId: session.user.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(isArchived !== undefined && { isArchived }),
      ...(isPublic !== undefined && { isPublic }),
      ...(tagsUpdate && { tags: tagsUpdate }),
    },
    include: { tags: true },
  });

  return NextResponse.json(note);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.note.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
