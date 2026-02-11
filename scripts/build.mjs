import { spawn } from "node:child_process";

// Cursor/extension terminals may inject standalone runtime config that breaks next build.
delete process.env.__NEXT_PRIVATE_STANDALONE_CONFIG;

const child = spawn(process.execPath, ["./node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
