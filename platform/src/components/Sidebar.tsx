import Link from "next/link";
import { getNav, getVerifyQueue } from "@/lib/content";
import GitStatusBadge from "./GitStatusBadge";
import SidebarSections from "./SidebarSections";

export default function Sidebar() {
  const nav = getNav();
  const verifyCount = getVerifyQueue().length;

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        Internet Animation
        <small>GRFX1222 · vector motion for the modern web</small>
      </Link>

      <Link href="/calendar" className="nav-featured" style={{ borderLeftColor: "#f59e0b" }}>
        ⧗ Class Calendar
      </Link>

      <Link href="/wiki/11-Blog/_index" className="nav-featured">
        ✍ Blog
      </Link>

      <div className="nav-section">
        <Link href="/" className="nav-link is-collection"><span>◰ Dashboard</span></Link>
        <Link href="/wiki/01-Syllabus/_index" className="nav-link is-collection"><span>❡ Syllabus</span></Link>
        <Link href="/wiki/02-Schedule/_index" className="nav-link is-collection"><span>⧗ 16-week schedule</span></Link>
        <Link href="/wiki/03-Projects/_index" className="nav-link is-collection"><span>✦ Projects & exercises</span></Link>
        <Link href="/wiki/04-Resources/Learning-Resources" className="nav-link is-collection"><span>❋ Learning resources</span></Link>
        <Link href="/wiki/05-Toolbox/_index" className="nav-link is-collection"><span>⚒ Toolbox</span></Link>
        <Link href="/wiki/06-Reference/_index" className="nav-link is-collection"><span>§ Reference</span></Link>
      </div>

      <SidebarSections sections={nav} />

      <div className="nav-section" style={{ marginTop: 20 }}>
        <Link href="/boards" className="nav-link"><span>▨ Whiteboards</span></Link>
        <Link href="/verify" className="nav-link">
          <span>⚠ Verify queue</span>
          {verifyCount > 0 && <span className="count">{verifyCount}</span>}
        </Link>
        <GitStatusBadge />
      </div>
    </aside>
  );
}
