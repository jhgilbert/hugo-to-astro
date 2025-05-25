// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import markdoc from "@astrojs/markdoc";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "My Docs",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      sidebar: [
        {
          label: "Markdoc",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Test file", slug: "test" },
          ],
        },
      ],
    }),
    markdoc(),
  ],
});
