import { z } from "zod";
import { InfraiClient, infrai } from "./infrai_client.ts";
export const statusSchema = z.object({ device_id: z.string().min(1), property_id: z.string().min(1), temperature_c: z.number(), battery_percent: z.number().min(0).max(100), inspected_at: z.string().datetime() });
export type DeviceStatus = z.infer<typeof statusSchema>;
export function inspectionReminder(status: DeviceStatus): string { return Date.now() - Date.parse(status.inspected_at) > 30 * 24 * 60 * 60 * 1000 ? "schedule-inspection" : "monitor"; }
export async function streamStatus(status: unknown): Promise<{ decision: string }> { const parsed = statusSchema.parse(status); const decision = inspectionReminder(parsed); const client = new InfraiClient(); await infrai.realtime.publish(client, { channel: `property:${parsed.property_id}`, event: "device.status", data: { ...parsed, decision }, account_id: parsed.property_id }); await infrai.metrics.report(client, { name: "device.battery_percent", value: parsed.battery_percent, type: "gauge" }); return { decision }; }
if (import.meta.main) { const sample = { device_id: "boiler-17", property_id: "building-a", temperature_c: 21.4, battery_percent: 82, inspected_at: new Date().toISOString() }; console.log(JSON.stringify(await streamStatus(sample))); }
