// Minimal fake Supabase client covering the read surface the app uses.
// Enabled when NEXT_PUBLIC_SUPABASE_URL is missing. Writes are no-ops that
// return a friendly error so the UI stays functional.

import { MOCK_TABLES } from "@/lib/mock-data";

type Row = Record<string, unknown>;
type EqFilter = { kind: "eq"; col: string; val: unknown };
type NeqFilter = { kind: "neq"; col: string; val: unknown };
type OrFilter = { kind: "or"; predicate: (r: Row) => boolean };
type Filter = EqFilter | NeqFilter | OrFilter;

function getPath(row: Row, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Row)[key];
    }
    return undefined;
  }, row);
}

// Parse a Supabase-style .or() filter string like
//   "name.ilike.%tiffin%,description.ilike.%tiffin%"
// into a single row predicate. Only the ilike operator is supported; other
// clauses become always-false so results shrink safely rather than lying.
function parseOr(spec: string): (r: Row) => boolean {
  const clauses = spec.split(",").map((c) => c.trim()).filter(Boolean);
  const preds = clauses.map((c) => {
    const m = /^([^.]+)\.ilike\.(.+)$/.exec(c);
    if (!m) return () => false;
    const col = m[1];
    // Strip %...% wildcards for a contains check.
    const needle = m[2].replace(/^%|%$/g, "").toLowerCase();
    return (r: Row) => {
      const v = getPath(r, col);
      return typeof v === "string" && v.toLowerCase().includes(needle);
    };
  });
  return (r) => preds.some((p) => p(r));
}

class MockQuery implements PromiseLike<{ data: unknown; error: null }> {
  private filters: Filter[] = [];
  private single = false;
  private limitN: number | null = null;
  private orderCol: string | null = null;
  private orderAsc = true;

  constructor(private rows: Row[]) {}

  select(_cols?: string) {
    void _cols;
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push({ kind: "eq", col, val });
    return this;
  }
  neq(col: string, val: unknown) {
    this.filters.push({ kind: "neq", col, val });
    return this;
  }
  or(spec: string) {
    this.filters.push({ kind: "or", predicate: parseOr(spec) });
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }

  private resolve() {
    let out = this.rows;
    for (const f of this.filters) {
      if (f.kind === "eq") out = out.filter((r) => getPath(r, f.col) === f.val);
      else if (f.kind === "neq") out = out.filter((r) => getPath(r, f.col) !== f.val);
      else out = out.filter((r) => f.predicate(r));
    }
    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAsc;
      out = [...out].sort((a, b) => {
        const av = getPath(a, col);
        const bv = getPath(b, col);
        if (av == null && bv == null) return 0;
        if (av == null) return asc ? -1 : 1;
        if (bv == null) return asc ? 1 : -1;
        if (av < bv) return asc ? -1 : 1;
        if (av > bv) return asc ? 1 : -1;
        return 0;
      });
    }
    if (this.limitN != null) out = out.slice(0, this.limitN);
    return this.single
      ? { data: out[0] ?? null, error: null }
      : { data: out, error: null };
  }

  then<TResult1 = { data: unknown; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.resolve()).then(onfulfilled, onrejected);
  }
}

const readOnlyError = {
  error: {
    message: "Demo mode: connect Supabase to enable writes.",
  },
};

// Tables where demo mode should actually accept inserts (rather than the
// generic read-only error) so client-side features that write — like
// analytics logging — keep working without a real Supabase project.
const WRITABLE_MOCK_TABLES = new Set(["analytics_events"]);

let mockIdCounter = 0;

export function createMockSupabaseClient() {
  return {
    from(table: string) {
      const rows = MOCK_TABLES[table] ?? [];
      const q = new MockQuery(rows);
      return Object.assign(q, {
        insert: async (values: Row | Row[]) => {
          if (!WRITABLE_MOCK_TABLES.has(table)) return readOnlyError;
          const arr = Array.isArray(values) ? values : [values];
          for (const v of arr) {
            rows.push({
              id: `mock-${table}-${++mockIdCounter}`,
              created_at: new Date().toISOString(),
              ...v,
            });
          }
          return { error: null };
        },
        update: () => ({
          eq: async () => readOnlyError,
        }),
        delete: () => ({
          eq: async () => readOnlyError,
        }),
      });
    },
    async rpc(_fn: string, _args?: unknown) {
      void _fn;
      void _args;
      return { data: null, error: null };
    },
    auth: {
      async getUser() {
        return {
          data: {
            user: {
              id: "demo-admin",
              email: "demo@localhost",
              aud: "authenticated",
            },
          },
          error: null,
        };
      },
      async signInWithPassword() {
        return {
          data: {
            user: { id: "demo-admin", email: "demo@localhost" },
            session: null,
          },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
    },
  };
}

export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}
