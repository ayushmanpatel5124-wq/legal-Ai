"use client";

import { useState } from "react";
import type { Hit, VerifyResponse } from "@/lib/types";
import { statusClass } from "@/lib/types";

const EXAMPLES = [
  "A consumer can file a complaint for a defective product.",
  "An employer can always terminate an employee without any notice.",
  "Section 420 of the IPC deals with cheating.",
  "A landlord can evict a tenant without notice at any time.",
];

function EvidenceRow({ hit, tone }: { hit: Hit; tone: "support" | "contradict" }) {
  return (
    <div className="ev-row">
      <div>
        <div className="title">{hit.title}</div>
        <div className="meta">{hit.citation}</div>
        <div className="meta" style={{ marginTop: 4 }}>
          {hit.excerpt}
        </div>
      </div>
      <span className={"tag " + tone}>
        {tone === "support" ? "Supports" : "Qualifies / contradicts"}
      </span>
    </div>
  );
}

export default function VerifyView({ onActivity }: { onActivity: () => void }) {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerifyResponse | null>(null);

  async function verify() {
    const value = claim.trim();
    if (!value) {
      setError("Please enter a legal claim first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      setResult(data);
      onActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="view">
      <div className="page-head">
        <div className="eyebrow">
          <span className="dot" />
          Evidence check
        </div>
        <h1>Verify a Legal Claim</h1>
        <p>
          Enter a legal statement. The engine retrieves primary sources from the
          corpus, compares the claim against them and reports supporting or
          qualifying evidence.
        </p>
      </div>

      <div className="claim-box">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Example: A tenant can always be evicted without notice."
        />
        <div>
          <button className="btn" onClick={() => void verify()} disabled={loading}>
            {loading ? <span className="spinner" /> : "Verify claim"}
          </button>
        </div>
        <div className="examples">
          <span className="muted">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e} className="example" onClick={() => setClaim(e)}>
              &quot;{e}&quot;
            </button>
          ))}
        </div>
      </div>

      {error && <div className="notice error">{error}</div>}

      {result && (
        <>
          <div className="flow">
            {["Claim received", "Evidence retrieved", "Claim compared", "Result generated"].map(
              (t, i) => (
                <div className="flow-step done" key={t}>
                  <div className="n">0{i + 1}</div>
                  <div className="t">{t}</div>
                </div>
              ),
            )}
          </div>

          <div className="result-status-row">
            <div className="claim-echo">&quot;{result.claim}&quot;</div>
            <span className={"status-pill " + statusClass(result.status)}>
              {result.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="grid2">
            <div>
              <div className="panel" style={{ marginBottom: 18 }}>
                <div className="panel-head">
                  <h2>Explanation</h2>
                </div>
                <div className="panel-body">
                  <p className="muted">{result.explanation}</p>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>Retrieved evidence</h2>
                  <span className="muted">{result.hits.length} source(s)</span>
                </div>
                <div className="panel-body">
                  {result.contradicting.map((h, i) => (
                    <EvidenceRow key={"c" + i} hit={h} tone="contradict" />
                  ))}
                  {result.supporting.map((h, i) => (
                    <EvidenceRow key={"s" + i} hit={h} tone="support" />
                  ))}
                  {!result.hits.length && (
                    <div className="muted">No relevant evidence was retrieved.</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="panel">
                <div className="panel-head">
                  <h2>Verification metrics</h2>
                </div>
                <div className="panel-body">
                  <div className="metric-grid">
                    <div className="metric-cell">
                      <div className="k">Status</div>
                      <div className="v" style={{ fontSize: 14 }}>
                        {result.status.replace(/_/g, " ")}
                      </div>
                    </div>
                    <div className="metric-cell">
                      <div className="k">Confidence</div>
                      <div className="v">{Math.round(result.confidence * 100)}%</div>
                    </div>
                    <div className="metric-cell">
                      <div className="k">Evidence coverage</div>
                      <div className="v">{Math.round(result.coverage * 100)}%</div>
                    </div>
                    <div className="metric-cell">
                      <div className="k">Sources</div>
                      <div className="v">{result.hits.length}</div>
                    </div>
                  </div>
                  <p className="muted" style={{ marginTop: 14 }}>
                    Verification compares the wording of the claim against retrieved
                    statutory text. It is an evidence signal, not a legal opinion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
