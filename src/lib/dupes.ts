export type DuplicateHit = {
  id: string;
  name: string;
  status: string;
  whatsapp_number: string;
};

// Returns any existing listings that look like duplicates of the incoming
// submission. Matches by WhatsApp number (exact) or by name (case-insensitive
// contains match). Cheap, meant for warning users before insertion.
//
// The `admin` type is `unknown`-loose so both the SSR client and the
// service-role client work without generic gymnastics.
export async function findDuplicates(
  admin: unknown,
  { name, whatsapp }: { name: string; whatsapp: string },
): Promise<DuplicateHit[]> {
  const safe = name.replace(/[\\%_]/g, "\\$&");
  const { data } = await (admin as {
    from: (t: string) => {
      select: (c: string) => {
        or: (q: string) => { limit: (n: number) => PromiseLike<{ data: unknown }> };
      };
    };
  })
    .from("listings")
    .select("id, name, status, whatsapp_number")
    .or(`whatsapp_number.eq.${whatsapp},name.ilike.%${safe}%`)
    .limit(5);
  return (data as unknown as DuplicateHit[]) ?? [];
}
