import fs from "fs";
import path from "path";
import {
  NODE_SKIP_CLASS,
  SHORTCODE_PROCESSING_FLAG,
  PARTIAL_PROCESSING_FLAG,
} from "./config.js";

export function stageHugoSite(tempSiteDir: string) {
  const partialsDir = path.join(tempSiteDir, "layouts", "partials");

  // Create the partials directory if it doesn't exist
  if (!fs.existsSync(partialsDir)) {
    fs.mkdirSync(partialsDir, { recursive: true });
  }

  // Stage the partials and shortcodes
  stagePartials(partialsDir);
  createShortcodeManifestPartial(tempSiteDir);

  const shortcodesDir = path.join(tempSiteDir, "layouts", "shortcodes");
  if (fs.existsSync(shortcodesDir)) {
    stageShortcodes(shortcodesDir);
  }
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

function stagePartials(dir: string) {
  const partialFiles = fs.readdirSync(dir);

  for (const file of partialFiles) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      stagePartialFile(filePath);
    }
    // recursively wrap shortcodes in subdirectories
    else if (fs.statSync(filePath).isDirectory()) {
      stagePartials(filePath);
    }
  }
}

function stagePartialFile(path: string) {
  // skip the injected shortcode manifest partial if present
  if (path.endsWith("shortcode-manifest.html")) {
    return;
  }

  const oldFileContents = fs.readFileSync(path, "utf-8");

  const newFileContents = `
{{- $caller := . }}
{{- $manifest := dict
    "partialPath" .Template.Name
    "pagePath" (or .Page.File.Path "N/A")
    "params" (dict "example" "value")
}}

<div class="partial-manifest"
  data-partial-manifest='{{ $manifest | jsonify }}'>
</div>
<div class="${PARTIAL_PROCESSING_FLAG} ${NODE_SKIP_CLASS}">
${oldFileContents}
</div>`;

  fs.writeFileSync(path, newFileContents);
}

function createShortcodeManifestPartial(tempSiteDir: string) {
  const partialsDir = path.join(tempSiteDir, "layouts", "partials");

  // Ensure the partials directory exists
  if (!fs.existsSync(partialsDir)) {
    fs.mkdirSync(partialsDir, { recursive: true });
  }

  const manifestFilePath = path.join(partialsDir, "shortcode-manifest.html");

  const manifestFileContents = `
{{- $manifest := dict "nodeName" .Name "params" .Params -}}
{{- with .Inner }}
  {{- $inner := printf "%s" . | safeHTML }}
  {{- $manifest = merge $manifest (dict "inner" $inner) }}
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
