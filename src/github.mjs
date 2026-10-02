import { withGithubPrompt } from "./github-prompt.mjs";
import { checkVersions, bumpVersion } from "./version.mjs";
import { readLatestEntry } from "./changelog.mjs";
import { run } from "./repository.mjs";

export async function githubNow(root, { dryRun = false, ask } = {}) {
  checkVersions(root);
  const git = (args, capture = false) => run(root, "git", args, capture);
  const status = git(["status", "--short"], true);
  const latest = readLatestEntry(root);
  const defaultSubject = `#${latest.reference} - ${latest.title}`;
  const files = status ? status.split("\n").filter(Boolean) : [];
  console.info(`\n  Changelog version: ${latest.version}`);
  console.info(`  Commit subject:    ${defaultSubject}`);
  console.info(`  Uncommitted:       ${files.length} files\n`);
  for (const file of files) console.info(`    ${file}`);
  console.info(
    renderReviewBox({ version: latest.version, subject: defaultSubject, fileCount: files.length })
  );
  if (dryRun) {
    console.info("Dry run. No version change, fetch, pull, stage, commit, tag, or push.");
    return;
  }
  const branch = git(["symbolic-ref", "--short", "HEAD"], true);
  let upstream;
  let firstPush = false;
  try {
    upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], true);
  } catch {
    git(["remote", "get-url", "origin"], true);
    upstream = `origin/${branch}`;
    firstPush = true;
  }
  await withGithubPrompt(async (ask) => {
    const answer = await ask("  Bump next version before commit? [y/N]: ");
    let subject = defaultSubject;
    let bumpOptions;
    if (/^(y|yes)$/i.test(answer.trim())) {
      const title =
        (await ask("  Version title [version update]: ", "version update")).trim() ||
        "version update";
      const note = await ask(
        "  Changelog note [Updated package maintenance.]: ",
        "Updated package maintenance."
      );
      bumpOptions = { title, note };
      bumpVersion(root, { ...bumpOptions, dryRun: true });
      subject = `#${Number(latest.version.split(".")[2]) + 1} - ${title}`;
    }
    subject = (await ask(`  Commit message [${subject}]: `, subject)).trim() || subject;
    if (/[\r\n]/.test(subject)) throw new Error("Commit subject must be one line.");
    const confirmation = await ask("  Continue with pull, commit, and push? [y/N]: ");
    if (!/^(y|yes)$/i.test(confirmation.trim())) {
      console.info("Cancelled without changes.");
      return;
    }
    git(["fetch", "--quiet"]);
    let remoteExists = false;
    let headExists = false;
    try {
      git(["rev-parse", "--verify", "--quiet", upstream], true);
      remoteExists = true;
    } catch {}
    try {
      git(["rev-parse", "--verify", "--quiet", "HEAD"], true);
      headExists = true;
    } catch {}
    if (remoteExists && !headExists)
      throw new Error("Remote branch already contains history. Clone it before the initial push.");
    const behind = remoteExists
      ? Number(git(["rev-list", "--count", `HEAD..${upstream}`], true))
      : 0;
    if (behind) git(["pull", "--rebase", "--autostash", ...(firstPush ? ["origin", branch] : [])]);
    if (git(["diff", "--name-only", "--diff-filter=U"], true))
      throw new Error("Pull left conflicts. Resolve them before staging or committing.");
    if (readLatestEntry(root).version !== latest.version)
      throw new Error("Pull changed the release version. Review it and run github:now again.");
    if (bumpOptions) bumpVersion(root, bumpOptions);
    git(["add", "-A"]);
    if (git(["diff", "--cached", "--name-only"], true)) git(["commit", "-m", subject]);
    else console.info("  No changes to commit.");
    git(firstPush ? ["push", "--set-upstream", "origin", branch] : ["push"]);
    console.info(`Committed and pushed ${subject}. No release tag was created.`);
  }, ask);
}

export function renderReviewBox({ fileCount, subject, version }) {
  const rows = [
    "GitHub Commit Review",
    `Version: ${version}`,
    `Subject: ${subject}`,
    `Files: ${fileCount}`
  ];
  const width = Math.max(...rows.map((row) => row.length)) + 4;
  const border = `+${"-".repeat(width)}+`;
  return ["", border, ...rows.map((row) => `| ${row.padEnd(width - 2)} |`), border, ""].join("\n");
}
