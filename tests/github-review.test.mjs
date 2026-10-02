import assert from "node:assert/strict";
import test from "node:test";
import { renderReviewBox } from "../src/github.mjs";
import { githubNow } from "../src/github.mjs";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("GitHub review matches the CXApp box and supports zero changed files", () => {
  const box = renderReviewBox({
    version: "1.0.79",
    subject: "#79 - Billing export settlement, scoped openings, and statement age",
    fileCount: 0
  });
  assert.match(box, /\| GitHub Commit Review\s+\|/);
  assert.match(box, /\| Version: 1\.0\.79\s+\|/);
  assert.match(
    box,
    /\| Subject: #79 - Billing export settlement, scoped openings, and statement age\s+\|/
  );
  assert.match(box, /\| Files: 0\s+\|/);
  const lines = box.trim().split("\n");
  assert(lines.every((line) => line.length === lines[0].length));
});

test("GitHub prompts cancel without bumping and pull before committing approved changes", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "devxcrew-github-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, "app");
  mkdirSync(join(root, "assist/documentation"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture", version: "1.0.79" }));
  writeFileSync(
    join(root, "package-lock.json"),
    JSON.stringify({ version: "1.0.79", packages: { "": { version: "1.0.79" } } })
  );
  writeFileSync(
    join(root, "assist/documentation/CHANGELOG.md"),
    "# Changelog\n\nCurrent version: 1.0.79\nRelease tag: v-1.0.79\nChangelog label: v 1.0.79\n\n## v-1.0.79\n\n### [v 1.0.79] 2026-10-02 9:00 am - Initial package\n"
  );
  const git = (cwd, args) =>
    execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const identity = (cwd) => {
    git(cwd, ["config", "core.autocrlf", "false"]);
    git(cwd, ["config", "user.name", "Tool test"]);
    git(cwd, ["config", "user.email", "tools@example.invalid"]);
  };
  git(root, ["init", "--quiet", "-b", "main"]);
  identity(root);
  git(root, ["add", "-A"]);
  git(root, ["commit", "--quiet", "-m", "Initial"]);
  const remote = join(directory, "remote.git");
  git(directory, ["init", "--quiet", "--bare", remote]);
  git(root, ["remote", "add", "origin", remote]);
  git(root, ["push", "--quiet", "-u", "origin", "main"]);
  const before = readFileSync(join(root, "package.json"), "utf8");
  const questions = [];
  const replies = ["yes", "Preview bump", "Preview note", "", "no"];
  await githubNow(root, {
    ask: async (query, fallback) => {
      questions.push(query);
      return replies.shift() || fallback || "";
    }
  });
  assert.equal(readFileSync(join(root, "package.json"), "utf8"), before);
  assert.equal(git(root, ["status", "--porcelain"]), "");
  assert.equal(questions[0], "  Bump next version before commit? [y/N]: ");
  assert.match(questions[3], /^  Commit message \[#80 - Preview bump\]: /);
  assert.equal(questions[4], "  Continue with pull, commit, and push? [y/N]: ");
  const peer = join(directory, "peer");
  git(directory, ["clone", "--quiet", "--branch", "main", remote, peer]);
  identity(peer);
  writeFileSync(join(peer, "remote.md"), "Remote change\n");
  git(peer, ["add", "-A"]);
  git(peer, ["commit", "--quiet", "-m", "Remote change"]);
  git(peer, ["push", "--quiet"]);
  writeFileSync(join(root, "local.md"), "Local change\n");
  const approved = ["no", "", "yes"];
  await githubNow(root, { ask: async (_query, fallback) => approved.shift() || fallback || "" });
  assert.equal(readFileSync(join(root, "remote.md"), "utf8"), "Remote change\n");
  assert.equal(readFileSync(join(root, "local.md"), "utf8"), "Local change\n");
  assert.equal(git(root, ["status", "--porcelain"]), "");
  assert.equal(git(root, ["log", "-1", "--format=%s"]), "#79 - Initial package");
  assert.equal(git(root, ["rev-list", "--count", "HEAD..origin/main"]), "0");
});
