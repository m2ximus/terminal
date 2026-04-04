import { describe, it, expect } from "vitest";
import { getTrackAwareLockedMessage } from "@/lib/commands/executor";

describe("getTrackAwareLockedMessage", () => {
  it("returns track hint when command exists in another track", () => {
    const msg = getTrackAwareLockedMessage("grep");
    expect(msg).toContain("Terminal Advanced");
  });

  it("returns generic message for unknown commands", () => {
    const msg = getTrackAwareLockedMessage("unknown-command");
    expect(msg).toBeTruthy();
    expect(msg).not.toContain("track");
  });

  it("returns track hint for commands in terminal-basics", () => {
    const msg = getTrackAwareLockedMessage("pwd");
    expect(msg).toContain("Terminal Basics");
  });
});
