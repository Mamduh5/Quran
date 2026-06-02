import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe("admin UI authoritative content safety", () => {
  it("does not include direct edit form fields for Quran, translation, or tafsir text", () => {
    const adminFiles = filesUnder(join(process.cwd(), "src", "app", "admin"));
    const adminSource = adminFiles
      .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(adminSource).not.toContain("<textarea");
    expect(adminSource).not.toContain('name="text"');
    expect(adminSource).not.toContain("name='text'");
  });
});
