
import json from "../../src/data/plugins.json";

export default {
    paths() {
      return json.map((plugin) => {
        return ({ params: { pkg: plugin.name?.trim()?.replace(" ", "_") }})
      })
    }
  }