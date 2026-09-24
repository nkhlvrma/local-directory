// Builds a PostgREST `.or()` filter that matches `term` as a case-insensitive
// substring of any of `columns`.
//
// User text can't be pasted into an or() string as-is: a comma or parenthesis
// is PostgREST syntax, so a search for "tailor, dalanwala" failed with "failed
// to parse logic tree" and came back as zero results. Each value is therefore
// double-quoted (PostgREST's escape for reserved characters), after escaping
// LIKE's own wildcards so a literal % or _ in the term stays literal.
export function ilikeAnyFilter(columns: string[], term: string): string {
  const like = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
  const quoted = `"${like.replace(/["\\]/g, "\\$&")}"`;
  return columns.map((c) => `${c}.ilike.${quoted}`).join(",");
}
