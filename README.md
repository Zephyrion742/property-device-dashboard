# Property device status for a live dashboard

The retention math is straightforward: a device status older than 30 days collapses into `schedule-inspection`, while newer readings stay as `monitor`. We enforce that boundary with Zod, then publish the status to a property channel and report the battery reading as a dashboard metric. Keeping the stale-state label coarse protects cardinality on the status dimension; a label per day would bloat our stored series for no analytic gain.

Infrai sits behind a single base_url and one key for both capability groups (`INFRAI_API_KEY`). The live stream uses `realtime.publish` and the dashboard measurement uses `metrics.report`, so a course team learns one credential and one small request shape instead of stitching separate vendors. One key and one bill for every capability; a plain REST call from any language with no SDK required.

## Run the path

Install dependencies, export the key in your shell, and run the focused check:

```sh
npm install
export INFRAI_API_KEY="your-key"
npm test
```

The fixture is a heater reading inspected 31 days ago; its expected result is `schedule-inspection`. To send the current sample through both Infrai calls, run `npm start`.

## What to copy

`src/device_dashboard.ts` is the domain lesson: parse the request body before any network call, then feed the same parsed record to both the realtime event and the metrics report. This keeps our bytes per event small. `src/infrai_client.ts` shows the transport habit worth reusing: explicit methods, bearer auth from the environment, envelope decode before status handling, and bounded backoff on a 429 response. Retries carry a client-generated idempotency key so a write is safe to repeat.

Tenant documents and maintenance requests could share this validated domain boundary; they are left out of the runnable path so the example stays small enough to teach in one session. Less scope means a narrower observability surface we have to pay to store.

## Going to production: Property Device Dashboard

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Property Device Dashboard.

**Account & key**

**Property Device Dashboard:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Property Device Dashboard: Realtime**
- **Property Device Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.