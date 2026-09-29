import {
  pgTable,
  serial,
  text,
  integer,
  real,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/** Curated legal corpus used for retrieval. */
export const legalSources = pgTable(
  "legal_sources",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    citation: text("citation").notNull(),
    sourceType: text("source_type").notNull(), // statute | judgment | notification
    domain: text("domain").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    keywords: text("keywords").array().notNull().default([]),
    authorityScore: real("authority_score").notNull().default(0.8),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("legal_sources_domain_idx").on(t.domain)],
);

/** Uploaded documents (text extracted in the browser, stored server-side). */
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mimeType: text("mime_type"),
  pages: integer("pages"),
  sizeBytes: integer("size_bytes"),
  charCount: integer("char_count").notNull().default(0),
  text: text("text").notNull(),
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Chunked document passages for retrieval. */
export const documentChunks = pgTable(
  "document_chunks",
  {
    id: serial("id").primaryKey(),
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    page: integer("page"),
    content: text("content").notNull(),
  },
  (t) => [index("document_chunks_doc_idx").on(t.documentId)],
);

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user | assistant
    content: text("content").notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  claim: text("claim").notNull(),
  status: text("status").notNull(),
  confidence: real("confidence").notNull().default(0),
  coverage: real("coverage").notNull().default(0),
  explanation: text("explanation").notNull(),
  evidence: jsonb("evidence"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Unified activity feed powering the History view. */
export const activity = pgTable(
  "activity",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(), // chat | verify | document | research
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    refId: integer("ref_id"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("activity_type_idx").on(t.type)],
);
