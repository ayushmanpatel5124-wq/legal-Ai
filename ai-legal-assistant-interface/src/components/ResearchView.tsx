"use client";

import { useState } from "react";
import type { Hit } from "@/lib/types";

const DOMAINS = [
  "Constitutional",
  "Criminal",
  "Civil",
  "Consumer",
  "Corporate",
  "Labour",
  "Property",
  "Family",
  "Tax",
];

const TYPES = [
  { key: "all", label: "All" },
  { key: "statute", label: "Statute" },
  { key: "judgment", label: "Judgment" },
  { key: "notification", label: "Notification" },
];

export default function ResearchView({ onActivity }: { onActivity: () => void }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(q = query, d = domain, t = type) {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), log: "1" });
      if (d) params.set("domain", d);
      if (t && t !== "all") params.set("type", t);
      const res = await fetch(`/api/research?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
      onActivity();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="view">
      <div className="page-head">
        <div className="eyebrow">
          <span className="dot" />
          Source discovery
        </div>
        <h1>Legal Research</h1>
        <p>
          Search the curated statutory and case-law index stored in Postgres,
          together with passages from your uploaded documents.
        </p>
      </div>

      <div className="research-layout">
        <aside className="filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Legal domain</label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                void search(query, e.target.value, type);
              }}
            >
              <option value="">All domains</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Source type</label>
            <div className="chips">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  className={"chip" + (type === t.key ? " active" : "")}
                  onClick={() => {
                    setType(t.key);
                    void search(query, domain, t.key);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button
            className="btn ghost"
            style={{ width: "100%" }}
            onClick={() => {
              setQuery("");
              setDomain("");
              setType("all");
              setResults(null);
            }}
          >
            Clear
          </button>
        </aside>

        <div>
          <div className="toolbar">
            <input
              className="search-input"
              value={query}
              placeholder="Search statutes, judgments, provisions, topics…"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void search();
              }}
            />
            <button className="btn" onClick={() => void search()} disabled={loading}>
              {loading ? <span className="spinner" /> : "Search"}
            </button>
          </div>

          <div className="muted" style={{ marginBottom: 12 }}>
            {results === null
              ? "Enter a query to search the index."
              : `${results.length} result${results.length === 1 ? "" : "s"} retrieved`}
          </div>

          {results?.map((r, i) => (
            <div className="result-card" key={i}>
              <div className="result-badges">
                <span className="type-badge">
                  {r.kind === "document" ? "DOCUMENT" : r.sourceType}
                </span>
                <span className="type-badge">{r.domain}</span>
              </div>
              <div className="result-title">{r.title}</div>
              <div className="result-meta">{r.citation}</div>
              <div className="result-explain">{r.excerpt}</div>
              <div className="result-bottom">
                <span className="relevance">
                  {Math.round(r.relevance * 100)}% relevance
                </span>
                <span>Retrieved from Postgres index</span>
              </div>
            </div>
          ))}

          {results !== null && !results.length && (
            <div className="empty">
              No matching source. Try a broader legal term, or upload a relevant
              document so its passages become searchable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
