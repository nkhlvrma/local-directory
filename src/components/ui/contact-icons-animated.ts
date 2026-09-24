// One async chunk for the three animated icons used by the contact buttons.
// Kept as its own module so the dynamic import in useContactIcons() has a
// single target that webpack can split away from the page bundle.
export { UploadIcon } from "./upload";
export { CheckIcon } from "./check";
export { PhoneCallIcon } from "./phone-call";
