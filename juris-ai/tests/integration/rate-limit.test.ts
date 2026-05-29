import { describe, it, expect } from "vitest";

import { RATE_LIMITS } from "@/lib/constants";

describe("Rate Limits", () => {
  it("should have sensible default limits", () => {
    expect(RATE_LIMITS.CHAT_REQUESTS_PER_MINUTE).toBeGreaterThan(0);
    expect(RATE_LIMITS.API_REQUESTS_PER_MINUTE).toBeGreaterThan(0);
    expect(RATE_LIMITS.DOCUMENT_UPLOADS_PER_HOUR).toBeGreaterThan(0);
  });

  it("should have chat limit less than API limit", () => {
    expect(RATE_LIMITS.CHAT_REQUESTS_PER_MINUTE).toBeLessThan(
      RATE_LIMITS.API_REQUESTS_PER_MINUTE
    );
  });
});
