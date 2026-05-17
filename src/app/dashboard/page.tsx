"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import NoteEditor from "@/components/NoteEditor";

type Tag = { id: string; name: string };
type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: Tag[];
  isPublic: boolean;
};

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Note", content: "" }),
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateNoteInList = (updatedNote: Note) => {
    setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.notesList}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>All Notes</h2>
          <button onClick={createNote} className={styles.newNoteBtn}>
            +
          </button>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search notes..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.scrollArea}>
          {loading ? (
            <div style={{ padding: "1rem", color: "#64748b" }}>Loading...</div>
          ) : filteredNotes.length === 0 ? (
            <div style={{ padding: "1rem", color: "#64748b" }}>No notes found.</div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`${styles.noteItem} ${
                  activeNoteId === note.id ? styles.active : ""
                }`}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className={styles.noteTitle}>{note.title}</div>
                <div className={styles.notePreview}>
                  {note.content.substring(0, 50) || "No content"}
                </div>
                <div className={styles.noteDate}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                {note.tags.length > 0 && (
                  <div className={styles.tags}>
                    {note.tags.map((tag) => (
                      <span key={tag.id} className={styles.tag}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
      
      <div className={styles.editorContainer}>
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onChange={updateNoteInList}
            onDelete={() => {
              setNotes(notes.filter((n) => n.id !== activeNote.id));
              setActiveNoteId(null);
            }}
          />
        ) : (
          <div className={styles.emptyState}>
            <h2>Select a note to start editing</h2>
            <p>Or create a new one to jot down your thoughts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
