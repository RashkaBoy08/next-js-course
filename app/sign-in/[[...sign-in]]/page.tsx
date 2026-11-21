import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return <AuthSetupPage mode="sign in" />;
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/"><span className="brand-mark"><span /></span><span>taskflow</span></Link>
      <div className="auth-card-wrap"><div className="auth-intro"><span className="eyebrow"><span className="eyebrow-dot" /> WELCOME BACK</span><h1>Good to see you.</h1><p>Your next step is right where you left it.</p></div><SignIn /></div>
      <Link className="auth-back" href="/">← Back to home</Link>
    </main>
  );
}

function AuthSetupPage({ mode }: { mode: "sign in" | "sign up" }) {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/"><span className="brand-mark"><span /></span><span>taskflow</span></Link>
      <div className="setup-card"><span className="setup-icon">✳</span><p className="eyebrow">ONE QUICK SETUP</p><h1>Sign-in needs your Clerk account.</h1><p>TaskFlow is ready for its sign-in connection. Follow the setup notes in the project README to connect your own Clerk app.</p><Link className="button button-dark" href="/">Back to TaskFlow <span aria-hidden="true">→</span></Link></div>
      <Link className="auth-back" href="/">← Back to home</Link>
      <span className="sr-only">Requested action: {mode}</span>
    </main>
  );
}
