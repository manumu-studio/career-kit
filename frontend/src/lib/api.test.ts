/** Unit tests for optimizeCV API client behavior. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockOptimizationResult } from "@/test/mocks";

async function loadApiModule() {
  vi.resetModules();
  vi.doMock("@/lib/env", () => ({
    env: { NEXT_PUBLIC_API_URL: "http://localhost:8000" },
  }));
  return import("@/lib/api");
}

describe("optimizeCV", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns parsed result on success", async () => {
    const expected = mockOptimizationResult();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => expected,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { optimizeCV } = await loadApiModule();
    const file = new File(["pdf-content"], "resume.pdf", { type: "application/pdf" });
    const result = await optimizeCV(file, "Need FastAPI experience");

    expect(result).toEqual(expected);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/optimize",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws ApiError with server detail message for json error bodies", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ detail: "LLM failed" }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { optimizeCV, ApiError } = await loadApiModule();
    const file = new File(["pdf-content"], "resume.pdf", { type: "application/pdf" });

    const err = await optimizeCV(file, "Need FastAPI experience").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as InstanceType<typeof ApiError>).message).toBe("LLM failed");
    expect((err as InstanceType<typeof ApiError>).status).toBe(500);
  });

  it("throws ApiError with generic message when error body is not json", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { optimizeCV, ApiError } = await loadApiModule();
    const file = new File(["pdf-content"], "resume.pdf", { type: "application/pdf" });
    const err = await optimizeCV(file, "Need FastAPI experience").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as Error).message).toBe("Request failed (500)");
  });

  it("propagates network errors", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("Network failure");
    });
    vi.stubGlobal("fetch", fetchMock);

    const { optimizeCV } = await loadApiModule();
    const file = new File(["pdf-content"], "resume.pdf", { type: "application/pdf" });

    await expect(optimizeCV(file, "Need FastAPI experience")).rejects.toThrow("Network failure");
  });
});
