"use client";

import { useEffect, useState } from "react";
import styles from "./insights.module.css";

export default function Insights() {
  const [data, setData] = useState<{
    totalNotes: number;
    recentNotes: number;
    topTags: { name: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <div style={{ padding: "2rem", color: "#fff" }}>Loading insights...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Productivity Insights</h1>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Total Notes</div>
          <div className={styles.cardValue}>{data.totalNotes}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Recent (Last 7 Days)</div>
          <div className={styles.cardValue}>{data.recentNotes}</div>
        </div>
      </div>

      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>Top Tags</h2>
      <div className={styles.card}>
        {data.topTags.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No tags used yet.</p>
        ) : (
          <ul className={styles.tagList}>
            {data.topTags.map((tag) => (
              <li key={tag.name} className={styles.tagItem}>
                <span className={styles.tagName}>{tag.name}</span>
                <span className={styles.tagCount}>{tag.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
