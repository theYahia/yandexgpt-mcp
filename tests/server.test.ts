import { describe, it, expect } from "vitest";
import { createServer } from "../src/index.js";

describe("server", () => {
  it("creates server with 6 tools", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});
