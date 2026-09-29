"use client";

import { useCallback, useEffect, useState } from "react";
import ChatView from "./ChatView";
import VerifyView from "./VerifyView";
import DocumentsView from "./DocumentsView";
import ResearchView from "./ResearchView";
import type { ActivityItem, View } from "@/lib/types";
import { formatDate, statusClass } from "@/lib/types";

type Stats = {
  questions: number;
  documents: number;
  verifications: number;
  sources: number;
  chunks: number;
};

type StatsResponse = {
  ok: boolean;
  stats: Stats;
  recentChats: { id: number; title: string; updated_at: string }[];
  recentDocs: { id: number; name: string; pages: number | null; created_at: string }[];
  recentClaims: { id: number; claim: string; status: string; created_at: string }[];
};

const VIEW_NAMES: Record<View, string> = {
  home: "Home",
  dashboard: "Dashboard",
  chat: "Legal Chat",
  verify: "Verify a Claim",
  documents: "Document Analysis",
  research: "Legal Research",
  how: "How it works",
  trust: "Trust & limits",
  history: "History",
};

export default function AppShell() {
  const [view, setView] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<StatsResponse | null>(null);
  const [dbOk, setDbOk] = useState<boolean | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [statsRes, actRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/activity"),
      ]);
      const stats = (await statsRes.json()) as StatsResponse;
      const act = await actRes.json();
      setData(stats);
      setDbOk(Boolean(stats.ok));
      setActivity(act.activity ?? []);
    } catch {
      setDbOk(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const go = useCallback((next: View) => {
    setView(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  async function clearHistory() {
    await fetch("/api/activity", { method: "DELETE" });
    void refresh();
  }

  async function deleteActivity(id: number) {
    await fetch(`/api/activity/${id}`, { method: "DELETE" });
    void refresh();
  }

  const stats = data?.stats;

  const navButton = (key: View, icon: string, label: string) => (
    <button
      className={"nav-link" + (view === key ? " active" : "")}
      onClick={() => go(key)}
      key={key}
    >
      {icon} <span>{label}</span>
    </button>
  );

  return (
    <div className="app">
      <aside className={"sidebar" + (sidebarOpen ? " open" : "")}>
        <div className="brand">
          <svg width="23" height="23" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 2L23 6.5V13C23 19 18.5 23 13 24C7.5 23 3 19 3 13V6.5L13 2Z"
              stroke="#fff"
              strokeWidth="1.6"
            />
            <path
              d="M8.5 13L11.5 16L18 9"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          AI Legal Assistant using RAG
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9FAAC0",
            padding: "0 10px 18px",
            borderBottom: "1px solid #2A3A5C",
            marginBottom: 6,
          }}
        >
          Created by <strong style={{ color: "#fff" }}>Bhumistha Sahoo</strong>
        </div>
        <div className="side-section">Platform</div>
        {navButton("home", "⌂", "Home")}
        {navButton("dashboard", "▦", "Dashboard")}
        {navButton("chat", "◌", "Legal Chat")}
        {navButton("verify", "✓", "Verify a Claim")}
        {navButton("documents", "□", "Document Analysis")}
        {navButton("research", "⌕", "Legal Research")}
        <div className="side-section">Information</div>
        {navButton("how", "▤", "How it works")}
        {navButton("trust", "◇", "Trust & limits")}
        <div className="sidebar-bottom">
          <div className="status-mini">
            <span
              className={
                "status-dot " + (dbOk === null ? "" : dbOk ? "ok" : "bad")
              }
            />
            <span>
              {dbOk === null
                ? "Checking database…"
                : dbOk
                  ? `Postgres connected · ${stats?.sources ?? 0} sources`
                  : "Database unavailable"}
            </span>
          </div>
          {navButton("history", "◷", "History")}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="btn ghost mobile-menu"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              ☰
            </button>
            <div className="crumb">
              AI Legal Assistant using RAG · {VIEW_NAMES[view]}
            </div>
          </div>
          <div className="top-actions">
            <button className="btn ghost" onClick={() => go("history")}>
              ◷ History
            </button>
          </div>
        </header>

        {view === "home" && (
          <section className="view">
            <div className="hero">
              <div className="hero-grid">
                <div>
                  <div className="eyebrow">
                    <span className="dot" />
                    Evidence-aware legal assistance
                  </div>
                  <h1>Understand the law. Verify the facts.</h1>
                  <p className="sub">
                    Ask legal questions, examine documents, verify legal claims and
                    find relevant sources — every answer is grounded in passages
                    retrieved from a Postgres-backed legal corpus.
                  </p>
                  <div className="hero-ctas">
                    <button className="btn" onClick={() => go("chat")}>
                      Ask a legal question
                    </button>
                    <button className="btn ghost" onClick={() => go("verify")}>
                      Verify a claim
                    </button>
                    <button className="btn ghost" onClick={() => go("documents")}>
                      Analyze a document
                    </button>
                  </div>
                  <p className="muted" style={{ marginTop: 17 }}>
                    This interface is informational and does not replace advice
                    from a qualified lawyer.
                  </p>
                  <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 12 }}>
                    Created by <strong>Bhumistha Sahoo</strong>
                  </p>
                </div>
                <div className="chain">
                  <div className="chain-title">
                    <span>Evidence chain</span>
                    <span>01 → 04</span>
                  </div>
                  <div className="chain-step">
                    <div className="idx">01</div>
                    <div>
                      <strong>Understand</strong>
                      <span>Interpret the question or document.</span>
                    </div>
                  </div>
                  <div className="chain-step">
                    <div className="idx">02</div>
                    <div>
                      <strong>Retrieve</strong>
                      <span>
                        Rank statutes, judgments and your document chunks in Postgres.
                      </span>
                    </div>
                  </div>
                  <div className="chain-step">
                    <div className="idx">03</div>
                    <div>
                      <strong>Verify</strong>
                      <span>Compare claims against retrieved evidence.</span>
                    </div>
                  </div>
                  <div className="chain-step chain-final">
                    <div className="idx">04</div>
                    <div>
                      <strong>Explain with evidence</strong>
                      <span>Answer, verification signals and citations.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="page-head">
                <div className="eyebrow">
                  <span className="dot" />
                  Explore the workspace
                </div>
                <h2 style={{ fontSize: 28, margin: "0 0 7px" }}>
                  Everything in one place
                </h2>
                <p>
                  {stats
                    ? `${stats.sources} curated legal sources, ${stats.documents} uploaded document(s) and ${stats.chunks} indexed passages are currently searchable.`
                    : "Loading corpus status…"}
                </p>
              </div>
              <div className="grid3">
                <div className="domain-card">
                  <h3>Legal questions</h3>
                  <p>
                    Ask questions and receive a plain-language answer with legal
                    reasoning, next steps and citations.
                  </p>
                  <button
                    className="btn ghost"
                    style={{ marginTop: 14 }}
                    onClick={() => go("chat")}
                  >
                    Open Legal Chat →
                  </button>
                </div>
                <div className="domain-card">
                  <h3>Claims</h3>
                  <p>
                    Test a legal statement and inspect supporting or contradicting
                    statutory evidence.
                  </p>
                  <button
                    className="btn ghost"
                    style={{ marginTop: 14 }}
                    onClick={() => go("verify")}
                  >
                    Open Claim Verification →
                  </button>
                </div>
                <div className="domain-card">
                  <h3>Documents</h3>
                  <p>
                    Upload a contract or notice and inspect clauses, risks,
                    questions and related laws.
                  </p>
                  <button
                    className="btn ghost"
                    style={{ marginTop: 14 }}
                    onClick={() => go("documents")}
                  >
                    Open Document Analysis →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "dashboard" && (
          <section className="view">
            <div className="page-head">
              <div className="eyebrow">
                <span className="dot" />
                Overview
              </div>
              <h1>Dashboard</h1>
              <p>
                Everything stored server-side in Postgres: questions, documents,
                claim verifications and the retrieval index.
              </p>
            </div>

            <div className="quick-grid">
              <button className="quick" onClick={() => go("chat")}>
                <div style={{ fontSize: 24, color: "var(--blue)" }}>◌</div>
                <h3>Ask a legal question</h3>
                <p>Retrieve evidence and generate a grounded response.</p>
              </button>
              <button className="quick" onClick={() => go("verify")}>
                <div style={{ fontSize: 24, color: "var(--blue)" }}>✓</div>
                <h3>Verify a claim</h3>
                <p>Check a statement against retrieved sources.</p>
              </button>
              <button className="quick" onClick={() => go("documents")}>
                <div style={{ fontSize: 24, color: "var(--blue)" }}>□</div>
                <h3>Analyze a document</h3>
                <p>Find clauses, issues and relevant laws.</p>
              </button>
            </div>

            <div className="stat-grid">
              <div className="stat">
                <div className="label">Questions</div>
                <div className="value">{stats?.questions ?? "—"}</div>
                <div className="sub">Asked in Legal Chat</div>
              </div>
              <div className="stat">
                <div className="label">Documents</div>
                <div className="value">{stats?.documents ?? "—"}</div>
                <div className="sub">{stats?.chunks ?? 0} indexed passages</div>
              </div>
              <div className="stat">
                <div className="label">Verifications</div>
                <div className="value">{stats?.verifications ?? "—"}</div>
                <div className="sub">Claims checked</div>
              </div>
              <div className="stat">
                <div className="label">Corpus</div>
                <div className="value">{stats?.sources ?? "—"}</div>
                <div className="sub">Curated legal sources</div>
              </div>
            </div>

            <div className="grid2">
              <div className="panel">
                <div className="panel-head">
                  <h2>Recent questions</h2>
                  <button className="btn ghost sm" onClick={() => go("chat")}>
                    Ask →
                  </button>
                </div>
                <div className="rows">
                  {data?.recentChats.length ? (
                    data.recentChats.map((c) => (
                      <div className="row" key={c.id}>
                        <div>
                          <div className="q">{c.title}</div>
                          <div className="meta">{formatDate(c.updated_at)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty">No questions yet.</div>
                  )}
                </div>
              </div>
              <div>
                <div className="panel" style={{ marginBottom: 18 }}>
                  <div className="panel-head">
                    <h2>Documents</h2>
                    <button className="btn ghost sm" onClick={() => go("documents")}>
                      Open →
                    </button>
                  </div>
                  <div className="rows">
                    {data?.recentDocs.length ? (
                      data.recentDocs.map((d) => (
                        <div className="row" key={d.id}>
                          <div>
                            <div className="q">{d.name}</div>
                            <div className="meta">
                              {d.pages ? `${d.pages} pages · ` : ""}
                              {formatDate(d.created_at)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty">No documents uploaded yet.</div>
                    )}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <h2>Claim verifications</h2>
                  </div>
                  <div className="rows">
                    {data?.recentClaims.length ? (
                      data.recentClaims.map((c) => (
                        <div className="row" key={c.id}>
                          <div>
                            <div className="q">{c.claim}</div>
                            <div className="meta">{formatDate(c.created_at)}</div>
                          </div>
                          <span className={"badge " + statusClass(c.status)}>
                            {c.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="empty">No claim verifications yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "chat" && <ChatView onActivity={refresh} />}
        {view === "verify" && <VerifyView onActivity={refresh} />}
        {view === "documents" && (
          <DocumentsView onActivity={refresh} goChat={() => go("chat")} />
        )}
        {view === "research" && <ResearchView onActivity={refresh} />}

        {view === "how" && (
          <section className="view">
            <div className="page-head">
              <div className="eyebrow">
                <span className="dot" />
                How it works
              </div>
              <h1>From question to evidence</h1>
              <p>
                Retrieval, verification, document analysis and source discovery run
                server-side against PostgreSQL.
              </p>
            </div>
            <div className="steps">
              <div className="step">
                <div className="n">01</div>
                <h3>Ask</h3>
                <p>Submit a legal question, claim or document in ordinary language.</p>
              </div>
              <div className="step">
                <div className="n">02</div>
                <h3>Retrieve</h3>
                <p>
                  Term-frequency scoring over the curated corpus plus Postgres
                  full-text search over your document chunks.
                </p>
              </div>
              <div className="step">
                <div className="n">03</div>
                <h3>Verify</h3>
                <p>
                  Claims are compared with retrieved text for support, qualification
                  or contradiction.
                </p>
              </div>
              <div className="step">
                <div className="n">04</div>
                <h3>Explain</h3>
                <p>
                  Answer, confidence, coverage and citations are persisted and shown
                  together.
                </p>
              </div>
            </div>
            <div className="section">
              <div className="grid3">
                <div className="panel">
                  <div className="panel-head">
                    <h2>Storage</h2>
                  </div>
                  <div className="panel-body">
                    <p className="muted">
                      PostgreSQL via Drizzle ORM: legal sources, documents, chunks,
                      conversations, messages, verifications and activity.
                    </p>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <h2>Extraction</h2>
                  </div>
                  <div className="panel-body">
                    <p className="muted">
                      PDF and DOCX text is extracted in the browser, then chunked by
                      page server-side for retrieval.
                    </p>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <h2>Deployment</h2>
                  </div>
                  <div className="panel-body">
                    <p className="muted">
                      Ships with a netlify.toml and the Next.js runtime plugin; point
                      DATABASE_URL at any hosted Postgres instance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "trust" && (
          <section className="view">
            <div className="page-head">
              <div className="eyebrow">
                <span className="dot" />
                Trust &amp; limits
              </div>
              <h1>Use evidence, not just confidence</h1>
              <p>This platform makes the evidence behind an answer visible.</p>
              <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>
                Created by <strong>Bhumistha Sahoo</strong>
              </p>
            </div>
            <div className="grid3">
              <div className="panel">
                <div className="panel-head">
                  <h2>Evidence signals</h2>
                </div>
                <div className="panel-body">
                  <p className="muted">
                    Every answer reports retrieved sources, relevance, confidence and
                    evidence coverage so you can judge how well grounded it is.
                  </p>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h2>Source limitations</h2>
                </div>
                <div className="panel-body">
                  <p className="muted">
                    The corpus is curated and finite. Thresholds, limitation periods
                    and section numbers change by amendment or notification — always
                    confirm the current text of a provision.
                  </p>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h2>Legal disclaimer</h2>
                </div>
                <div className="panel-body">
                  <p className="muted">
                    This is an informational research interface. It is not a
                    substitute for advice from a qualified legal professional.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "history" && (
          <section className="view">
            <div className="page-head">
              <div className="eyebrow">
                <span className="dot" />
                Your activity
              </div>
              <h1>History</h1>
              <p>
                Questions, claim verifications, document analyses and searches are
                recorded in the database.
              </p>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h2>Saved activity</h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="muted">
                    {activity.length} item{activity.length === 1 ? "" : "s"}
                  </span>
                  <button className="btn ghost sm" onClick={() => void clearHistory()}>
                    Clear history
                  </button>
                </div>
              </div>
              <div className="rows">
                {activity.length ? (
                  activity.map((item) => (
                    <div className="row history-row" key={item.id}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 7,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span className="badge verified">
                            {VIEW_NAMES[item.type as View] ?? item.type}
                          </span>
                          <span className="muted">{formatDate(item.createdAt)}</span>
                        </div>
                        <div className="q" style={{ marginTop: 6 }}>
                          {item.title}
                        </div>
                        <div className="meta">{item.summary}</div>
                      </div>
                      <div style={{ display: "flex", gap: 7 }}>
                        <button
                          className="btn ghost sm"
                          onClick={() =>
                            go(
                              (item.type === "chat"
                                ? "chat"
                                : item.type === "verify"
                                  ? "verify"
                                  : item.type === "document"
                                    ? "documents"
                                    : "research") as View,
                            )
                          }
                        >
                          Open
                        </button>
                        <button
                          className="btn ghost sm"
                          onClick={() => void deleteActivity(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty">
                    No activity yet. Your questions and actions will appear here.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
