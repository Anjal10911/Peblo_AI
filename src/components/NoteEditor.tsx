"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../app/dashboard/dashboard.module.css";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Tag = { id: string; name: string };
type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: Tag[];
  isPublic: boolean;
};

export default function NoteEditor({
  note,
  onChange,
  onDelete,
}: {
  note: Note;
  onChange: (n: Note) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagString, setTagString] = useState(note.tags.map((t) => t.name).join(", "));
  const [isPublic, setIsPublic] = useState(note.isPublic || false);
  const [status, setStatus] = useState("Saved");
  const [aiSummary, setAiSummary] = useState("");
  const [aiActionItems, setAiActionItems] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTags = useDebounce(tagString, 2000);
  const debouncedIsPublic = useDebounce(isPublic, 500);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    saveNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedContent, debouncedTags, debouncedIsPublic]);

  async function saveNote() {
    setStatus("Saving...");
    try {
      const tagsArray = tagString
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags: tagsArray,
          isPublic,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        onChange(updated);
        setStatus("Saved");
      } else {
        setStatus("Error saving");
        toast.error("Failed to save note");
      }
    } catch {
      setStatus("Error saving");
      toast.error("Failed to save note");
    }
  };

  const deleteNote = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      if (res.ok) onDelete();
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const exportNote = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "Note"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Note exported successfully!");
  };

  const handleAiAction = async (action: "summary" | "actions" | "title") => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      
      if (action === "summary") { setAiSummary(data.result); toast.success("Summary generated!"); }
      if (action === "actions") { setAiActionItems(data.result); toast.success("Action items extracted!"); }
      if (action === "title") { setTitle(data.result); toast.success("Title suggested!"); }
    } catch (e) {
      console.error(e);
      toast.error("AI action failed");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <div className={styles.editorHeader}>
        <input
          type="text"
          className={styles.editorTitleInput}
          value={title}
          onChange={(e) => { setTitle(e.target.value); setStatus("Unsaved changes"); }}
          placeholder="Note Title"
        />
        <div className={styles.editorActions}>
          <span className={styles.saveStatus}>{status}</span>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#e2e8f0", cursor: "pointer" }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => { setIsPublic(e.target.checked); setStatus("Unsaved changes"); }} />
            Public Share
          </label>
          <button className={styles.logoutBtn} onClick={() => setIsPreview(!isPreview)} style={{ background: "rgba(255, 255, 255, 0.1)" }}>
            {isPreview ? "Edit" : "Preview"}
          </button>
          <button className={styles.logoutBtn} onClick={exportNote} style={{ background: "rgba(255, 255, 255, 0.1)" }}>
            Export
          </button>
          {isPublic && (
            <button 
              className={styles.logoutBtn} 
              style={{ background: "rgba(193, 18, 31, 0.1)", color: "#c1121f" }}
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/shared/" + note.id);
                toast.success("Link copied to clipboard!");
              }}
            >
              Copy Link
            </button>
          )}
          <button className={styles.logoutBtn} onClick={deleteNote}>
            Delete
          </button>
        </div>
      </div>
      <div className={styles.editorBody} style={{ flexDirection: "row", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: "300px" }}>
          {isPreview ? (
            <div className={styles.contentTextarea} style={{ overflowY: "auto" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Empty note*"}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className={styles.contentTextarea}
              value={content}
              onChange={(e) => { setContent(e.target.value); setStatus("Unsaved changes"); }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                  e.preventDefault();
                  saveNote();
                }
              }}
              placeholder="Start writing (Markdown supported)..."
            />
          )}
          <input
            type="text"
            className={styles.searchInput}
            style={{ marginTop: "1rem" }}
            placeholder="Tags (comma separated)..."
            value={tagString}
            onChange={(e) => { setTagString(e.target.value); setStatus("Unsaved changes"); }}
          />
        </div>
        
        <div className={styles.aiPanel}>
          <div className={styles.aiHeader}>✨ AI Buddy</div>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Let AI help you organize your thoughts.
          </p>
          <button 
            className={styles.aiActionBtn} 
            onClick={() => handleAiAction("summary")}
            disabled={isAiLoading || !content}
          >
            Generate Summary
          </button>
          <button 
            className={styles.aiActionBtn} 
            onClick={() => handleAiAction("actions")}
            disabled={isAiLoading || !content}
          >
            Extract Action Items
          </button>
          <button 
            className={styles.aiActionBtn} 
            onClick={() => handleAiAction("title")}
            disabled={isAiLoading || !content}
          >
            Suggest Title
          </button>

          {isAiLoading && <div style={{ color: "#c1121f", fontSize: "0.85rem" }}>Thinking...</div>}

          {aiSummary && (
            <div className={styles.aiResultBox}>
              <div className={styles.aiResultTitle}>Summary</div>
              {aiSummary}
            </div>
          )}

          {aiActionItems.length > 0 && (
            <div className={styles.aiResultBox}>
              <div className={styles.aiResultTitle}>Action Items</div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                {aiActionItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
