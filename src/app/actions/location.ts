"use server";

import { cookies } from "next/headers";
import { isValidPin } from "@/lib/pin";

// Persist the user's PIN in a cookie so filtering survives navigation.
export async function setPin(pin: string) {
  const store = await cookies();
  if (!pin) {
    store.delete("pin");
    return;
  }
  if (!isValidPin(pin)) return;
  store.set("pin", pin, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}
