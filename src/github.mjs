import { createInterface } from "node:readline/promises";
import { checkVersions, bumpVersion } from "./version.mjs";
import { readLatestEntry } from "./changelog.mjs";
import { run } from "./repository.mjs";

export async function githubNow(root, { dryRun = false } = {}) {
  checkVersions(root);
  const git = (args, capture = false) => run(root, "git", args, capture);
  const status = git(["status", "--short"], true);
  const latest = readLatestEntry(root);
  const defaultSubject = `#${latest.reference} - ${latest.title}`;
  console.info(
    `Version: ${latest.version}\nSubject: ${defaultSubject}\nChanges:\n${status || "None"}`
  );
  if (dryRun) {
    console.info("Dry run. No version change, fetch, pull, stage, commit, tag, or push.");
    return;
  }
  if (!status) throw new Error("There are no changes to commit.");
  if (!process.stdin.isTTY)
    throw new Error("Run github:now in an interactive terminal, or use --dry-run.");
  const branch = git(["symbolic-ref", "--short", "HEAD"], true);
  let upstream;
  try {
    upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], true);
  } catch {
    throw new Error(`Configure a remote and upstream for ${branch} before running github:now.`);
  }
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await prompt.question("Bump patch version before commit? [y/N]: ");
    let subject = defaultSubject;
    let bumpOptions;
    if (/^(y|yes)$/i.test(answer.trim())) {
      const title = await prompt.question("Version title: ");
      const note = await prompt.question("Changelog note: ");
      bumpOptions = { title, note };
      bumpVersion(root, { ...bumpOptions, dryRun: true });
      subject = `#${Number(latest.version.split(".")[2]) + 1} - ${title}`;
    }
    subject = (await prompt.question(`Commit subject [${subject}]: `)).trim() || subject;
    if (/[\r\n]/.test(subject)) throw new Error("Commit subject must be one line.");
    const confirmation = await prompt.question(
      `Fetch ${upstream}, commit on ${branch}, and push? [y/N]: `
    );
    if (!/^(y|yes)$/i.test(confirmation.trim())) {
      console.info("Cancelled without changes.");
      return;
    }
    git(["fetch", "--quiet"]);
    const behind = Number(git(["rev-list", "--count", `HEAD..${upstream}`], true));
    if (behind)
      throw new Error(
        "Upstream has new commits. Reconcile them with your local changes, then run github:now again."
      );
    if (bumpOptions) bumpVersion(root, bumpOptions);
    git(["add", "-A"]);
    git(["commit", "-m", subject]);
    git(["push"]);
    console.info(`Committed and pushed ${subject}. No release tag was created.`);
  } finally {
    prompt.close();
  }
}
