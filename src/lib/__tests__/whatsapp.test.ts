import { describe, it, expect } from "vitest";
import { whatsappLink, defaultOpener } from "../whatsapp";

describe("whatsappLink", () => {
  it("strips the leading + and any formatting", () => {
    expect(whatsappLink("+91 98123-45678", "hi")).toBe(
      "https://wa.me/919812345678?text=hi",
    );
  });

  it("percent-encodes the message", () => {
    const url = whatsappLink("+919812345678", "Hi Ravi's Café & Co!");
    expect(url).toContain("text=Hi%20Ravi's%20Caf%C3%A9%20%26%20Co!");
    // An unencoded & would silently truncate the prefilled message.
    expect(url.split("text=")[1]).not.toContain("&");
  });

  it("keeps digits only, even from a messy stored value", () => {
    expect(whatsappLink("(+91) 98123 45678 ", "x")).toContain("/919812345678?");
  });
});

describe("defaultOpener", () => {
  it("names the business and the site", () => {
    expect(defaultOpener("Tender Massages", "Local Directory")).toBe(
      "Hi Tender Massages, I found you on Local Directory. ",
    );
  });

  it("falls back to a generic site name", () => {
    expect(defaultOpener("Tender Massages")).toContain("the directory");
  });
});
