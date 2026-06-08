import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

async function main() {
  // Get authenticated user
  const userRes = await connectors.proxy("github", "/user", { method: "GET" });
  const user = await userRes.json() as { login: string; name: string };
  console.log(`Authenticated as: ${user.login} (${user.name})`);

  // Create the repo
  const createRes = await connectors.proxy("github", "/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name: "resume-craft",
      description: "ResumeCraft — AI-powered resume builder with live preview and multiple templates",
      private: false,
      auto_init: false,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const repo = await createRes.json() as { html_url?: string; clone_url?: string; message?: string; errors?: unknown };

  if (repo.message === "Repository creation failed." || repo.errors) {
    // Might already exist — fetch it
    console.log("Creation response:", JSON.stringify(repo));
    const existRes = await connectors.proxy("github", `/repos/${user.login}/resume-craft`, { method: "GET" });
    const existing = await existRes.json() as { html_url: string; clone_url: string };
    console.log(`REPO_URL=${existing.html_url}`);
    console.log(`CLONE_URL=${existing.clone_url}`);
    console.log(`OWNER=${user.login}`);
  } else {
    console.log(`REPO_URL=${repo.html_url}`);
    console.log(`CLONE_URL=${repo.clone_url}`);
    console.log(`OWNER=${user.login}`);
  }
}

main().catch(console.error);
