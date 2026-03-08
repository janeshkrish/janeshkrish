const fs = require("fs");

const SOURCE_OWNER = "janeshkrish";
const SOURCE_REPO = "DSA";
const SOURCE_BRANCH = "main";
const OUTPUT_FILE = "dsa-stats.json";

async function fetchRepoTree() {
  const url = `https://api.github.com/repos/${SOURCE_OWNER}/${SOURCE_REPO}/git/trees/${SOURCE_BRANCH}?recursive=1`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "janeshkrish-profile-readme-stats",
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function countDsaStats(tree) {
  const stats = {
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  };

  for (const entry of tree) {
    if (entry.type !== "blob" || !entry.path.toLowerCase().endsWith(".java")) {
      continue;
    }

    const normalized = `/${entry.path.toLowerCase()}/`;
    stats.total += 1;

    if (normalized.includes("/easy/")) {
      stats.easy += 1;
    } else if (normalized.includes("/medium/")) {
      stats.medium += 1;
    } else if (normalized.includes("/hard/")) {
      stats.hard += 1;
    }
  }

  return stats;
}

async function main() {
  const data = await fetchRepoTree();
  const stats = countDsaStats(data.tree || []);
  const payload = {
    source_repo: `${SOURCE_OWNER}/${SOURCE_REPO}`,
    source_branch: SOURCE_BRANCH,
    ...stats,
    updated_at: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Updated ${OUTPUT_FILE}:`, payload);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
