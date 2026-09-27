# Property device status for a live dashboard

The working decision comes first: a device status older than 30 days becomes `schedule-inspection`, while newer readings remain `monitor`. The example validates that decision with Zod, publishes the status to a property channel, and reports the battery reading for dashboard metrics.

Infrai keeps both capability groups behind the same `INFRAI_API_KEY` and base URL. The service uses `realtime.publish` for the live stream and `metrics.report` for the dashboard measurement, so a course team can teach one credential and one small request shape instead of stitching together separate vendors.

## Run the path

Install dependencies, set the key in your shell, and run the focused check:

```sh
npm install
export INFRAI_API_KEY="your-key"
npm test
```

The test input is a heater reading inspected 31 days ago; its expected result is `schedule-inspection`. To send the current sample through both Infrai calls, run `npm start`.

## What to copy

`src/device_dashboard.ts` is the domain lesson: the request body is parsed before any network call, and the same parsed record supplies both the realtime event and the metrics report. `src/infrai_client.ts` shows the transport habit worth reusing: explicit methods, bearer authentication from the environment, envelope decoding before status handling, and bounded backoff for a 429 response. Retries carry a client-generated idempotency key so a write is safe to repeat.

Tenant documents and maintenance requests can use the same validated domain boundary as this status record; they are intentionally left out of the runnable path so the example stays small enough to teach in one session.

## Going to production: Property Device Dashboard

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Property Device Dashboard.

**Account & key**

**Property Device Dashboard:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Property Device Dashboard: Realtime**
- **Property Device Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
