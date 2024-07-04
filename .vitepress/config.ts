import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "./doc",
  outDir: "./dist",
  lang: "en-US",
  appearance: "force-dark",
  title: "NativeScript Marketplace",
  description: "NativeScript Marketplace",
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/svg",
        sizes: "32x32",
        href: "https://raw.githubusercontent.com/NativeScript/artwork/92d179ecb79dbbbb0d5329af8c0f477bc3dd0392/logo/export/NativeScript_Logo_Blue_White_Rounded.svg",
      },
    ],

    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet",
      },
    ],
  ],
  cleanUrls: true,
  themeConfig: {
    logo: "https://raw.githubusercontent.com/NativeScript/artwork/92d179ecb79dbbbb0d5329af8c0f477bc3dd0392/logo/export/NativeScript_Logo_White_Blue_Rounded.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Autors", link: "/autors" },
      { text: "Publish your package", link: "/publish-package" },
      {
        text: "NativeScript",
        link: "https://nativescript.org/",
        target: "_black",
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/NativeScript/marketplace" },
    ],
  },
});
