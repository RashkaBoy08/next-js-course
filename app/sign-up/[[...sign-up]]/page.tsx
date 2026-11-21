import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return (
      <main className="auth-page">
        <Link className="brand auth-brand" href="/"><span className="brand-mark"><span /></span><span>taskflow</span></Link>
        <div className="setup-card"><span className="setup-icon">✳</span><p className="eyebrow">ONE QUICK SETUP</p><h1>Sign-in needs your Clerk account.</h1><p>TaskFlow is ready for its sign-in connection. Follow the setup notes in the project README to connect your own Clerk app.</p><Link className="button button-dark" href="/">Back to TaskFlow <span aria-hidden="true">→</span></Link></div>
        <Link className="auth-back" href="/">← Back to home</Link>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/"><span className="brand-mark"><span /></span><span>taskflow</span></Link>
      <div className="auth-card-wrap"><div className="auth-intro"><span className="eyebrow"><span className="eyebrow-dot" /> START WITH ONE STEP</span><h1>Make your space.</h1><p>A calmer plan starts here.</p></div><SignUp /></div>
      <Link className="auth-back" href="/">← Back to home</Link>
    </main>
  );
}
