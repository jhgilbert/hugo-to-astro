# Hugo to Astro

Exploring a method of migrating from Hugo to Astro by

- converting Hugo content into a Markdoc AST
- using the Markdoc AST to build the Astro markup file

This repo is just intended as a proof of concept for the basic mechanism, which can be adapted further as needed.

## Components

This repo has three components:

- An example Hugo site
- An example Astro site
- A TypeScript package, `h2a-migrator`, that migrates content from Hugo to Astro
