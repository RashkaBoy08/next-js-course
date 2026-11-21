export default function Home() {
  return (
    <div>
      <h1>Welcome to the home page</h1>
      {/* navigation link */}
      <nav className="nav flex gap-4">
        <a href="/service" className="nav-link ">
          Service
        </a>
        <a href="/about" className="nav-link">
          About
        </a>
        <a href="/contact" className="nav-link">
          Contact
        </a>
        <a href="/todos" className="nav-link">
          Todos
        </a>
      </nav>
      <h1>Welcome to the home page</h1>
      <p>This is the home page</p>
    </div>
  );
}
