import prisma from "@/lib/prisma";
import styles from "./shared.module.css";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function SharedNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!note || !note.isPublic) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{note.title}</h1>
          <div className={styles.author}>Shared by {note.user.name}</div>
        </div>
        <div className={styles.sharedContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </div>
        <div className={styles.footer}>
          Peblo AI Notes Workspace
        </div>
      </div>
    </div>
  );
}
