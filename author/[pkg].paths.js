
import json from "../src/data/authors.json";

export default {
    paths() {
      return json.map((plugin) => {
        return ({ params: { pkg: plugin.username }})
      })
    }
  }