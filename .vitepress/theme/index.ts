// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import Marketplace from "./components/views/Marketplace.vue";
import Plugin from "./components/views/Plugin.vue";
import Authors from "./components/views/Authors.vue";
import Author from "./components/views/Author.vue";

export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component("marketplace", Marketplace);
    app.component("plugin", Plugin);
    app.component("authors", Authors);
    app.component("author", Author);
  },
};
