/**
 * Pushes workspace source files to the resume-craft GitHub repo
 * using the GitHub Git Data API (blobs → tree → commit → update ref).
 * Requires the repo to already have at least one commit on main.
 */
import { ReplitConnectors } from "@replit/connectors-sdk";
import * as fs from "fs";
import * as path from "path";

const connectors = new ReplitConnectors();
const OWNER = "prateek-cs2012";
const REPO  = "resume-craft";
const ROOT  = path.resolve("/home/runner/workspace");

const EXCLUDE = [
  "node_modules", ".git", ".cache", ".local", "dist",
  ".angular", "tmp", ".pnpm-store",
];

function shouldExclude(rel: string): boolean {
  return rel.split(path.sep).some((p) => EXCLUDE.includes(p));
}

function walkFiles(dir: string): string[] {
  const result: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (shouldExclude(path.relative(ROOT, full))) continue;
    if (e.isDirectory()) result.push(...walkFiles(full));
    else result.push(full);
  }
  return result;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gh<T = unknown>(
  endpoint: string,
  method = "GET",
  body?: unknown,
  retries = 5,
): Promise<T> {
  const opts: Parameters<typeof connectors.proxy>[2] = { method };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
    opts.headers = { "Content-Type": "application/json" };
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await connectors.proxy("github", endpoint, opts);

    if (res.status === 502 || res.status === 503 || res.status === 429) {
      const wait = 2000 * (attempt + 1);
      console.warn(`  HTTP ${res.status}, retrying in ${wait}ms… (attempt ${attempt + 1}/${retries})`);
      await sleep(wait);
      continue;
    }

    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Non-JSON (${res.status}): ${text.substring(0, 200)}`);
    }
  }

  throw new Error(`Failed after ${retries} retries for ${method} ${endpoint}`);
}

async function main() {
  // ── Step 1: get current HEAD of main ─────────────────────────────────────
  const ref = await gh<{ object?: { sha: string } }>(
    `/repos/${OWNER}/${REPO}/git/ref/heads/main`,
  );
  if (!ref?.object?.sha) throw new Error("Could not read main ref: " + JSON.stringify(ref));
  const headSha = ref.object.sha;
  console.log("Current HEAD:", headSha);

  // ── Step 2: get the tree SHA of that commit ───────────────────────────────
  const headCommit = await gh<{ tree?: { sha: string } }>(
    `/repos/${OWNER}/${REPO}/git/commits/${headSha}`,
  );
  if (!headCommit?.tree?.sha) throw new Error("Could not read commit tree: " + JSON.stringify(headCommit));
  const baseSha = headCommit.tree.sha;
  console.log("Base tree:", baseSha);

  // ── Step 3: collect files ────────────────────────────────────────────────
  const files = walkFiles(ROOT);
  console.log(`Found ${files.length} files`);

  // ── Step 4: create blobs ─────────────────────────────────────────────────
  const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];
  let done = 0;

  const MAX_BYTES = 400_000; // skip files > 400 KB (proxy body limit)

  for (const abs of files) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
    const raw = fs.readFileSync(abs);
    if (raw.length > MAX_BYTES) {
      console.warn(`  ⚠ Skipping ${rel} (${(raw.length / 1024).toFixed(0)} KB > 400 KB limit)`);
      continue;
    }
    const content = raw.toString("base64");

    const blob = await gh<{ sha?: string; message?: string }>(
      `/repos/${OWNER}/${REPO}/git/blobs`,
      "POST",
      { content, encoding: "base64" },
    );

    if (!blob?.sha) {
      console.warn(`  ⚠ Skipping ${rel}:`, blob?.message ?? JSON.stringify(blob).substring(0, 60));
      continue;
    }
    treeItems.push({ path: rel, mode: "100644", type: "blob", sha: blob.sha });
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${files.length} blobs…`);
    await sleep(150); // throttle to ~6 req/s
  }

  console.log(`Created ${treeItems.length} blobs`);

  // ── Step 5: create new tree (based on current tree) ──────────────────────
  const tree = await gh<{ sha?: string }>(
    `/repos/${OWNER}/${REPO}/git/trees`,
    "POST",
    { base_tree: baseSha, tree: treeItems },
  );
  if (!tree?.sha) throw new Error("Tree failed: " + JSON.stringify(tree));
  console.log("Tree:", tree.sha);

  // ── Step 6: create commit ─────────────────────────────────────────────────
  const commit = await gh<{ sha?: string }>(
    `/repos/${OWNER}/${REPO}/git/commits`,
    "POST",
    {
      message: "feat: initial ResumeCraft source code\n\nAngular 17 + Angular Material resume builder with AI parsing, live preview, and 3 resume templates.",
      tree: tree.sha,
      parents: [headSha],
    },
  );
  if (!commit?.sha) throw new Error("Commit failed: " + JSON.stringify(commit));
  console.log("Commit:", commit.sha);

  // ── Step 7: force-update main ─────────────────────────────────────────────
  const updated = await gh<{ ref?: string }>(
    `/repos/${OWNER}/${REPO}/git/refs/heads/main`,
    "PATCH",
    { sha: commit.sha, force: true },
  );
  console.log("Updated ref:", updated?.ref ?? JSON.stringify(updated).substring(0, 80));
  console.log(`\n✅  https://github.com/${OWNER}/${REPO}`);
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
