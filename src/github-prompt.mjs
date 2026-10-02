import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

export async function withGithubPrompt(callback, ask) {
  if (ask) return callback(ask);
  if (!process.stdin.isTTY) {
    if (process.platform !== "win32")
      throw new Error("Run github:now in an interactive terminal, or use --dry-run.");
    return callback(askWindowsModal);
  }
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await callback(
      async (query, fallback = "") => (await prompt.question(query)) || fallback
    );
  } finally {
    prompt.close();
  }
}

function askWindowsModal(query, fallback = "") {
  const quote = (value) => `'${value.replaceAll("'", "''")}'`;
  const script = /\[y\/N\]:\s*$/i.test(query)
    ? `Add-Type -AssemblyName System.Windows.Forms; $answer=[System.Windows.Forms.MessageBox]::Show(${quote(query.replace(/\s*\[y\/N\]:\s*$/i, ""))}, 'GitHub Commit Review', 'YesNo', 'Question'); if($answer -eq 'Yes'){'yes'}else{'no'}`
    : `Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::InputBox(${quote(query)}, 'GitHub Commit Review', ${quote(fallback)})`;
  return (
    execFileSync("powershell.exe", ["-NoProfile", "-STA", "-Command", script], {
      encoding: "utf8",
      windowsHide: true
    }).trim() || fallback
  );
}
