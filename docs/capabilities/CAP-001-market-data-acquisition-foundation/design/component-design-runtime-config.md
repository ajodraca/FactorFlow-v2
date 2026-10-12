---
artifact_schema_version: 1
artifact_id: CAP-001-component-design-runtime-config
artifact_type: component-design
artifact_version: 12
status: approved
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-05
updated: 2026-10-12
ai_provenance:
  agent_id: design-decomposition-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-12T15:10:00Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "7"
    - id: CAP-001-ux-design
      version: "5"
    - id: tech-stack
      version: "5"
    - id: CONST-SEC
      version: "1.2 (content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc)"
    - id: CAP-001-release
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-09T21:00:05Z
  reviewed_revision: sha256:f9c6b57a361b05c7ec0145737a3384d99eabaff5c2425a476864e73da2dbd77b
  review_artifact: "docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v7.md"
---

# Component: Runtime Configuration

**Status:** draft
**Capability:** CAP-001
**Owner:** Alvaro de Jodra
**Last Updated:** 2026-10-12

## 1. Overview

Runtime configuration loads and validates every setting both processes need from
the environment, and holds the Massive API key in memory without ever writing
it anywhere. It is a small component carrying one of the capability's sharper
requirements: AC-13 says the provider credential must not appear in the
repository, in log output, or in any view the product renders, and the only way
to keep that true is to make the value unreachable by every code path that
serialises.

It is shared by the application and ingestion containers, which read overlapping
but not identical sets of variables. Both fail their start when a required value
is missing, naming the variable and never its value.

Use cases addressed:

- Load database connection settings for both processes.
- Load the Massive API key for the ingestion process (AC-13).
- Load the interface bind address so the API cannot be published beyond loopback
  by accident (AC-14).
- Load the operational values the design leaves configurable: the provider
  request budget, the retry attempt limit, and the run claim staleness window.
- Report credential presence to `ingestion-api` as a boolean, so the Settings
  screen can say *Provider credential supplied* without the value existing
  outside the ingestion process.

Support matrix: both containers, one machine, environment variables supplied by
the owner's shell to the repository's `compose.yaml` (section 2.8). No
configuration file is read and none is written.

This component also owns the deployment definition (owner decision 2026-10-12):
the `Dockerfile` that builds the one release image, the `compose.yaml` that runs
it as the application and ingestion containers beside PostgreSQL, and the
`.dockerignore` that keeps non-release paths out of the build. Section 2.8
specifies all three. It closes blockers B1, B3 and B4 of
`docs/releases/CAP-001-release-v1.md` together with the changes it names in
`schema-migrator` and `ingestion-api`.

Dependencies: Pydantic, used for settings validation, which is already in the
stack for API models (tech stack).

## 2. Design Details

### 2.1 Placement

```
src/factorflow/config/settings.py    the settings models and loader
src/factorflow/config/redaction.py   the logging filter
```

### 2.2 Variables

Every variable carries the prefix `FACTORFLOW_`. Every value cites its source.
The operational timings were the last to be decided — they carried
`[REQUIRES INPUT]` markers rather than invented defaults per AGT-EVIDENCE-002
until the owner set them on 2026-09-05; section 2.2a records the derivation and
the relationships between them.

| Variable | Process | Required | Default | Source |
|----------|---------|----------|---------|--------|
| `FACTORFLOW_DATABASE_URL` | both | yes | none | C2, one PostgreSQL store |
| `FACTORFLOW_DATABASE_POOL_MIN` | both | no | 1 | SA-RES-001, pools must be bounded |
| `FACTORFLOW_DATABASE_POOL_MAX` | both | no | 4 | SA-RES-001; one owner, one active run |
| `FACTORFLOW_API_HOST` | application | no | `127.0.0.1` | AC-14, system design constraint 5.11 |
| `FACTORFLOW_API_PORT` | application | no | 8000 | conventional; no capability value |
| `FACTORFLOW_MASSIVE_API_KEY` | **both** | yes | none | AC-13; system design v3 constraint 5.12. Ingestion uses the value; the application reads presence only |
| `FACTORFLOW_MASSIVE_BASE_URL` | ingestion | no | `https://api.massive.com` | Verified by probe 2026-09-05; Massive documents no base URL. See `component-design-massive-client.md` section 2.6. Validated at start, `https` only (section 2.2c) |
| `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` | ingestion | yes | none | system design constraint 5.14, the budget is the owner's plan and cannot be defaulted |
| `FACTORFLOW_MASSIVE_MAX_ATTEMPTS` | ingestion | no | 3 | system design constraint 5.13, owner decision 2026-09-04 |
| `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS` | ingestion | no | 30 | Owner decision 2026-09-05; section 2.2a |
| `FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS` | ingestion | no | 2 | Owner decision 2026-09-05; section 2.2a |
| `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS` | ingestion | no | 300 | Owner decision 2026-09-05; section 2.2a |
| `FACTORFLOW_RUN_HEARTBEAT_SECONDS` | ingestion | no | 60 | Owner decision 2026-09-05; section 2.2a |
| `FACTORFLOW_RUN_STALE_AFTER_SECONDS` | both | no | 900 | Owner decision 2026-09-05; section 2.2a. Must exceed the heartbeat period by a wide margin |
| `FACTORFLOW_RUN_POLL_INTERVAL_SECONDS` | ingestion | no | 5 | Owner decision 2026-09-05; section 2.2a. How often an idle runner looks for work |
| `FACTORFLOW_LOG_LEVEL` | both | no | `INFO` | SA-LOG-001 |

`FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` is required rather than defaulted on
purpose. The design is tier-agnostic (system design constraint 5.14), so a
default would be a guess at the owner's plan, and guessing high means the
provider throttles every run while guessing low means every run is slower than
it needs to be.

### 2.2a Operational timing: the canonical set

Every timing value above is decided here and nowhere else. Components read them
from this component rather than defining their own, which is what makes the
relationships below checkable in one place.

The values were set by owner decision on 2026-09-05, and they derive from one
another rather than being chosen independently:

| Value | Default | Why this number |
|-------|---------|-----------------|
| Request timeout | 30s | Generous for the heaviest single call — a five-year daily-bar page — while still failing a hung request inside a run. With 3 attempts, one call is bounded at ~90s plus backoff |
| Initial backoff | 2s | Gives 2s, 4s, 8s across the three attempts. Long enough to ride out a brief provider blip, short enough not to slow a 3000-instrument run materially |
| Throttle wait budget | 300s (5 min) | The plan is unlimited (tech stack), so sustained throttling means something is wrong — the wrong plan is active, or the provider has an incident. Failing the instrument after five minutes surfaces that rather than burying it in a run that never ends |
| Heartbeat period | 60s | Refreshed between instruments, so this is an upper bound on how stale a healthy claim can look, not a timer |
| Staleness window | 900s (15 min) | Must exceed the worst case for one instrument. See below |
| Idle poll interval | 5s | A queued run starts within five seconds, and one query every five seconds is negligible against a store sized for 3000 instruments |

**The staleness window is derived, not chosen.** The heartbeat fires *between*
instruments, so a runner working on one slow instrument cannot refresh its claim
until that instrument finishes. The window must therefore exceed the worst-case
time for a single instrument, or the sweeper reclaims a healthy run — the exact
failure AC-20 exists to prevent.

Worst case for one instrument, with the values above:

- Four data types, each retried up to 3 attempts at a 30s timeout: 4 × 3 × 30s =
  **360s**
- Backoff between those attempts, 2s + 4s per data type: 4 × 6s = **24s**
- A throttle wait, bounded by the budget: up to **300s**

That totals roughly **11 minutes**. The 15-minute window clears it with about
four minutes of margin. The margin matters because paging is not in the
calculation: a five-year bar fetch may span several pages, each its own request,
and a pathological instrument could exceed the estimate.

**Invariants, enforced at load (section 2.4).** These are validated rather than
documented, because a violated relationship produces a run that fails
intermittently under load rather than an error at start:

1. `stale_after > heartbeat × 3`. A window narrower than a few heartbeats turns
   one slow instrument or one delayed sweep into a false reclaim. At the
   defaults this is 900 > 180.
2. `stale_after > (max_attempts × timeout × 4) + max_throttle_wait`. The
   derivation above, stated as a rule so it survives a change to any input. At
   the defaults this is 900 > 660.
3. `poll_interval < stale_after`. An idle runner that polls less often than the
   staleness window leaves claimable work sitting.
4. Every value is greater than zero, and `timeout`, `heartbeat` and
   `poll_interval` are each at least 1 second.

Invariant 2 is the one that binds: raising the timeout or the throttle budget
without raising the staleness window is the change most likely to look harmless
and to cause reclaim of healthy runs under a slow provider. The check makes that
combination refuse to start.

### 2.2b Credential reload: rotation without downtime

SEC-SEC-002 requires every secret to be rotatable without service downtime and
prohibits designs that need redeployment to rotate. This design meets it by
re-reading the provider credential from the environment at the one moment where
no work is in flight: when the runner claims a run.

**The mechanism.**

```python
# src/factorflow/config/settings.py

def read_provider_credential() -> SecretStr:
    """Re-read the provider key from the environment.

    Called by the runner at claim time, not at import. The value is never
    cached at module level, which is what makes rotation observable.
    """


def credential_fingerprint(key: SecretStr) -> str:
    """A short, non-reversible digest used only to detect change.

    SHA-256 of the value, truncated. It is never the value, never logged in
    full, and never compared against anything but another fingerprint.
    """
```

At claim time the runner computes the fingerprint of the current environment
value and compares it to the one its client was built with. When they differ it
closes the existing SDK `RESTClient` and constructs a new one; when they
match it keeps the client and its connection pool. A rotated key therefore takes
effect on the next run, with no restart and no interruption to a run already
under way.

**Why claim time, and not sooner or later.** Between runs the ingestion process
holds no provider connection that matters and no partially-written instrument,
so swapping the client there cannot corrupt anything. Re-reading mid-run would
mean changing credentials partway through a sequence of writes attributed to one
run, which makes a failure harder to explain than the restart it replaces.
Re-reading only at process start is what the rule prohibits.

**Rotation is therefore bounded by run duration, not by deployment.** The window
between rotating the key and the product using it is at most one run — and if
the old key is revoked during that run, the run fails on `CredentialRejected`
with the whole run marked `failed` rather than producing 3000 identical
per-instrument failures (`component-design-massive-client.md` section 2.4).
That is the honest outcome, and the next run picks up the new key.

**Why a fingerprint rather than comparing the values.** Comparing `SecretStr`
values directly would require unwrapping both, putting the plaintext into a
comparison expression and, on failure, potentially into a traceback. The
fingerprint is derived once, is not reversible, and is safe to hold in the
runner's state and to log at debug level as evidence that a rotation was
detected. It never substitutes for the key and is never sent anywhere.

**What is not covered.** The database URL is not reloaded. It is a secret under
SEC-SEC-001 and is held as a `SecretStr`, but the connection pool is
established at start and rotating it means recycling every connection, which is
a different problem with a different blast radius. No capability requires it,
and CAP-001 does not solve it; a capability that needs database credential
rotation owns that outcome. This is a scope statement, not a claim that the
requirement does not apply.

### 2.2c Provider base URL validation

`massive-client` passes `FACTORFLOW_MASSIVE_BASE_URL` to the SDK as `base`
(`component-design-massive-client.md` section 2.2b). The value therefore decides
which host receives the Restricted provider credential as `Authorization:
Bearer`, and over which scheme. An unvalidated value would let a typo, an
`http://` value or a foreign host receive the key, against SEC-ENC-001 and the
massive-client statement that every request is HTTPS. The expedited review of
2026-10-09 (`EXP-20261009-1-review-v1.md`, ER-001 and ER-002) found exactly
that gap, and the owner's direction of 2026-10-09 sets the rule below. The edge
cases are decided in DEC-0032.

**The rule.** `MassiveSettings` validates the value once, at process start. A
value that breaks any clause raises `ConfigurationError`, and the ingestion
process exits non-zero before it makes any provider request.

1. **Unset** means the default `https://api.massive.com`.
2. **The scheme must be `https`.** The comparison ignores case.
3. **The host must be present.**
4. **No userinfo.** A `user@` or `user:password@` part is rejected.
5. **The port is optional.** When present it must be an integer from 1 to
   65535.
6. **The path must be empty or a single `/`.** A single trailing `/` is removed
   before the value reaches the SDK, because the SDK builds every request URL as
   `base + path` with `path` starting with `/`. Any other path is rejected,
   because the SDK would prefix it to every endpoint in section 2.5 of the
   massive-client design, and no design governs a prefixed base.
7. **No query and no fragment.** A `?` or a `#` anywhere is rejected.
8. **No empty value, whitespace or control characters.** A variable that is set
   but empty is rejected rather than falling back to the default, because a
   silent fallback hides a misconfiguration (section 3). Surrounding whitespace
   is rejected, not stripped.
9. **The error names the variable and the clause, never the value.** The message
   reads `FACTORFLOW_MASSIVE_BASE_URL: <clause that failed>`. It never contains
   the submitted URL, because a userinfo part can carry a password, and it never
   contains the API key or any other setting's value (AC-13, SEC-ERR-001).

**Loopback `http`: conditional on CONST-SEC 1.2, non-release builds only
(DEC-0031, DEC-0033 to DEC-0037).** This design relies on the SEC-ENC-001
loopback test-double exception, recorded for this project in DEC-0036. The owner's direction also asks for `http` to
be accepted when the host is a loopback address, so that local test doubles
such as the DEC-0025 E2E stub (`http://127.0.0.1:8126`) can stand in for the
provider. The clause reads:

> 2a. `http` is accepted only when the host is exactly `127.0.0.1`, `::1`
> (written `[::1]` in the URL) or `localhost`, compared without case. No other
> address or form qualifies: not the rest of `127.0.0.0/8`, not `0.0.0.0`, not
> an expanded, IPv4-mapped or zone-qualified form of `::1`, not `localhost.`
> and not a `*.localhost` name. The set is `_LOOPBACK_HOSTS`, the one
> `ApiSettings` already uses for `FACTORFLOW_API_HOST`. When the host is
> `localhost`, every address it resolves to must be a loopback address. Clause
> 2a applies only in a non-release build, as defined below, and never in the
> release build.

As first written, clause 2a conflicted with SEC-ENC-001 and SEC-NDG-001 (both
Critical) and was held BLOCKED (DEC-0031): SEC-ENC-001 had no loopback
exception for a channel carrying the Restricted credential, and SEC-NDG-001
forbids an environment variable switching encryption off in production. The
owner directed on 2026-10-09 that both invariants be amended with a narrow
loopback test-double exception that never applies in a release build or a
production environment. **Clause 2a is conditional on that amendment**, which
is Security Constitution version 1.2 (CONST-SEC 1.2) in the AI-agents harness,
as reworked after its two independent reviews
(`docs/constitutions/reviews/security-review-v1.md` and `security-review-v2.md`).
Its SEC-ENC-001 permits plain HTTP to a local test double only when four
conditions hold, and this section meets each of them:

| CONST-SEC 1.2 SEC-ENC-001 condition | Where this design meets it |
|---|---|
| (1) Host exactly `127.0.0.1`, `[::1]` or `localhost`; no other form | Clause 2a and the table below |
| Precondition: the peer is a local test double (fixture responses only, no outbound connection, no relay) | Item 3 below (the DEC-0025 stub, started by the script itself) |
| (2) Every connected address is loopback; `localhost` resolves only to loopback; no redirect is followed; no proxy is used | Items 2 and 6 below |
| (3) No production credential or data; anything but a designated test credential refused at start and at every later credential load | Item 3 below |
| (4) The allowance is reachable only through non-release code (SEC-NDG-001: no configuration, flag or environment variable enables it) | *Release and non-release*, items 1, 4 and 5 below |
| Consumer record: designs cite the exception by its phrase; the project records a decision naming them | This section, `component-design-massive-client.md` sections 2.2b and 4, `component-design-acquisition-runner.md` section 2.1; DEC-0036 |

**When clause 2a is in force (DEC-0036, PROVISIONAL).** This design was
checked against one exact text: CONST-SEC 1.2 at content revision
`sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc`, the value
`python3 scripts/artifact-gate.py revision --repo-dir . --artifact docs/constitutions/security.constitution.md`
prints for that text in the AI-agents harness. Clause 2a takes effect only when
both of the following hold:

- CONST-SEC 1.2 is in force under its own rule (*How to Use*, "When a version
  is in force"): its frontmatter carries the constitution owner's `approval`
  block whose `reviewed_revision` equals the file's content revision, and the
  file is on the AI-agents harness default branch; and
- that in-force file's content revision equals the pinned revision above.

The content revision ignores the `status` and `approval` fields, so the owner's
approval does not change it. If CONST-SEC 1.2 comes into force with a different
revision, clause 2a stays unimplemented until the condition table above is
re-checked against the in-force text, the pin here and in DEC-0036 is updated,
and this design is re-reviewed. Until clause 2a takes effect it is specified
but must not be implemented, and an `http` value fails start whatever its host,
exactly as before. The amendment is the constitution owner's change, made in
the AI-agents harness (`docs/constitutions/security.constitution.md`) and not in
this repository (section 14 item 4).

**Release and non-release (DEC-0033, DEC-0034, PROVISIONAL).** No environment,
profile or build-type setting exists in this project, and none is added: a
variable that selected non-release would itself be an environment variable able
to turn transport encryption off in production. Instead the distinction is the
one CONST-SEC 1.2 draws. The release build is the artifact deployed to any
production environment, however it is launched, and non-release code is code
that artifact does not contain. A deployed source tree is deployed whole, test
code included.

- **The release artifact** is the `factorflow` distribution built from `src/`
  alone: what `pip install .` in the repository `Dockerfile` installs, and what
  `uv build` produces (`[tool.setuptools.packages.find] where = ["src"]`). It
  contains no module under `tests/`.
- **Production processes run only from a container image that installs that
  distribution and nothing under `tests/`** (DEC-0034). Section 2.8 defines
  that image and both production containers: the application container runs
  the image's default command (`migrate_main && app_main`), and the ingestion
  container runs the same image with `python -m factorflow.ingestion_main` as
  its command (owner decision 2026-10-12, closing section 14 item 5).
- **A source-checkout launch is never a production deployment.** Two launches
  run from a checkout: `uv run python -m factorflow.ingestion_main`, which the
  README's *Running the acquisition runner* shows, and
  `scripts/run-e2e-server.sh`. Both are development or test launches. A
  checkout contains `tests/`, so deploying one to production would make the
  test entry point part of the release build.
- **A non-release build** is a process started from a source checkout through a
  test-only entry point under `tests/`. The one entry point clause 2a needs is
  `tests/e2e/support/ingestion_e2e_main.py`, which the release artifact never
  contains.

Clause 2a is therefore implemented only in that test-only entry point, never in
`src/`:

1. `MassiveSettings` in `src/factorflow/config/settings.py` stays `https`-only.
   No setting, flag, constant or environment variable makes it accept `http`, so
   in the release build `FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126`
   fails start like any other `http` value.
2. The test entry point wraps `MassiveSettings` with a validator that accepts an
   `http` value whose host is in `_LOOPBACK_HOSTS` and otherwise applies every
   other clause of this section unchanged (host present, no userinfo, valid
   port, empty or single-`/` path, no query or fragment, no whitespace, value
   never echoed). A non-loopback `http` value still fails start. When the host
   is `localhost`, the entry point resolves it at start with
   `socket.getaddrinfo` and refuses to start unless every returned address is a
   loopback address (`ipaddress.ip_address(...).is_loopback`). The values it
   accepts parse to the same host under `urlsplit` and under urllib3's
   `parse_url`, which the SDK uses, because userinfo, paths and every other
   form are rejected first.
3. **Designated test credential only (DEC-0037, PROVISIONAL).** The test entry
   point refuses to start unless `FACTORFLOW_MASSIVE_API_KEY` fully matches
   `^TEST-ONLY-[0-9a-f]{32,}$`, the pattern CONST-SEC 1.2 gives a designated
   test credential. It applies the same check at every claim, where section 2.2b
   re-reads the credential: it passes `factorflow.ingestion_main.main` a
   credential reader that wraps `read_provider_credential` and refuses any value
   that does not match. A refusal ends the process with a non-zero exit before
   any client is built or rebuilt with that value, and its message does not echo
   the value. The plain-HTTP channel therefore cannot carry a production
   credential at start or after a rotation. No fixed key value appears in this
   design, the test entry point, its tests or the script: the script generates
   the value for each run (item 5), and tests generate their own. The DEC-0025
   stub, `tests/e2e/support/massive_stub.py`, serves committed fixture data only,
   opens no outbound connection and is started by the script itself on
   `127.0.0.1`, with nothing between it and the ingestion process. It is a local
   test double in CONST-SEC 1.2's sense, and the channel carries no production
   data.
4. `factorflow.ingestion_main.main` gains two keyword-only parameters, a
   settings factory and a credential reader (DEC-0035).
   `component-design-acquisition-runner.md`, which owns
   `src/factorflow/ingestion_main.py`, specifies them in its sections 2.1, 3 and
   11. The test entry point passes its wrapped settings and its checking reader.
   The release entry point passes neither. A parameter is not configuration:
   only code absent from the release artifact can supply it.
5. **The script change (DEC-0037; specified here, not yet made).** When clause
   2a takes effect, `scripts/run-e2e-server.sh` changes in one edit:
   - it generates one key per run,
     `E2E_PROVIDER_KEY="TEST-ONLY-$(uv run python -c 'import secrets; print(secrets.token_hex(16))')"`,
     before either stack starts;
   - line 90 exports `FACTORFLOW_MASSIVE_API_KEY="$E2E_PROVIDER_KEY"` for the
     main stack, with no fallback to an inherited value, and line 138 sets the
     acquisition stack's `FACTORFLOW_MASSIVE_API_KEY=$E2E_PROVIDER_KEY`; the
     literal `e2e-test-key` is removed from both;
   - line 145 starts the acquisition stack's ingestion process through
     `uv run python tests/e2e/support/ingestion_e2e_main.py` instead of
     `python -m factorflow.ingestion_main`.

   The acquisition API process reads presence only and is unaffected.
6. **No redirect is followed and no proxy is used.** The SDK client is built
   with `retries=0` (`component-design-massive-client.md` section 2.2b). Under
   that setting urllib3 refuses a redirect instead of following it, so no
   request leaves the double's address. The SDK builds a plain
   `urllib3.PoolManager`, never a `ProxyManager`, and neither the SDK nor
   urllib3 2.7.0 reads `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` or `NO_PROXY`,
   so the channel is never routed through a proxy whatever the environment
   says. The massive-client design states both as requirements in every build
   and tests them without opening a socket (DEC-0038). The test entry point
   relies on them and adds no redirect or proxy handling of its own.

The reading in `component-design-ingestion-api.md` section 4, that loopback does
not engage SEC-ENC-001 for the owner interface, is not affected by this
exception and is not settled by it: the exception covers only a component and
its local test double. CONST-SEC 1.2 records the standing of other host-local
plaintext channels, the database connections included, as the constitution
owner's open question (section 14 item 6).

| Value of `FACTORFLOW_MASSIVE_BASE_URL` | Outcome |
|---|---|
| unset | `https://api.massive.com` |
| `https://api.massive.com` | accepted unchanged |
| `https://api.massive.com/` | accepted as `https://api.massive.com` |
| `HTTPS://API.MASSIVE.COM` | accepted (scheme and host compare without case) |
| `https://api.massive.com:443` | accepted |
| `https://other.example` | accepted (the host is not allow-listed; see section 3) |
| `http://api.massive.com` | rejected: scheme must be `https` |
| `http://127.0.0.1:8126`, `http://localhost:8126`, `http://[::1]:8126` | rejected by `MassiveSettings` and in the release build, always; accepted only by the test-only entry point under clause 2a (CONST-SEC 1.2) |
| `http://127.0.0.2`, `http://127.1`, `http://0.0.0.0`, `http://localhost.`, `http://[0:0:0:0:0:0:0:1]`, `http://[::ffff:127.0.0.1]`, `http://[::1%25lo]` | rejected, including by the test-only entry point under clause 2a (host not in `_LOOPBACK_HOSTS`) |
| `http://::1:8126` (unbracketed) | rejected: host missing |
| `ftp://api.massive.com`, `api.massive.com` (no scheme) | rejected: scheme must be `https` |
| `https://`, `https:///v3`, `https:api.massive.com` | rejected: host missing |
| `https://user:pw@api.massive.com` | rejected: userinfo not allowed; the message does not echo the password |
| `https://api.massive.com:0`, `:70000`, `:abc` | rejected: port invalid |
| `https://api.massive.com/v3`, `https://api.massive.com//` | rejected: path not allowed |
| `https://api.massive.com?x=1`, `https://api.massive.com#f` | rejected: query or fragment not allowed |
| empty string, `" https://api.massive.com"` | rejected: empty, or contains whitespace |

```python
# src/factorflow/config/settings.py
from urllib.parse import urlsplit

from pydantic import field_validator


class MassiveSettings(_EnvNamedSettings):
    ...  # fields as in section 2.3

    @field_validator("base_url")
    @classmethod
    def _validate_base_url(cls, value: str) -> str:
        """Section 2.2c. Messages name the clause, never the value; the
        _EnvNamedSettings wrapper prefixes FACTORFLOW_MASSIVE_BASE_URL."""
        if not value or any(c.isspace() or not c.isprintable() for c in value):
            raise ValueError("must be a non-empty URL without whitespace")
        if "?" in value or "#" in value:
            raise ValueError("must not carry a query or fragment")
        parts = urlsplit(value)
        if parts.scheme != "https":  # clause 2a lives only under tests/ (DEC-0033)
            raise ValueError("scheme must be https")
        if not parts.hostname:
            raise ValueError("host is missing")
        if "@" in parts.netloc:
            raise ValueError("must not carry userinfo")
        try:
            port = parts.port
        except ValueError:
            raise ValueError("port must be an integer from 1 to 65535") from None
        if port == 0:
            raise ValueError("port must be an integer from 1 to 65535")
        if parts.path not in ("", "/"):
            raise ValueError("must not carry a path")
        return value[:-1] if parts.path == "/" else value
```

`urlsplit` lowercases the scheme and the hostname and removes the brackets from
an IPv6 literal, which is what makes the case-insensitive comparison and the
`[::1]` form work. `ConfigurationError` already formats Pydantic's errors with
`include_input=False` (the `_EnvNamedSettings` base in `settings.py`), so the submitted value
cannot reach the message by that route either. The snippet does not contain
clause 2a, and no flag, constant or environment variable enables it. Clause 2a
is not shipped dormant in the release build: it exists only in the test-only
entry point described above.

### 2.3 Settings models

```python
# src/factorflow/config/settings.py
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_DATABASE_")

    url: SecretStr
    pool_min: int = Field(default=1, ge=1)
    pool_max: int = Field(default=4, ge=1)


class ApiSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_API_")

    host: str = "127.0.0.1"
    port: int = Field(default=8000, ge=1, le=65535)


class MassiveSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_MASSIVE_")

    api_key: SecretStr
    base_url: str = "https://api.massive.com"  # validated at start, section 2.2c
    requests_per_minute: int = Field(ge=1)
    max_attempts: int = Field(default=3, ge=1)
    timeout_seconds: float = Field(default=30.0, gt=0)
    backoff_initial_seconds: float = Field(default=2.0, gt=0)
    max_throttle_wait_seconds: float = Field(default=300.0, gt=0)


class RunSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_RUN_")

    heartbeat_seconds: float = Field(default=60.0, ge=1)
    stale_after_seconds: float = Field(default=900.0, gt=0)
    poll_interval_seconds: float = Field(default=5.0, ge=1)


@model_validator(mode="after")
def _check_timing_invariants(self) -> "Settings":
    """Section 2.2a's invariants, enforced at load.

    A violated relationship produces a run that fails intermittently under a
    slow provider rather than an error at start, so these refuse to start.
    """
    run, massive = self.run, self.massive

    if run.stale_after_seconds <= run.heartbeat_seconds * 3:
        raise ValueError(
            "FACTORFLOW_RUN_STALE_AFTER_SECONDS must exceed "
            "FACTORFLOW_RUN_HEARTBEAT_SECONDS * 3; a window narrower than a few "
            "heartbeats reclaims healthy runs"
        )

    worst_case = (
        massive.max_attempts * massive.timeout_seconds * 4
    ) + massive.max_throttle_wait_seconds
    if run.stale_after_seconds <= worst_case:
        raise ValueError(
            f"FACTORFLOW_RUN_STALE_AFTER_SECONDS must exceed {worst_case:.0f}s, "
            "the worst case for one instrument (4 data types x max_attempts x "
            "timeout, plus the throttle wait budget)"
        )

    if run.poll_interval_seconds >= run.stale_after_seconds:
        raise ValueError(
            "FACTORFLOW_RUN_POLL_INTERVAL_SECONDS must be less than "
            "FACTORFLOW_RUN_STALE_AFTER_SECONDS"
        )

    return self
```

The worst-case expression multiplies by four because an instrument carries four
data types, each independently retried. It is written as an expression rather
than as the literal 660 so that raising the timeout or the throttle budget
raises the required window with it, which is the change most likely to be made
without thinking about reclaim.

`SecretStr` is the mechanism, not a convention. Pydantic's `SecretStr` renders
as `**********` in `repr`, in `str`, and in `model_dump()` unless
`model_dump(mode="python")` is called with explicit secret exposure, so a
credential cannot reach a log record or a JSON response by the ordinary route of
someone logging a settings object. The value is read exactly once, by
`massive-client`, through `get_secret_value()`.

### 2.4 Credential load and redaction flow

The sequence below shows the credential's entire lifetime, which is short and
has exactly one consumer. It is drawn because AC-13 is a negative requirement,
and a negative requirement is only verifiable if the positive path is small
enough to enumerate. The environment supplies the key — at process start, and
again at each run claim, which is what makes rotation work (section 2.2b); the
settings model wraps it in `SecretStr` immediately; the only unwrapping happens
inside the provider client when it builds an Authorization header; and a logging
filter sits across every log record as a second line of defence in case a future
story formats the raw value by mistake. The expected outcome is that the string
exists in exactly two places, the environment and one HTTP header, and nowhere
that is written to disk or returned to a client.

```mermaid
sequenceDiagram
    participant ENV as Process environment
    participant CFG as runtime-config
    participant MC as massive-client
    participant EXT as Massive REST API
    participant LOG as Structured logger
    participant API as ingestion-api

    ENV->>CFG: FACTORFLOW_MASSIVE_API_KEY at start
    CFG->>CFG: wrap in SecretStr, validate presence
    alt Missing or empty
        CFG->>LOG: error naming the variable, never a value
        CFG-->>ENV: exit non-zero, process does not start
    end
    CFG->>MC: MassiveSettings (api_key as SecretStr)
    MC->>MC: get_secret_value() when building the header
    loop At each run claim (section 2.2b)
        ENV->>CFG: re-read FACTORFLOW_MASSIVE_API_KEY
        CFG->>CFG: fingerprint, compare to the client's
        alt Fingerprint changed
            CFG->>MC: rebuild the client with the new key
            Note over MC: Rotation takes effect,<br/>no restart (SEC-SEC-002)
        end
    end
    MC->>EXT: HTTPS request with Authorization header
    CFG->>LOG: install RedactingFilter over every handler
    Note over LOG: Any record whose text contains the<br/>credential is rewritten before emission
    API->>CFG: credential_present() -> bool
    Note over API: GET /api/health reports presence only,<br/>never the value (AC-13)
```

### 2.5 The redaction filter

```python
# src/factorflow/config/redaction.py
import logging


class RedactingFilter(logging.Filter):
    """Replace known secret values anywhere in a formatted log record."""

    def __init__(self, secrets: list[str]) -> None:
        super().__init__()
        self._secrets = [s for s in secrets if s]

    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        for secret in self._secrets:
            if secret in message:
                record.msg = message.replace(secret, "[redacted]")
                record.args = ()
        return True
```

The filter is installed on every handler at process start, in both processes.
It exists because `SecretStr` protects the object and not a string someone
extracted from it; the filter catches the extracted case. Both mechanisms are
required, and the test in section 7 exercises the filter with a deliberately
leaked value.

### 2.6 Credential presence, and where it is answered

The ingestion process uses the credential. The application process, which serves
`GET /api/health`, holds it only to report presence: it reads whether
`FACTORFLOW_MASSIVE_API_KEY` is set in its own environment and returns
`credential_present` as a boolean. It never reads the value, and no code path in
the application unwraps the `SecretStr`.

System design v3 constraint 5.12 settles this, on the owner's decision of
2026-09-05: the variable is supplied to both containers, and health reports an
observed fact rather than a recorded one. The alternative considered and rejected
was for ingestion to record presence in `owner_setting`, which would keep the
secret in one process but would let health report a credential as supplied after
ingestion had stopped. AC-18 exists so the owner can distinguish a healthy system
from a failing one without inspecting the store, and an endpoint that can be
confidently wrong undercuts it.

### 2.7 Messages

N/A, not applicable for this component.

### 2.8 Deployment definition

The product is deployed as three containers on the owner's machine: PostgreSQL,
the application container and the ingestion container (system design section 1,
charter constraint C1). Before this revision the repository defined only an
image whose command started the migrator and the API. That image could not find
its migrations once installed (B1), carried no interface bundle (B3), and
nothing defined the ingestion container or how the three run together (B4). The
release image smoke test of 2026-10-12, recorded in
`docs/releases/CAP-001-release-v1.md`, found all three. This section replaces
that image with the deployment below. The owner decided on 2026-10-12 that this
component owns it.

#### 2.8.1 Topology and network exposure (AC-14)

The deployment diagram below shows the three containers and every network
path between them. All three use the host's network namespace
(`network_mode: host`), so `127.0.0.1` inside a container is the machine's own
loopback. The API binds `127.0.0.1:8000` as `ApiSettings` already requires,
PostgreSQL listens on `127.0.0.1:5432` only, and no port is published, because
host networking has nothing to publish. The owner's browser reaches the API on
loopback; nothing listens on any other interface. The expected outcome is that
both services are reachable at `127.0.0.1` on the machine and unreachable at
the machine's LAN address.

```mermaid
flowchart LR
    B["Owner's browser<br/>(same machine)"] -->|"http://127.0.0.1:8000"| APP
    subgraph HOST["Host network namespace (network_mode: host)"]
        APP["app container<br/>migrate_main && app_main<br/>binds 127.0.0.1:8000"]
        ING["ingestion container<br/>python -m factorflow.ingestion_main"]
        PG[("postgres container<br/>listen_addresses=127.0.0.1<br/>port 5432")]
    end
    APP -->|"127.0.0.1:5432"| PG
    ING -->|"127.0.0.1:5432"| PG
    ING -->|"HTTPS"| EXT["Massive REST API"]
    LAN["Any other host on the LAN"] -.->|"refused: nothing listens<br/>on a non-loopback address"| HOST
```

Why host networking: under Docker's default bridge network a published port
reaches only a process listening on the container's own network interface, so
an API bound to loopback inside a container cannot be reached from the host at
all. The alternative, letting the API bind `0.0.0.0` inside the container and
publishing `127.0.0.1:8000`, would weaken the `ApiSettings` loopback validator
(DAC-E1-S3-4) and the system design's AC-14 control. The owner chose host
networking on 2026-10-12, which keeps both.

The two independent controls for AC-14 are therefore:

1. **The bind.** `ApiSettings` rejects any non-loopback `FACTORFLOW_API_HOST`
   (section 2.3, unchanged). `compose.yaml` does not set `FACTORFLOW_API_HOST`,
   so the default `127.0.0.1` applies.
2. **The deployment.** Every service runs in the host network namespace with
   nothing published, and PostgreSQL is started with
   `listen_addresses=127.0.0.1`. A container that binds loopback cannot be
   reached from another host whatever its port.

Host requirement: Linux, or Docker Desktop with **host networking enabled**
(Settings, Resources, Network). On the owner's machine (macOS, Docker Desktop,
engine 28.3.2), probes on 2026-10-12 showed:

| Probe (container on host network) | `127.0.0.1` from macOS | `192.168.4.118` (LAN) from macOS |
|---|---|---|
| HTTP server bound `127.0.0.1` | 200 | unreachable |
| HTTP server bound `0.0.0.0` (control) | 200 | 200 |
| PostgreSQL, `listen_addresses=127.0.0.1` | open; `pg_isready` from a host-network container: accepting | closed |

With host networking disabled, none of these were reachable from macOS. The
setting is therefore a deployment precondition, checked by the deployment smoke
check (section 2.8.5).

#### 2.8.2 The release image (`Dockerfile`)

The image is built in two stages, so the release image carries the interface
bundle (B3) without carrying Node.js or any frontend source.

```dockerfile
# Stage 1: build the owner interface bundle.
FROM node:22-slim AS interface
WORKDIR /build
COPY package.json package-lock.json vite.config.ts tsconfig.json \
     tailwind.config.js postcss.config.js ./
COPY web ./web
COPY design-system ./design-system
RUN npm ci && npm run build
# vite.config.ts writes to ../src/factorflow/api/static relative to web/,
# so the bundle lands in /build/src/factorflow/api/static.

# Stage 2: the release image.
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
COPY src ./src
COPY --from=interface /build/src/factorflow/api/static ./src/factorflow/api/static
RUN pip install --no-cache-dir .
CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"]
```

- The default command is unchanged: the migrator must exit 0 before the API is
  exec'd (AC-16, `schema-migrator` section 2.1).
- No `COPY` names `tests/` or `migrations/`. The migrations travel inside the
  installed distribution (`schema-migrator` section 2.1), and DEC-0034's rule
  that the image contains nothing under `tests/` keeps holding.
- `pyproject.toml` `[tool.setuptools.package-data]` becomes
  `factorflow = ["coverage/sql/*.sql", "db/migrations/*.sql", "api/static/**/*"]`,
  so `pip install .` installs both the migrations and the bundle. Without the
  `api/static` entry the copied bundle would be left out of the installed
  package, which is how B3 arose.
- Node 22 is the frontend toolchain's runtime the tech stack records (v5),
  and the version the frontend validation commands run on.

`.dockerignore` (new) excludes `node_modules/`, `.venv/`, `dist/`, `build/`,
`tests/`, `test-results/`, `playwright-report/`, `.git/`, `.env` and `.env.*`,
and `src/factorflow/api/static/`. The last entry keeps a developer's local,
possibly stale build out of the context, so the bundle in the image is always
the one stage 1 built.

#### 2.8.3 Running it (`compose.yaml`)

`compose.yaml` at the repository root runs the image as two containers next to
PostgreSQL. Every secret is interpolated from the owner's shell environment,
and a `:?` interpolation stops `docker compose` with the variable's name when
one is missing, so nothing secret is committed (SEC-SEC-001) and nothing
starts half-configured.

```yaml
name: factorflow

x-factorflow-database: &database
  FACTORFLOW_DATABASE_URL: postgresql://factorflow:${FACTORFLOW_POSTGRES_PASSWORD:?set FACTORFLOW_POSTGRES_PASSWORD}@127.0.0.1:5432/factorflow

services:
  postgres:
    image: postgres:16
    network_mode: host
    command: ["postgres", "-c", "listen_addresses=127.0.0.1", "-c", "port=5432"]
    environment:
      POSTGRES_DB: factorflow
      POSTGRES_USER: factorflow
      POSTGRES_PASSWORD: ${FACTORFLOW_POSTGRES_PASSWORD:?set FACTORFLOW_POSTGRES_PASSWORD}
    volumes:
      - factorflow-pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-h", "127.0.0.1", "-p", "5432", "-U", "factorflow", "-d", "factorflow"]
      interval: 5s
      timeout: 3s
      retries: 30
    restart: unless-stopped

  app:
    image: factorflow:${FACTORFLOW_IMAGE_TAG:-local}
    build: .
    network_mode: host
    environment:
      <<: *database
      FACTORFLOW_MASSIVE_API_KEY: ${FACTORFLOW_MASSIVE_API_KEY:?set FACTORFLOW_MASSIVE_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import json,sys,urllib.request; h=json.load(urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3)); sys.exit(0 if h['database'] == 'reachable' and h['schema_version'] is not None else 1)"]
      interval: 5s
      timeout: 5s
      retries: 30
    restart: unless-stopped

  ingestion:
    image: factorflow:${FACTORFLOW_IMAGE_TAG:-local}
    network_mode: host
    command: ["python", "-m", "factorflow.ingestion_main"]
    environment:
      <<: *database
      FACTORFLOW_MASSIVE_API_KEY: ${FACTORFLOW_MASSIVE_API_KEY:?set FACTORFLOW_MASSIVE_API_KEY}
      FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE: ${FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE:?set FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE}
    depends_on:
      app:
        condition: service_healthy
    restart: unless-stopped

volumes:
  factorflow-pgdata:
```

- **Start order.** PostgreSQL must be healthy before the application container
  starts, and the application must be healthy before ingestion starts. The
  application's healthcheck requires `database == "reachable"` and a non-null
  `schema_version`, so ingestion never starts against a store the migrator has
  not brought forward. A refused migration (exits 1 to 4) leaves the
  application container exited and ingestion never started (AC-16).
- **The owner sets three variables:** `FACTORFLOW_POSTGRES_PASSWORD`,
  `FACTORFLOW_MASSIVE_API_KEY` and `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`.
  `FACTORFLOW_DATABASE_URL` is composed from the password, so the two cannot
  disagree. Any other section 2.2 variable may be added to a service's
  `environment` by the owner; none is required.
- **The application container receives the provider key for presence only**
  (section 14 item 3, system design constraint 5.12).
- **One image, one tag.** Both services name the same image and tag, so they can
  never run different builds (`FACTORFLOW_IMAGE_TAG`, default `local` for a
  build on the machine). Upgrade and rollback move both together.
- **Data** lives in the named volume `factorflow-pgdata`. `docker compose down`
  keeps it, and only `docker compose down -v` removes it.
- `restart: unless-stopped` brings the three back after a reboot. An ingestion
  container killed mid-run is covered by the reclaim sweep (AC-20), not by
  compose.

#### 2.8.4 Upgrade and rollback

- **Upgrade:** build or pull the new tag, set `FACTORFLOW_IMAGE_TAG`, then run
  `docker compose up -d`. The application container migrates forward before
  serving (AC-15), and ingestion restarts on the same tag once it is healthy.
- **Rollback (OPS-MIG-003):** set `FACTORFLOW_IMAGE_TAG` to the previous tag and
  run `docker compose up -d`. When the newer build applied no migration, that is
  the whole rollback. When it did, the older build refuses the newer store
  (exit 2, AC-16) by design, and rollback is image and data restore together
  (`schema-migrator` section 3, `ingestion-api` section 6). Restore comes from a
  `pg_dump` taken before the upgrade:
  `docker compose exec postgres pg_dump -U factorflow factorflow > backup.sql`.
- 0.1.0 is the first release, so it has no earlier build to roll back to.

#### 2.8.5 Deployment smoke check

`scripts/deploy-smoke.sh` (new) checks a running deployment and exits non-zero
on the first failed check. It runs on the deployment machine after
`docker compose up -d`:

1. `docker compose ps` shows `postgres` and `app` healthy and `ingestion`
   running.
2. `GET http://127.0.0.1:8000/api/health` answers 200 with
   `database == "reachable"` and `schema_version` equal to the highest version
   the image carries.
3. `GET http://127.0.0.1:8000/` answers 200 with the bundle's `index.html`.
4. Neither port 8000 nor port 5432 accepts a connection on any non-loopback
   IPv4 address of the machine (on macOS, the addresses `ifconfig` lists; on
   Linux, `ip -4 addr`). This is the AC-14 check in the deployed form.

It never reads, prints or sends the provider key, and it starts no acquisition
run. A first run against the live provider is the owner's post-release check,
because it needs the owner's credential.

## 3. Constraints and Assumptions

- **The credential is supplied at runtime and never committed** (AC-13, C12 in
  the system design's constraint list, SEC-SEC-001). No `.env` file is committed
  and no default value exists for `FACTORFLOW_MASSIVE_API_KEY`.
- **The interface binds to loopback** (AC-14, system design constraint 5.11).
  `FACTORFLOW_API_HOST` defaults to `127.0.0.1`, and `ApiSettings` rejects any
  non-loopback value. The deployment runs every container in the host network
  namespace with no published port and PostgreSQL listening on loopback only
  (section 2.8.1), so nothing listens on another interface. This replaces the
  system design's "the port is published to `127.0.0.1` only", which host
  networking makes inapplicable. The recommendation to update that sentence is
  in section 14 item 8.
- **The deployment needs host networking** (section 2.8.1): Linux, or Docker
  Desktop with host networking enabled. Without it the interface is unreachable
  from the browser, which fails closed rather than open.
- **A missing required value fails the start** (system design step 38). The
  process exits non-zero with a message naming the variable. It does not start
  with a partial configuration.
- **No configuration file.** Everything comes from the environment, which is
  what makes the credential's handling auditable.
- **The owner supplies the environment through `compose.yaml`** (section
  2.8.3). It interpolates host environment variables rather than embedding
  values, so nothing secret is committed.
- **The provider credential is re-read between runs** (SEC-SEC-002, owner
  decision 2026-09-05). Rotating the Massive key does not require a restart:
  the runner re-reads it when it claims a run, and rebuilds the provider client
  when it has changed. Section 2.4a specifies the mechanism. Configuration other
  than the credential is still read once at start, because nothing requires
  those to be rotatable and re-reading them mid-life would let a process drift
  from the settings it validated.
- **The provider base URL is validated by scheme and shape, not by host**
  (owner direction 2026-10-09, section 2.2c). Any `https` host passes, so a
  mistyped `https` host would still receive the credential, over TLS with
  certificate verification. The owner's rule does not allow-list hosts. Because
  this setting now redirects all provider egress, the release evidence must name
  it (EXP-20261009-1 review, ER-002).

## 4. Security

- **This component is the capability's credential boundary.** Every control that
  makes AC-13 true lives here: `SecretStr` wrapping, the logging filter, the
  absence of any serialisation path, and the presence-only health report.
- **Data classification.** The Massive API key and the database URL are
  **Restricted** under SEC-DAT-001. Both are held in memory only, never written
  to any store (SEC-DAT-002 does not engage, since neither is persisted), and
  never logged (SEC-DAT-003 is enforced by section 2.5).
- **No hardcoded secrets** (SEC-SEC-001). There is no default for either
  Restricted value, so a missing environment variable fails the start rather
  than falling back to a committed value.
- **Rotatability (SEC-SEC-002).** Met. The provider credential is re-read from
  the environment when the runner claims a run and the provider client is
  rebuilt when it has changed, so rotation needs no restart and no
  redeployment. Section 2.2b specifies the mechanism and states what it does not
  cover.
- **Input validation (SEC-INP-001).** Every variable is validated by a Pydantic
  model with a type and, where meaningful, a range: pool sizes at least 1, port
  within 1 to 65535, requests per minute at least 1, attempts at least 1, and
  the provider base URL by the rule in section 2.2c. An invalid value fails the
  start.
- **Transport encryption (SEC-ENC-001, SEC-NDG-001).** In the release build
  the provider base URL must be `https`, so no setting can send the credential
  over plain HTTP. The loopback `http` allowance (clause 2a, section 2.2c)
  rests on the SEC-ENC-001 loopback test-double exception that CONST-SEC 1.2
  adds, and takes effect only when that version is in force under its own rule
  (the owner's `approval` block and the harness default branch) at the content
  revision section 2.2c pins (DEC-0036). It is confined to a test-only entry
  point absent from the release artifact (DEC-0033, DEC-0034). That entry point
  refuses, at start and at every claim, any key that is not a designated test
  credential (`^TEST-ONLY-[0-9a-f]{32,}$`, generated per run, DEC-0037), checks
  that `localhost` resolves only to loopback, and relies on the client never
  following a redirect and never using a proxy. The owner's approval of the
  amendment is tracked in section 14 item 4.
- **No dynamic code execution.** No variable is evaluated, imported by name, or
  used to construct a code path (SEC-INP-003).
- **Error disclosure (SEC-ERR-001).** Validation failures are written to the
  container log the owner reads, naming the variable and the constraint it
  failed. They reach no HTTP response.
- **Privacy impact: none.** No PII.
- **RBAC and authentication: unchanged.** There is no authentication in this
  capability, by the owner's loopback decision, and this component introduces
  none.
- **OSS inventory.** Pydantic and `pydantic-settings`, both already in the
  approved stack, covered by dependency scanning on `pyproject.toml`.

## 5. Scalability and Performance

- Loaded once per process at start. No runtime cost after that.
- The redaction filter runs on every log record and performs a substring scan
  over a list of at most two secrets. At the log volumes this product produces,
  one owner and one run at a time, this is immaterial.
- Resource utilization: a few kilobytes of process memory.
- No SLA. No concurrency: settings objects are frozen after load and shared
  read-only, which is the immutability default SA-CONC-001 asks for.

## 6. Upgrade

- **Adding a variable in a later capability** adds a field with a default, so an
  existing deployment continues to start. Adding a variable without a default is
  a breaking deployment change and must be called out in that capability's
  release notes.
- **No data migration.** This component persists nothing.
- **Behaviour change after upgrade: none in this capability**, there being no
  previous release.
- **Manual actions required on first deployment:** enable host networking
  where Docker Desktop is used, then set `FACTORFLOW_POSTGRES_PASSWORD`,
  `FACTORFLOW_MASSIVE_API_KEY` and `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` and
  run `docker compose up -d` (section 2.8.3). `FACTORFLOW_DATABASE_URL` is
  composed by `compose.yaml`. The other variables have defaults.
- **Rollback (OPS-MIG-003).** Section 2.8.4. Reverting the image reverts the
  settings model. A variable added by a newer build is simply unread by an
  older one, so this component needs no rollback action of its own.

## 7. Testing

| Test | File | What it proves |
|------|------|----------------|
| Missing credential fails the start | `tests/unit/test_settings_required.py` | Absent `FACTORFLOW_MASSIVE_API_KEY` raises, and the message names the variable (AC-13) |
| The failure message carries no value | `tests/unit/test_settings_required.py` | A malformed value's error text does not contain the value (AC-13) |
| Credential does not survive serialisation | `tests/unit/test_settings_secrecy.py` | `repr`, `str`, `model_dump()` and `model_dump_json()` of the settings object contain no part of the key (AC-13) |
| The redaction filter rewrites a leaked value | `tests/unit/test_redaction.py` | A log call formatting the raw credential emits `[redacted]` (AC-13) |
| Default bind address is loopback | `tests/unit/test_settings_defaults.py` | `ApiSettings().host == "127.0.0.1"` with no environment set (AC-14) |
| Bounds are enforced | `tests/unit/test_settings_validation.py` | Pool size 0, port 0, requests per minute 0 and attempts 0 each raise |
| Attempt limit default | `tests/unit/test_settings_defaults.py` | `max_attempts` is 3, matching system design constraint 5.13 |
| Timing defaults are the canonical set | `tests/unit/test_settings_defaults.py` | Timeout 30s, backoff 2s, throttle budget 300s, heartbeat 60s, staleness 900s, poll 5s (section 2.2a) |
| Staleness must exceed three heartbeats | `tests/unit/test_settings_validation.py` | Staleness 100s against a 60s heartbeat raises, naming both variables (invariant 1) |
| Staleness must exceed the per-instrument worst case | `tests/unit/test_settings_validation.py` | Raising the timeout to 120s without raising staleness raises, and the message states the computed worst case (invariant 2) |
| Poll interval must be below the staleness window | `tests/unit/test_settings_validation.py` | A poll interval of 900s against a 900s window raises (invariant 3) |
| Timing bounds are enforced | `tests/unit/test_settings_validation.py` | Zero or negative timeout, backoff, throttle budget, heartbeat, staleness and poll interval each raise (invariant 4) |
| A rotated credential is picked up without a restart | `tests/unit/test_credential_reload.py` | Changing the environment value between two claims builds a new client on the second, in the same process (SEC-SEC-002) |
| An unchanged credential reuses the client | `tests/unit/test_credential_reload.py` | Two claims with the same value keep one SDK `RESTClient`, so the connection pool is not discarded needlessly |
| The fingerprint is not the credential | `tests/unit/test_credential_reload.py` | The fingerprint of a known value contains no substring of it and is stable across calls (SEC-SEC-001) |
| The credential is not cached at module level | `tests/unit/test_credential_reload.py` | `read_provider_credential()` reflects a changed environment without reimport, which is what makes rotation observable |
| No committed credential | `tests/unit/test_no_committed_secrets.py` | No tracked file contains a value matching the provider key shape, and no `.env` is tracked (SEC-SEC-001) |
| Base URL default is the governed host | `tests/unit/test_settings_base_url.py` | With the variable unset, `MassiveSettings().base_url == "https://api.massive.com"` (section 2.2c, clause 1) |
| An `https` base URL is accepted and normalised | `tests/unit/test_settings_base_url.py` | Every "accepted" row of section 2.2c's table loads; `https://api.massive.com/` loads as `https://api.massive.com` (clauses 2, 5 and 6) |
| A non-`https` base URL fails start | `tests/unit/test_settings_base_url.py` | `http://api.massive.com`, `ftp://api.massive.com` and a value with no scheme each raise `ConfigurationError` naming `FACTORFLOW_MASSIVE_BASE_URL` (clause 2, SEC-ENC-001) |
| Loopback `http` fails start in the release settings | `tests/unit/test_settings_base_url.py` | `http://127.0.0.1:8126`, `http://localhost:8126` and `http://[::1]:8126` each raise `ConfigurationError` from `MassiveSettings`. This test does not change when clause 2a takes effect: the release settings never accept `http` (SEC-NDG-001, DEC-0033) |
| Loopback `http` is accepted only by the test-only entry point | `tests/unit/test_ingestion_e2e_main.py` | Under CONST-SEC 1.2: the three loopback values load through `tests/e2e/support/ingestion_e2e_main.py`; `http://127.0.0.2`, `http://127.1`, `http://0.0.0.0`, `http://localhost.`, `http://[0:0:0:0:0:0:0:1]`, `http://[::ffff:127.0.0.1]`, `http://[::1%25lo]`, `http://::1:8126` and `http://api.massive.com` still raise; every other "rejected" row of section 2.2c still raises (clause 2a) |
| `localhost` must resolve only to loopback | `tests/unit/test_ingestion_e2e_main.py` | With name resolution patched so `localhost` returns a non-loopback address alongside `127.0.0.1`, the test entry point exits non-zero before constructing a `RESTClient`; with only loopback addresses it starts (clause 2a, item 2; CONST-SEC 1.2 SEC-ENC-001 condition 2) |
| The test-only entry point accepts only a designated test credential | `tests/unit/test_ingestion_e2e_main.py` | A key generated in the test as `"TEST-ONLY-" + secrets.token_hex(16)` starts. Each of `e2e-test-key`, `TEST-ONLY-` with a 31-character hex tail, `TEST-ONLY-` with an uppercase hex tail, `test-only-` with a valid tail, a valid key with a trailing newline, and a random 32-character alphanumeric key makes the test entry point exit non-zero before constructing a `RESTClient`, and the message does not echo the key (clause 2a, item 3, AC-13; CONST-SEC 1.2 Definitions) |
| The test-only entry point refuses a non-test key at a later claim | `tests/unit/test_ingestion_e2e_main.py` | Started with a generated `TEST-ONLY-` key, after the environment value changes to a key that does not match the pattern, the next claim's credential read ends the process non-zero, no `RESTClient` is built or rebuilt with the new value, and the message does not echo it; a change to another generated `TEST-ONLY-` key rebuilds the client normally (clause 2a, item 3, section 2.2b; CONST-SEC 1.2 SEC-ENC-001 condition 3) |
| No fixed provider key is committed for the E2E stack | `tests/unit/test_no_committed_secrets.py` | Once the item 5 script change is made, no tracked file under `scripts/`, `tests/` or `src/` contains the former fixed key `e2e-test-key` or a literal matching `TEST-ONLY-[0-9a-f]{32,}`, other than in this test's own search patterns (CONST-SEC 1.2 Definitions; SEC-SEC-001; DEC-0037) |
| Clause 2a is absent from the release artifact | `tests/unit/test_release_excludes_test_paths.py` | The `Dockerfile` copies no path under `tests/`; the wheel `uv build` produces contains no file under `tests/`; and no module under `src/factorflow` imports from `tests` or accepts an `http` base URL scheme (SEC-NDG-001, DEC-0033, DEC-0034) |
| A malformed base URL fails start | `tests/unit/test_settings_base_url.py` | Each "rejected" row of section 2.2c's table raises `ConfigurationError`: missing host, userinfo, invalid or zero port, a path, a query or fragment, an empty value, surrounding whitespace (clauses 3 to 8) |
| A base URL failure discloses no value | `tests/unit/test_settings_base_url.py` | For `https://user:s3cret@api.massive.com`, and for each rejected value, the message contains `FACTORFLOW_MASSIVE_BASE_URL` and contains neither the submitted value, nor `s3cret`, nor the configured API key (clause 9, AC-13) |
| The ingestion process refuses to start on a bad base URL | `tests/unit/test_ingestion_main.py` | With `FACTORFLOW_MASSIVE_BASE_URL=http://api.massive.com`, the entry point exits non-zero before constructing a `RESTClient`, and the log line names the variable but not the value (clause 2, AC-16) |

| The release image ships its migrations and bundle | `tests/unit/test_distribution_contents.py` | The wheel `uv build` produces contains `factorflow/db/migrations/0001_extensions_owner_state.sql` through `0004_runs.sql`, and `factorflow/api/static/index.html` when the bundle has been built before `uv build`; it still contains nothing under `tests/` (B1, B3, DEC-0034) |
| The Dockerfile builds the bundle and copies no non-release path | `tests/unit/test_release_excludes_test_paths.py` (extended) | The `Dockerfile` has an `interface` stage running `npm run build`, the final stage copies the bundle from it, and no `COPY` names `tests/` or `migrations/`; `.dockerignore` lists `tests/` and `src/factorflow/api/static/` (B3, DEC-0034) |
| `compose.yaml` keeps AC-14 and AC-13 | `tests/unit/test_compose_definition.py` | Read as text, because PyYAML is not a project dependency and the checks need no parser: each of the three service blocks has `network_mode: host`, and the file has no `ports:` key; PostgreSQL's command sets `listen_addresses=127.0.0.1`; no service sets `FACTORFLOW_API_HOST`; every secret is a `${...:?...}` interpolation, not a literal; `app` and `ingestion` name the same image; `ingestion`'s command is `python -m factorflow.ingestion_main` and it depends on `app` being healthy (AC-13, AC-14, AC-16) |
| The image deploys and serves | `scripts/deploy-smoke.sh` against `docker compose up -d` with a throwaway password and a generated test key | Section 2.8.5 checks 1 to 4 pass: health reachable at the image's highest schema version, `GET /` 200, and nothing on a non-loopback address. Run on the deployment machine as release evidence; it needs Docker with host networking, so it is not part of `uv run pytest` |

Every pytest test in this component runs without a container, so none carries
the `postgres` marker and all run under `uv run pytest -m 'not postgres'`.
`test_distribution_contents.py` runs `uv build` into a temporary directory, so
it is marked `slow`. The deployment smoke check is a script, not a pytest test,
for the reason given in its row.

Negative-path coverage is the substance here: the component's value is what it
refuses to do, and most of these tests assert an absence or a refusal. The
invariant tests are the newest of them, and they exist because section 2.2a's
relationships fail silently at runtime rather than loudly at start unless
something checks them.

## 8. Acceptance Criteria

1. With `FACTORFLOW_MASSIVE_API_KEY` unset, the ingestion process exits non-zero
   before making any provider request, and the message names the variable.
2. No message emitted by either process at any log level contains the provider
   credential or the database password.
3. `repr`, `str`, and both dump forms of every settings object contain no part
   of either Restricted value.
4. With no environment set, the API bind host is `127.0.0.1`.
5. With `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` unset, the ingestion process
   exits non-zero rather than choosing a rate.
6. `FACTORFLOW_MASSIVE_MAX_ATTEMPTS` defaults to 3.
7. No tracked file in the repository contains a provider credential.
8. Failure scenario: a value that fails validation, such as a negative pool
   size, prevents the process from starting rather than being clamped.
9. Failure scenario: a credential deliberately formatted into a log call is
   emitted as `[redacted]`.
10. `FACTORFLOW_MASSIVE_BASE_URL` unset yields `https://api.massive.com`; any
    value whose scheme is not `https`, loopback `http` included, prevents the
    release ingestion process from starting. Only the test-only entry point of
    section 2.2c accepts loopback `http` (clause 2a, under CONST-SEC 1.2), and
    only with a designated test credential, checked at start and at every
    claim.
11. Failure scenario: a base URL that breaks any clause of section 2.2c fails
    start with a message naming `FACTORFLOW_MASSIVE_BASE_URL` and the clause,
    containing neither the submitted value nor the API key.
12. `docker compose up -d` on a machine with host networking, with only the
    three variables of section 2.8.3 set, starts PostgreSQL, then an
    application container that migrates an empty store to the image's highest
    version and serves `GET /api/health` and `GET /` on `127.0.0.1:8000`, then
    an ingestion container from the same image (B1, B3, B4).
13. On that deployment, neither port 8000 nor port 5432 accepts a connection on
    any non-loopback address of the machine (AC-14).
14. Failure scenario: with any of the three variables unset, `docker compose up`
    stops before starting a container and names the variable; with the store
    ahead of the image, the application container exits 2 and the ingestion
    container never starts (AC-16).

## 9. Workflows

- **New workflow: owner supplies configuration.** The owner enables host
  networking where Docker Desktop is used, exports the three variables of
  section 2.8.3 and runs `docker compose up -d`. This is step 2 of the
  capability's *Operate and upgrade the running product* flow.
- **New workflow: upgrade and rollback.** Section 2.8.4.
- **New workflow: verify a deployment.** The owner runs
  `scripts/deploy-smoke.sh` (section 2.8.5) after every `up`.
- **New workflow: a missing value stops the start.** The owner sees a message
  naming the variable and sets it. This is the diagnosable form of flow step 5.
- **Intersecting workflow: the first acquisition run.** The capability's *Acquire
  market data for the first time* flow has the owner supplying the credential
  before naming instruments. There is no interface field for the credential
  anywhere, by AC-13, so this step happens entirely in the environment and the
  interface reports only whether it succeeded.

## 10. UX / GUI

This component renders nothing itself, and it constrains one screen. The UX
design's Settings screen, section 1.3, specifies the credential region as
read-only presence with no field, no mask, no truncation and no last-four,
stating either *Provider credential supplied* or *Provider credential missing*,
and naming the environment variable when missing. That copy is satisfiable only
because this component exposes presence as a boolean and the value nowhere.

When health is unreachable, the UX design requires presence to render as
`coverage-unknown` rather than as missing, so the interface never reports a
credential absent on the strength of a failed request.

Internationalization: none.

## 11. API Endpoints

This component exposes no HTTP surface. It supplies values to components that
do.

| Endpoint | Method/Operation | Auth/Privilege | Request | Response | Notes |
|----------|-----------------|----------------|---------|----------|-------|
| Settings load | Process start, read environment | process environment | Environment variables | Validated settings objects, or a non-zero exit | Consumers are every other component in both processes |
| `credential_present()` | In-process call | none | none | boolean | Consumer is `ingestion-api`, feeding `GET /api/health`. Returns presence, never the value (AC-13) |

## 12. References

| Type | Document Name | Description | Link |
|------|---------------|-------------|------|
| Capability | CAP-001 v6 | AC-13 credential handling, AC-14 network exposure | `docs/capabilities/CAP-001-market-data-acquisition-foundation/Capability-CAP-001.md` |
| System design | CAP-001 system design v3 | Steps 37 to 39, constraints 5.11 to 5.15 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/system-design.md` |
| UX design | CAP-001 UX design v4 | Section 1.3, the credential region and its copy | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` |
| Constitution | Security Constitution v1.2 (CONST-SEC 1.2 at content revision `sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc`; clause 2a relies on its SEC-ENC-001 loopback test-double exception and takes effect only as section 2.2c states) | SEC-SEC-001, SEC-SEC-002, SEC-DAT-001, SEC-DAT-003, SEC-ENC-001, SEC-NDG-001; Definitions; How to Use, "When a version is in force" | `docs/constitutions/security.constitution.md` in the AI-agents harness |
| Review | CONST-SEC constitution reviews v1 and v2 | v1 FINDING-1 to FINDING-13 and v2 FINDING-14 to FINDING-23 on the 1.2 amendment and this design | `docs/constitutions/reviews/security-review-v1.md` and `security-review-v2.md` in the AI-agents harness |
| Review | CAP-001 specification review v6 | FINDING-3 (in-force trigger and pinned text), FINDING-5 (entry-point parameters) | `docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v6.md` |
| Review | EXP-20261009-1 expedited review v1 | ER-001 and ER-002: an unvalidated base URL chooses the credential's destination and scheme | `docs/changes/EXP-20261009-1-review-v1.md` (branch carrying EXP-20261009-1, commit `1d12e67`) |
| Decision | DEC-0031 to DEC-0037 | Loopback `http` first held BLOCKED; base URL edge-case rules; release and non-release confinement of clause 2a (PROVISIONAL); the release artifact and production launch (PROVISIONAL); the entry-point parameters, correcting DEC-0033; this project's record of relying on the SEC-ENC-001 loopback test-double exception and the pinned text (PROVISIONAL); the per-run designated test credential (PROVISIONAL) | `projects/factorflow-v2/decisions/` in the AI-agents harness |
| Constitution | Tech Stack v3 | Pydantic in the approved stack; credential supplied at runtime | `docs/constitution/tech-stack.md` |
| Release | CAP-001 release readiness v1 (NOT-READY) | Blockers B1, B3 and B4 that section 2.8 closes; the image smoke test that found them | `docs/releases/CAP-001-release-v1.md` |
| Change | EXP-20261012-1 | A missing migrations directory refuses the start (B2), which made B1 fail closed | `docs/changes/EXP-20261012-1.md` |

## 13. Traceability

| Capability AC | System Design Element | Component Design Element | Section |
|--------------|----------------------|--------------------------|---------|
| AC-13 | `runtime-config` environment load, redaction, no API echo | `SecretStr` wrapping, `RedactingFilter`, presence-only reporting | 2.3, 2.5, 2.6 |
| AC-13 | Provider reads over HTTPS (§4.2 provider row, block diagram `MC -->\|HTTPS\| EXT`) | Base URL validated `https` at start; failure message carries no value | 2.2c, 4 |
| AC-14 | Port published to `127.0.0.1`; uvicorn bound to loopback | `ApiSettings.host` default `127.0.0.1`; host-network deployment with no published port and loopback-only PostgreSQL; smoke check 4 | 2.2, 2.3, 2.8.1, 2.8.5 |
| AC-15 | Application container migrates at start | Release image carries its migrations; compose starts ingestion only after the application is healthy at a schema version | 2.8.2, 2.8.3 |
| AC-16 | Refuse an inconsistent start | A missing required value exits before any work is done | 2.4, 3 |
| AC-18 | `GET /api/health` | `credential_present()` supplying the health payload | 2.6 |
| AC-4 | Rate budget pacing | `requests_per_minute` required, not defaulted | 2.2 |
| AC-11 | Retry attempt limit before an instrument is failed | `max_attempts` default 3, sourced to the owner decision | 2.2 |
| AC-20 | Claim heartbeat and staleness window | Heartbeat and staleness variables, values recorded as needing input | 2.2, 14 |

## 14. Open Questions

1. ~~What per-request timeout, initial backoff delay, heartbeat period and
   staleness window should be used?~~ **Resolved 2026-09-05 by owner decision.**
   Timeout 30s, initial backoff 2s, throttle wait budget 300s, heartbeat 60s,
   staleness window 900s, idle poll interval 5s. Section 2.2a records why each
   number was chosen, derives the staleness window from the per-instrument worst
   case rather than picking it, and states four invariants that are enforced at
   load so a later change to one value cannot silently break reclaim.
2. ~~Rotating the provider credential requires a container restart, so
   SEC-SEC-002 is not met.~~ **Resolved 2026-09-05: the credential is reloaded
   between runs**, so the rule is met rather than waived. The owner chose
   implementation over a documented waiver, which the constitution would have
   permitted — the rule is High rather than Critical, and its enforcement clause
   allows an owner-approved waiver. Implementation was preferred because the
   credential is already unwrapped in exactly one place, making the change
   small, and because a waiver would have had to be re-justified at every
   security review and inherited by M3's live feed, where a restart genuinely
   does interrupt service. Section 2.2b carries the design.
3. ~~Should `FACTORFLOW_MASSIVE_API_KEY` be supplied to the application
   container as well as the ingestion container?~~ **Resolved 2026-09-05: yes,
   both containers**, recorded in system design v3 constraint 5.12. The
   application reads only whether the variable is set and must never read the
   value. The alternative, having ingestion record presence in the store, was
   rejected because health would then report a credential as supplied after
   ingestion had stopped, and AC-18 exists so the owner can trust that answer
   without inspecting the store. The exposure this accepts is one process holding
   a string it never sends anywhere; the test in section 7 asserting that no
   response model carries a secret-shaped field is what keeps that true.
4. ~~May `FACTORFLOW_MASSIVE_BASE_URL` use `http` when the host is loopback?~~
   **Directed 2026-10-09 by the owner; conditional on CONST-SEC 1.2.** Clause
   2a was first held BLOCKED because SEC-ENC-001 and SEC-NDG-001 (both
   Critical) did not permit it and a specification may not relax them
   (DEC-0031). Of the three ways out recorded then (amend both invariants,
   record a waiver, or keep `https`-only with a test-only path), the owner chose
   to amend both invariants with a narrow loopback test-double exception that
   never applies in a release build or a production environment. This design
   combines that amendment with the test-only path: clause 2a lives only in a
   test entry point absent from the release artifact (section 2.2c, DEC-0033,
   DEC-0034), so the release settings never accept `http`.

   The amendment is a change to the AI-agents harness constitution
   `docs/constitutions/security.constitution.md`, not to this repository. It
   is CONST-SEC 1.2, first drafted in AI-agents commit `64f61f8`, reviewed
   independently twice (`docs/constitutions/reviews/security-review-v1.md` and
   `security-review-v2.md`, both READY-WITH-WARNINGS) and reworked after each
   on the owner's direction, the second time as the last round. Version 1.2
   states four conditions, and section 2.2c meets each of them against the
   pinned text. Clause 2a takes effect only as section 2.2c, *When clause 2a is
   in force*, states (DEC-0036). It then unblocks the test-only entry point and
   its tests in section 7, the change to `scripts/run-e2e-server.sh` specified
   in section 2.2c item 5, and with them the DEC-0025 E2E acquisition stack
   running against the `http` stub once the base URL is honoured.

   *Still open, owner: constitution owner.* The owner's approval of CONST-SEC
   1.2, recorded as the `approval` block its "When a version is in force" rule
   requires, and its merge to the harness default branch; owner review of
   DEC-0033 to DEC-0037 (DEC-0035 corrects DEC-0033's signature sentence, and
   DEC-0037 replaces the fixed key DEC-0025 and DEC-0033 name). DEC-0031 still
   reads `status: open`. The decisions tooling has no command to mark a record
   superseded or to edit it, so superseded text stays in place until the owner
   reviews it.
5. **How is the production ingestion container launched?** DEC-0034 requires
   it to run from an image that installs only the `factorflow` distribution,
   but nothing in the repository defines it. The `Dockerfile`'s command starts
   only the migrator and the API, the comment there puts the ingestion
   container out of scope, no compose file exists although section 3 assumes
   one, and the README starts the runner from a source checkout with `uv run`.
   The choice is between the same image with `python -m
   factorflow.ingestion_main` as the container command and a second image
   built the same way. Either one satisfies clause 2a's confinement. Running
   production from a source checkout satisfies neither. *Owner: capability
   owner. Blocks: the deployment evidence that the release artifact excludes
   clause 2a.*

   **Resolved 2026-10-12 by owner decision: the same image**, with
   `python -m factorflow.ingestion_main` as the ingestion service's command
   in `compose.yaml` (section 2.8.3).
6. **What is the standing of the product's other host-local plaintext
   channels under SEC-ENC-001?** Open; nothing is decided here. CONST-SEC 1.2's
   Exception Record lists three: the owner interface's production loopback hop,
   which `component-design-ingestion-api.md` section 4 reads as not engaging
   SEC-ENC-001; the application's and ingestion's production connections to
   PostgreSQL (`FACTORFLOW_DATABASE_URL`, which this component loads), for
   which no design states transport encryption; and the E2E stack's connection
   to its real `postgres:16` container without TLS. The loopback test-double
   exception covers none of them. The ingestion-api design is approved, so it
   is not changed here. *Owner: constitution owner. Blocks: nothing in this
   component's clause 2a; the standing of ingestion-api's section 4 reading,
   the database connection settings, and the release-readiness security
   evidence.*
7. ~~Which Node.js version builds the interface?~~ **Resolved 2026-10-12: Node.js 22, recorded in tech stack v5.** The tech stack names
   TypeScript 5.x, React 18 and Vite, not a Node version. Section 2.8.2 uses
   `node:22-slim`, the version the frontend validation commands run on today.
   *Owner: tech stack owner. Blocks: nothing; the tech stack should record it.*
8. ~~System design change recommended.~~ **Applied 2026-10-12 on the owner's direction, in system design v7.** System design section 1
   states that the interface's "port is published to `127.0.0.1` only". With
   host networking (section 2.8.1, owner decision 2026-10-12) no port is
   published: the API binds the machine's loopback directly and PostgreSQL
   listens on loopback only. Recommended wording: "the containers run in the
   host network namespace, the API binds `127.0.0.1` and PostgreSQL listens on
   `127.0.0.1` only, so nothing listens on another interface". AC-14 is
   unchanged, and so are its two-control structure and DAC-E1-S3-4. The same
   wording appears in the system design's AC traceability table (section 7,
   AC-14 row: "Port published to `127.0.0.1` only; uvicorn bound to loopback"),
   which should read "Host-network deployment with nothing published;
   uvicorn bound to loopback". Constraint 5.11's "The container publishes its
   port to `127.0.0.1` only. The absence of authentication is sound solely
   because of that binding" should likewise name the loopback bind and the
   host-network deployment as the binding. Affected: system design section 1, constraint
   5.11 and the AC-14 traceability row; this component; `ingestion-api`
   sections 3 and 4. *Owner: system design owner.*
