import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Peblo <span className={styles.highlight}>AI Notes</span>
        </h1>
        <p className={styles.description}>
          A collaborative, intelligent workspace designed to help you capture, organize, and summarize your thoughts instantly with the power of Google Gemini.
        </p>
        <div className={styles.ctaContainer}>
          <Link href="/dashboard" className={styles.primaryCta}>
            Get Started
          </Link>
          <Link href="/login" className={styles.secondaryCta}>
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
