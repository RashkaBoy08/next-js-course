import Link from "next/link";

const previewTasks = [
  { title: "Finish science notes", label: "Today", tone: "mint" },
  { title: "Plan the group project", label: "Tomorrow", tone: "peach" },
  { title: "Read chapter four", label: "Friday", tone: "lavender" },
];

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><span /></span>;
}

export default function Home() {
  return (
    <main className="landing-page">
      <header className="site-header page-container">
        <Link className="brand" href="/" aria-label="TaskFlow home">
          <Mark />
          <span>taskflow</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <Link className="nav-login" href="/sign-in">Log in</Link>
          <Link className="button button-dark button-small" href="/sign-up">Get started <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="hero page-container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR DAY, A LITTLE LIGHTER</div>
          <h1>Make room for <em>what matters.</em></h1>
          <p className="hero-lede">A simple place to collect your tasks, find your next step, and feel good about what you finish.</p>
          <div className="hero-actions">
            <Link className="button button-lime" href="/sign-up">Start planning <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/dashboard">Open my board <span aria-hidden="true">→</span></Link>
          </div>
          <div className="hero-note"><span className="tiny-check">✓</span> Your tasks stay yours. Your next step stays clear.</div>
        </div>

        <div className="preview-wrap" aria-label="A preview of a TaskFlow task board">
          <div className="preview-orbit orbit-one" />
          <div className="preview-orbit orbit-two" />
          <div className="preview-card">
            <div className="preview-topline">
              <div><span className="preview-kicker">MONDAY, 21 NOV</span><h2>A good day to begin.</h2></div>
              <div className="sun-icon" aria-hidden="true">✳</div>
            </div>
            <div className="preview-progress"><div><span>Today&apos;s focus</span><strong>2 of 4 done</strong></div><div className="progress-track"><span /></div></div>
            <div className="preview-list">
              {previewTasks.map((task, index) => (
                <div className="preview-task" key={task.title}>
                  <span className={`preview-check ${index === 0 ? "checked" : ""}`}>{index === 0 ? "✓" : ""}</span>
                  <span className={index === 0 ? "task-finished" : ""}>{task.title}</span>
                  <span className={`task-date ${task.tone}`}>{task.label}</span>
                </div>
              ))}
            </div>
            <div className="preview-footer"><span className="mini-avatars"><i>J</i><i>M</i><i>+</i></span><span>Small steps add up.</span><span aria-hidden="true">✦</span></div>
          </div>
          <div className="floating-note"><span className="floating-spark">✦</span><span><strong>Nice work!</strong><small>You finished a task</small></span></div>
        </div>
      </section>

      <section className="value-strip page-container" id="how-it-works">
        <p>Less juggling. More doing.</p>
        <div className="value-points">
          <span><b>01</b> Keep tasks in one place</span>
          <span><b>02</b> Move work as it changes</span>
          <span><b>03</b> See your progress clearly</span>
        </div>
      </section>

      <footer className="site-footer page-container"><span>TaskFlow <span className="footer-dot">·</span> made for the next small step</span><Link href="/sign-up">Make your board <span aria-hidden="true">↗</span></Link></footer>
    </main>
  );
}
