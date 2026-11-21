import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TaskBoard } from "@/components/task-board";

export default async function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return (
      <main className="setup-page">
        <Link className="brand" href="/"><span className="brand-mark"><span /></span><span>taskflow</span></Link>
        <div className="setup-card"><span className="setup-icon">✳</span><p className="eyebrow">ALMOST READY</p><h1>Connect your sign-in and database.</h1><p>The task board is built. Add your Clerk and PostgreSQL details using the steps in the project README to save tasks to your own account.</p><Link className="button button-dark" href="/">Back to home <span aria-hidden="true">→</span></Link></div>
      </main>
    );
  }

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  const name = user?.firstName || user?.username || "there";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header page-container">
        <Link className="brand" href="/"><span className="brand-mark"><span /></span><span>taskflow</span></Link>
        <div className="dashboard-header-right"><Link className="home-link" href="/">Home</Link><span className="profile-name">Hi, {name}</span><UserButton /></div>
      </header>
      <section className="dashboard-main page-container">
        <div className="dashboard-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span><h1>Let&apos;s make today count.</h1><p>One step at a time. You’ve got this.</p></div><span className="dashboard-date">{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</span></div>
        <TaskBoard />
      </section>
      <footer className="dashboard-footer page-container"><span>TaskFlow <span className="footer-dot">·</span> steady progress counts</span><Link href="/">Back to home ↗</Link></footer>
    </main>
  );
}
