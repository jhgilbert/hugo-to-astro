import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Not how we would typically get these paths,
// but it's not that serious
export const HUGO_SITE_DIR = __dirname + "/../../example_hugo_site";
export const ASTRO_SITE_DIR = __dirname + "/../../example_astro_site";

export const NODE_SKIP_CLASS = "h2a-skip";
