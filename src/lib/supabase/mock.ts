// Minimal fake Supabase client covering the read surface the app uses.
// Enabled when NEXT_PUBLIC_SUPABASE_URL is missing. Writes are no-ops that
// return a friendly error so the UI stays functional.

import { MOCK_TABLES } from "@/lib/mock-data";

type Row = Record<string, unknown>;
type Filter = { col: string; val: unknown };

function getPath(row: Row, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Row)[key];
    }
    return undefined;
  }, row);
}

class MockQuery implements PromiseLike<{ data: unknown; error: null }> {
  private filters: Filter[] = [];
  private single = false;

  constructor(private rows: Row[]) {}

  select(_cols?: string) {
    void _cols;
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push({ col, val });
    return this;
  }
  order(_col: string, _opts?: unknown) {
    void _col;
    void _opts;
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }

  private resolve() {
    let out = this.rows;
    for (const { col, val } of this.filters) {
      out = out.filter((r) => getPath(r, col) === val);
    }
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

export function createMockSupabaseClient() {
  return {
    from(table: string) {
      const rows = MOCK_TABLES[table] ?? [];
      const q = new MockQuery(rows);
      return Object.assign(q, {
        insert: async () => readOnlyError,
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
        // In demo mode everyone is the demo admin — matches admin_users row.
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
        // Login form is bypassed in mock mode; this is a safety return.
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
