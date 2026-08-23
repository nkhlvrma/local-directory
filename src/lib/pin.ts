export function isValidPin(pin: string): boolean {
  return /^[1-9]\d{5}$/.test(pin);
}
