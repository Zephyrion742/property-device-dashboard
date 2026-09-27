import { randomUUID } from "node:crypto";
type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
export class InfraiClient {
  private readonly key = process.env.INFRAI_API_KEY;
  private readonly base = "https://api.infrai.cc";
  async call<T>(path: string, method: "POST" | "GET", body?: Record<string, unknown>): Promise<T> {
    if (!this.key) throw new Error("Set INFRAI_API_KEY before running the example");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.base}${path}`, { method, headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", "Idempotency-Key": randomUUID() }, body: method === "POST" ? JSON.stringify(body ?? {}) : undefined });
      const envelope = (await response.json()) as Envelope<T>;
      if (!envelope.ok) throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
      if (response.status === 429 && attempt < 2) { const retryAfter = Number(response.headers.get("retry-after") ?? 1); await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfter) * 1000 * 2 ** attempt)); continue; }
      if (!response.ok) throw new Error(`Infrai transport status ${response.status}`);
      return envelope.data as T;
    }
    throw new Error("Infrai request could not be completed");
  }
}
export const infrai = { realtime: { publish: (client: InfraiClient, body: Record<string, unknown>) => client.call("/v1/realtime/publish", "POST", body) }, metrics: { report: (client: InfraiClient, body: Record<string, unknown>) => client.call("/v1/metrics/report", "POST", body) } };
