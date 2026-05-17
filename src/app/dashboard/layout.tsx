import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "./dashboard.module.css";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Peblo</div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>Notes</Link>
          <Link href="/insights" className={styles.navLink}>Insights</Link>
        </nav>
        <div className={styles.userSection}>
          <div className={styles.userName}>{session.user?.name}</div>
          <LogoutButton />
        </div>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
