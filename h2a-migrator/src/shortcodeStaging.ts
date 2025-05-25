import fs from "fs";
import path from "path";

export function stageShortcodes(dir: string) {
  const shortcodeFiles = fs.readdirSync(dir);

  for (const file of shortcodeFiles) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      console.log(`Wrapping shortcode file: ${file}`);
      stageShortcodeFile(filePath);
    }
    // recursively wrap shortcodes in subdirectories
    else if (fs.statSync(filePath).isDirectory()) {
      stageShortcodes(filePath);
    }
  }
}

/**
 * Wrap each shortcode file in a div, and add a script tag
 * containing any params passed to the shortcode.
 *
 * TODO: Programmatically add the shortcode manifest partial
 * instead of including it in the example Hugo site.
 */
function stageShortcodeFile(path: string) {
  const oldFileContents = fs.readFileSync(path, "utf-8");

  const newFileContents = `
{{ partial "shortcode-manifest.html" . }}
<div class="hugo-shortcode">
${oldFileContents}
</div>`;

  fs.writeFileSync(path, newFileContents);
}
