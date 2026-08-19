import Link from "next/link";
import { getRecent } from "@/lib/content";

const TASKS = [
  { glyph: "⧗", title: "The 16-week schedule", href: "/wiki/02-Schedule/_index", blurb: "Four units, week by week — Foundations, the Lottie pipeline, interactive platforms (Rive, Fancy Animation Studio, SVG/CSS), and the final project. What's due, when, and why.", accent: "#f59e0b" },
  { glyph: "✦", title: "Projects & exercises", href: "/wiki/03-Projects/_index", blurb: "Four 50-point projects and two 10-point exercises — briefs, deliverables, rubrics, and the UCD rationale each one is graded on.", accent: "#fb7185" },
  { glyph: "❋", title: "Learning resources", href: "/wiki/04-Resources/Learning-Resources", blurb: "A rated library of verified tutorials, docs, videos, and tools for every section of the course — free-first, each one checked and scored.", accent: "#22d3ee" },
  { glyph: "⚒", title: "The toolbox", href: "/wiki/05-Toolbox/_index", blurb: "The tools of the course — Illustrator & Figma, After Effects + Bodymovin, LottieFiles, Rive, Fancy Animation Studio, and web-native SVG/CSS.", accent: "#34d399" },
];
const BROWSE = [
  { label: "Start Here", href: "/wiki/00-Start-Here/_index" },
  { label: "Syllabus", href: "/wiki/01-Syllabus/_index" },
  { label: "Schedule", href: "/wiki/02-Schedule/_index" },
  { label: "Projects", href: "/wiki/03-Projects/_index" },
  { label: "Resources", href: "/wiki/04-Resources/_index" },
  { label: "Toolbox", href: "/wiki/05-Toolbox/_index" },
  { label: "Reference", href: "/wiki/06-Reference/_index" },
  { label: "Blog", href: "/wiki/11-Blog/_index" },
  { label: "Calendar", href: "/calendar" },
];

export default function Dashboard() {
  const recent = getRecent(5);
  return (
    <div>
      <div className="crumbs">Internet Animation · GRFX1222</div>
      <h1>Internet Animation</h1>
      <p className="muted" style={{ fontStyle: "italic", maxWidth: 660 }}>
        The course wiki for GRFX1222 — a 16-week hybrid course on vector-based animation for the
        modern web: animation principles, the Lottie/dotLottie pipeline, After Effects, Rive,
        web-native SVG/CSS motion, and User-Centered Design so that motion serves users rather
        than decorates.
      </p>
      <div className="layer-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {TASKS.map((t) => (
          <Link key={t.href} href={t.href} className="layer-card" style={{ ["--accent" as string]: t.accent }}>
            <div className="glyph">{t.glyph}</div>
            <h3>{t.title}</h3>
            <p>{t.blurb}</p>
          </Link>
        ))}
      </div>
      <h2>Browse the wiki</h2>
      <div className="badges" style={{ gap: 8 }}>
        {BROWSE.map((b) => (
          <Link key={b.href} href={b.href} className="badge" style={{ padding: "5px 12px" }}>{b.label}</Link>
        ))}
      </div>
      <h2>Recently updated</h2>
      <ul className="muted" style={{ fontSize: 14 }}>
        {recent.map((e) => (
          <li key={e.slug}><Link href={`/wiki/${e.slug}`}>{e.title}</Link> — {e.updated}</li>
        ))}
      </ul>
    </div>
  );
}
