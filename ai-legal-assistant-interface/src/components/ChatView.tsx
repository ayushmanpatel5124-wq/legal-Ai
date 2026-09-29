"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Answer, ChatTurn, ConversationSummary, Hit } from "@/lib/types";
import { formatDate } from "@/lib/types";

const SUGGESTIONS = [
  "My landlord wants to evict me without notice — is that allowed?",
  "What can I do about a defective product I bought online?",
  "What are my rights if a cheque I received bounced?",
  "Can my employer terminate me without notice or compensation?",
];

function AnswerCard({ answer }: { answer: Answer }) {
  return (
    <div className="answer-card">
      <div className="answer-block short">
        <h3>Plain-language answer</h3>
        <p>{answer.plain}</p>
      </div>
      {answer.legal ? (
        <div className="answer-block">
          <h3>Legal reasoning &amp; authority</h3>
          <p>{answer.legal}</p>
        </div>
      ) : null}
      <div className="answer-block">
        <h3>Suggested next steps</h3>
        <ol>
          {answer.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
      <div className="answer-block">
        <h3>Retrieved evidence ({answer.hits.length})</h3>
        {answer.hits.length ? (
          answer.hits.map((h, i) => (
            <div className="mini-source" key={i}>
              <span className="type-badge">
                {h.kind === "document" ? "DOCUMENT" : h.sourceType}
              </span>
              <strong style={{ display: "block", fontSize: 13, marginTop: 6 }}>
                {h.title}
              </strong>
              <div className="muted" style={{ marginTop: 3 }}>
                {h.citation} · {Math.round(h.relevance * 100)}% relevance
              </div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{h.excerpt}</div>
            </div>
          ))
        ) : (
          <div className="muted">No matching evidence was retrieved.</div>
        )}
      </div>
      <div className="answer-block">
        <h3>RAG status</h3>
        <div className="metric-grid">
          <div className="metric-cell">
            <div className="k">Confidence</div>
            <div className="v">{Math.round(answer.confidence * 100)}%</div>
          </div>
          <div className="metric-cell">
            <div className="k">Sources used</div>
            <div className="v">{answer.hits.length}</div>
          </div>
          <div className="metric-cell">
            <div className="k">Top relevance</div>
            <div className="v">
              {answer.hits.length
                ? Math.round(answer.hits[0].relevance * 100) + "%"
                : "—"}
            </div>
          </div>
          <div className="metric-cell">
            <div className="k">Mode</div>
            <div className="v" style={{ fontSize: 14 }}>
              Postgres RAG
            </div>
          </div>
        </div>
        <ul style={{ marginTop: 12 }}>
          {answer.caveats.map((c, i) => (
            <li key={i} className="muted" style={{ fontSize: 12.5 }}>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ChatView({ onActivity }: { onActivity: () => void }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState<Hit[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (threadRef.current)
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [turns, loading]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, conversationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setConversationId(data.conversationId);
      setTurns((prev) => [...prev, { question: q, answer: data.answer }]);
      setEvidence(data.answer.hits ?? []);
      void loadConversations();
      onActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(id: number) {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      if (!res.ok) return;
      const loaded: ChatTurn[] = [];
      let pendingQuestion = "";
      for (const m of data.messages as {
        role: string;
        content: string;
        payload: Answer | null;
      }[]) {
        if (m.role === "user") pendingQuestion = m.content;
        else if (m.payload)
          loaded.push({ question: pendingQuestion, answer: m.payload });
      }
      setTurns(loaded);
      setConversationId(id);
      setEvidence(loaded.length ? loaded[loaded.length - 1].answer.hits : []);
    } catch {
      /* ignore */
    }
  }

  function newConversation() {
    setTurns([]);
    setConversationId(null);
    setEvidence([]);
    setError("");
  }

  return (
    <div className="view">
      <div className="page-head">
        <div className="eyebrow">
          <span className="dot" />
          Legal assistance
        </div>
        <h1>Legal Chat</h1>
        <p>
          Describe your legal question in your own words. Every answer is grounded
          in passages retrieved from the Postgres legal corpus and your uploaded
          documents.
        </p>
      </div>

      <div className="chat-layout">
        <aside className="chat-side">
          <div className="chat-side-head">
            <h3>Conversations</h3>
            <button className="new-chat" onClick={newConversation}>
              ＋ New conversation
            </button>
          </div>
          <div className="conv-list">
            {conversations.length ? (
              conversations.map((c) => (
                <button
                  key={c.id}
                  className={
                    "conv-item" + (c.id === conversationId ? " active" : "")
                  }
                  onClick={() => openConversation(c.id)}
                >
                  {c.title}
                  <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 3 }}>
                    {formatDate(c.updated_at)}
                  </div>
                </button>
              ))
            ) : (
              <div className="conv-date">No conversations yet</div>
            )}
          </div>
        </aside>

        <div className="chat-main">
          <div className="thread" ref={threadRef}>
            <div className="thread-inner">
              {!turns.length && (
                <div className="welcome-card">
                  <h2>How can I help?</h2>
                  <p>
                    Ask in everyday language — you do not need legal terminology.
                    You get a plain-language answer, the legal reasoning with
                    citations, next steps and the retrieved evidence.
                  </p>
                  <div className="suggest">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => ask(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {turns.map((t, i) => (
                <div key={i}>
                  <div className="user-msg">{t.question}</div>
                  <AnswerCard answer={t.answer} />
                </div>
              ))}

              {loading && (
                <div className="muted" style={{ padding: "8px 2px" }}>
                  Retrieving evidence and composing an answer…
                </div>
              )}
              {error && <div className="notice error">{error}</div>}
            </div>
          </div>

          <div className="composer">
            <textarea
              value={input}
              placeholder="Ask a legal question…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void ask(input);
                }
              }}
            />
            <button
              className="btn"
              disabled={loading || !input.trim()}
              onClick={() => void ask(input)}
            >
              {loading ? <span className="spinner" /> : "Send"}
            </button>
          </div>
        </div>

        <aside className="evidence">
          <div className="panel-head">
            <h2>Evidence</h2>
            <span className="muted">{evidence.length} source(s)</span>
          </div>
          <div className="evidence-list">
            {evidence.length ? (
              evidence.map((h, i) => (
                <div className="source-card" key={i}>
                  <span className="type-badge">
                    {h.kind === "document" ? "DOCUMENT" : h.sourceType}
                  </span>
                  <div className="title">{h.title}</div>
                  <div className="meta">{h.citation}</div>
                  <div className="meta">
                    {h.domain} · {Math.round(h.relevance * 100)}% relevance
                  </div>
                  <div className="snippet">{h.excerpt}</div>
                </div>
              ))
            ) : (
              <div className="empty">
                Sources will appear here after you ask a question.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
