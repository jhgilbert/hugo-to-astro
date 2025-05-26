import fs from "fs";
import path from "path";
import { NODE_SKIP_CLASS, SHORTCODE_PROCESSING_FLAG } from "./config.js";

export function stageHugoSite(tempSiteDir: string) {
  createShortcodeManifestPartial(tempSiteDir);
  const shortcodesDir = path.join(tempSiteDir, "layouts", "shortcodes");
  stageShortcodes(shortcodesDir);
}

function stageShortcodes(dir: string) {
  const shortcodeFiles = fs.readdirSync(dir);

  for (const file of shortcodeFiles) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      stageShortcodeFile(filePath);
    }
    // recursively wrap shortcodes in subdirectories
    else if (fs.statSync(filePath).isDirectory()) {
      stageShortcodes(filePath);
    }
  }
}

function createShortcodeManifestPartial(tempSiteDir: string) {
  const partialsDir = path.join(tempSiteDir, "layouts", "partials");

  // Ensure the partials directory exists
  if (!fs.existsSync(partialsDir)) {
    fs.mkdirSync(partialsDir, { recursive: true });
  }

  const manifestFilePath = path.join(partialsDir, "shortcode-manifest.html");

  const manifestFileContents = `
{{- $manifest := dict "name" .Name "params" .Params -}}
{{- with .Inner }}
  {{- $manifest = merge $manifest (dict "inner" .) }}
{{- end }}
<div class="${SHORTCODE_PROCESSING_FLAG}"
  data-shortcode-manifest='{{ $manifest | jsonify }}'>
</div>
`;
  fs.writeFileSync(manifestFilePath, manifestFileContents);
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
<div class="${NODE_SKIP_CLASS} ${SHORTCODE_PROCESSING_FLAG}">
${oldFileContents}
</div>`;

  fs.writeFileSync(path, newFileContents);
}
