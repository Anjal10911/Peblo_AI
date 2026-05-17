"use client";
import { signOut } from "next-auth/react";
import styles from "../app/dashboard/dashboard.module.css";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className={styles.logoutBtn}>
      Log Out
    </button>
  );
}
