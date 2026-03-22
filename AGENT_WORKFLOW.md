# AI Agent Workflow Log

## Agents Used
- Claude Code / Agentic Copilot (Antigravity architecture)

## Prompts & Outputs
**Example 1: Initial Planning Phase**
- Prompt: "Create a backend and frontend implementation following Hexagonal Architecture using Node.js, Express, Postgres, and React/Tailwind."
- Output: Generated the `implementation_plan.md` outlining the separation of concerns (Core Domains, Application UseCases, Ports, Adapters).

**Example 2: PostgreSQL Migration**
- Prompt: "implement but okay we can proceed with postgresql instead of mysql"
- Output: The agent updated `package.json` to replace `mysql2` with `pg`, reconfigured the DB connections, and generated `schema.sql` tailored for Postgres (using `SERIAL PRIMARY KEY`).

## Validation / Corrections
1. **Module Resolution Errors:**
   - *Issue*: TypeScript was originally configured with `"module": "nodenext"` and `"type": "module"`, causing imports to require `.js` extensions everywhere.
   - *Correction*: Validated the compiler errors and instructed the agent to rewrite `tsconfig.json` properties to use `"module": "CommonJS"` and `"moduleResolution": "node"`, escaping the `.js` path constraints.
2. **Missing Tests:**
   - *Issue*: The backend `package.json` lacked proper Jest testing suites originally.
   - *Correction*: Executed `npm install -D jest ts-jest` and generated `ComplianceService.test.ts` to ensure core calculations were thoroughly tested without connecting to a live DB.

## Observations
- **Where agent saved time:** Boilerplate code for React components and Express API routes was instantly written with correct typings based on the created entities. Structuring the Ports & Adapters architecture takes time to write generic interfaces, which the agent handled in seconds.
- **Where it failed or hallucinated:** The agent originally misconfigured the TS `moduleResolution` in `package.json`, creating linting issues across the adapter layer. It also briefly struggled with PowerShell's execution syntax for chaining npm commands (`&&`), which had to be separated.
- **How you combined tools effectively:** The agent utilized `write_to_file` to structure the folder tree rapidly and `multi_replace_file_content` to fix line-by-line configuration settings concurrently.

## Best Practices Followed
- **Plan, then Execute:** A comprehensive `implementation_plan.md` was drafted and reviewed before committing code.
- **Task Management:** A `task.md` checklist was strictly adhered to, marking modules as complete sequentially.
- **Atomic Operations:** Distinct application layers (domain, ports, outbound adapters, inpatient adapters) were created natively separate in isolated tool-calls preventing tightly coupled mistakes.
