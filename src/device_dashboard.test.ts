import assert from "node:assert/strict";
import { inspectionReminder, statusSchema } from "./device_dashboard.ts";
const input = { device_id: "heater-2", property_id: "building-a", temperature_c: 19, battery_percent: 70, inspected_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() };
assert.equal(statusSchema.parse(input).device_id, "heater-2");
assert.equal(inspectionReminder(input), "schedule-inspection");
console.log("inspection decision verified");
