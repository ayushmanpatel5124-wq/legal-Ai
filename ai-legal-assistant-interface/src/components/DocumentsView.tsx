"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DocAnalysis, DocumentRecord } from "@/lib/types";
import { formatDate } from "@/lib/types";

type PdfLib = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{ items: { str?: string }[] }>;
      }>;
    }>;
  };
};

type MammothLib = {
  extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the required reader."));
    document.head.appendChild(script);
  });
}

async function extractPdf(file: File) {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  );
  const pdfjs = (window as unknown as { pdfjsLib?: PdfLib }).pdfjsLib;
  if (!pdfjs) throw new Error("The PDF reader could not be initialised.");
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += `\n[Page ${i}]\n${content.items.map((it) => it.str ?? "").join(" ")}`;
  }
  return { text, pages: pdf.numPages };
}

async function extractDocx(file: File) {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js",
  );
  const mammoth = (window as unknown as { mammoth?: MammothLib }).mammoth;
  if (!mammoth) throw new Error("The DOCX reader could not be initialised.");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: result.value, pages: null as number | null };
}

async function readFile(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type === "text/plain")
    return { text: await file.text(), pages: null as number | null };
  throw new Error("Supported formats are PDF, DOCX, TXT and MD.");
}

export default function DocumentsView({
  onActivity,
  goChat,
}: {
  onActivity: () => void;
  goChat: () => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selected, setSelected] = useState<DocumentRecord | null>(null);
  const [analysis, setAnalysis] = useState<DocAnalysis | null>(null);
  const [notice, setNotice] = useState<{ kind: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function handleFile(file: File) {
    setBusy(true);
    setNotice({ kind: "info", text: `Reading ${file.name}…` });
    try {
      const extracted = await readFile(file);
      if (!extracted.text || extracted.text.trim().length < 40)
        throw new Error(
          "No readable text was found. Scanned or image-only PDFs need OCR first.",
        );

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          text: extracted.text,
          pages: extracted.pages,
          sizeBytes: file.size,
          mimeType: file.type || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      setSelected(data.document);
      setAnalysis(data.analysis);
      setNotice({
        kind: "ok",
        text: `${file.name} was analysed and indexed into ${data.chunks} searchable passages.`,
      });
      void loadDocuments();
      onActivity();
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? err.message : "Unable to read the document.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function openDocument(id: number) {
    const res = await fetch(`/api/documents/${id}`);
    const data = await res.json();
    if (res.ok) {
      setSelected(data.document);
      setAnalysis(data.analysis);
    }
  }

  async function removeDocument(id: number) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (selected?.id === id) {
      setSelected(null);
      setAnalysis(null);
    }
    void loadDocuments();
    onActivity();
  }

  return (
    <div className="view">
      <div className="page-head">
        <div className="eyebrow">
          <span className="dot" />
          Document intelligence
        </div>
        <h1>Document Analysis</h1>
        <p>
          Upload a PDF, DOCX or TXT file. Text is extracted in your browser, then
          stored, chunked and indexed in Postgres so Legal Chat and Research can
          retrieve from it.
        </p>
      </div>

      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
      >
        <div style={{ fontSize: 28, color: "var(--blue)" }}>⇧</div>
        <h3>Drop a document here</h3>
        <p>or choose a file from your computer</p>
        <button
          className="btn"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? <span className="spinner" /> : "Choose file"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="muted" style={{ marginTop: 10 }}>
          Indexed documents become part of the retrieval corpus.
        </div>
      </div>

      {notice && <div className={"notice " + notice.kind}>{notice.text}</div>}

      {documents.length > 0 && (
        <div className="panel" style={{ marginBottom: 22 }}>
          <div className="panel-head">
            <h2>Indexed documents</h2>
            <span className="muted">{documents.length}</span>
          </div>
          <div className="rows">
            {documents.map((d) => (
              <div className="row" key={d.id}>
                <div>
                  <div className="q">{d.name}</div>
                  <div className="meta">
                    {d.pages ? `${d.pages} pages · ` : ""}
                    {d.charCount.toLocaleString()} chars · {formatDate(d.createdAt)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button className="btn ghost sm" onClick={() => void openDocument(d.id)}>
                    Open
                  </button>
                  <button className="btn ghost sm" onClick={() => void removeDocument(d.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && analysis && (
        <>
          <div className="doc-header">
            <div className="doc-id">
              <div className="doc-icon">□</div>
              <div>
                <div className="name">{selected.name}</div>
                <div className="meta">
                  {selected.pages ? `${selected.pages} pages · ` : ""}
                  {Math.round((selected.sizeBytes ?? 0) / 1024)} KB ·{" "}
                  {analysis.wordCount.toLocaleString()} words · ~
                  {analysis.readingTimeMinutes} min read
                </div>
              </div>
            </div>
            <span className="demo-tag">Indexed for retrieval</span>
          </div>

          <div className="grid2">
            <div>
              <div className="panel" style={{ marginBottom: 18 }}>
                <div className="panel-head">
                  <h2>Key clauses &amp; passages</h2>
                </div>
                <div className="panel-body">
                  {analysis.clauses.length ? (
                    analysis.clauses.map((c, i) => (
                      <div className="clause" key={i}>
                        <div className="clause-top">
                          <span className="title">Passage {i + 1}</span>
                          <span className={"risk " + c.risk}>{c.risk} risk</span>
                        </div>
                        <div className="clause-text">{c.text}</div>
                        <div className="clause-note">{c.note}</div>
                      </div>
                    ))
                  ) : (
                    <div className="muted">No substantial passages detected.</div>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>Potential issues</h2>
                </div>
                <div className="panel-body">
                  {analysis.issues.length ? (
                    analysis.issues.map((issue, i) => (
                      <div className="issue-row" key={i}>
                        <div style={{ color: "var(--serious)" }}>⚠</div>
                        <div>
                          <div className="title">
                            {issue.title}{" "}
                            <span className={"risk " + issue.severity}>
                              {issue.severity}
                            </span>
                          </div>
                          <div className="desc">{issue.description}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="muted">
                      No obvious issue patterns detected. This is not a legal opinion.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="panel" style={{ marginBottom: 18 }}>
                <div className="panel-head">
                  <h2>Summary</h2>
                </div>
                <div className="panel-body">
                  <p className="muted">{analysis.summary}</p>
                </div>
              </div>

              <div className="panel" style={{ marginBottom: 18 }}>
                <div className="panel-head">
                  <h2>Related laws retrieved</h2>
                </div>
                <div className="panel-body">
                  {analysis.relatedLaws.length ? (
                    analysis.relatedLaws.map((l, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l.title}</div>
                        <div className="muted">{l.citation}</div>
                      </div>
                    ))
                  ) : (
                    <span className="muted">No related statute matched.</span>
                  )}
                </div>
              </div>

              <div className="panel" style={{ marginBottom: 18 }}>
                <div className="panel-head">
                  <h2>Important terms</h2>
                </div>
                <div className="panel-body">
                  {analysis.terms.map((t) => (
                    <span className="law-chip" key={t.word}>
                      {t.word} × {t.count}
                    </span>
                  ))}
                </div>
              </div>

              <div className="panel" style={{ marginBottom: 18 }}>
                <div className="panel-head">
                  <h2>Questions to ask a lawyer</h2>
                </div>
                <div className="panel-body">
                  <ol>
                    {analysis.questions.map((q, i) => (
                      <li key={i} className="muted" style={{ marginBottom: 7 }}>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>RAG ready</h2>
                </div>
                <div className="panel-body">
                  <p className="muted" style={{ marginBottom: 12 }}>
                    This document is indexed. Ask questions in Legal Chat and the
                    assistant will retrieve its passages alongside statutory sources.
                  </p>
                  <button className="btn" onClick={goChat}>
                    Ask about this document →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
