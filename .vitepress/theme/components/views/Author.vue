<script setup lang="ts">
import json from "./../../../../src/data/authors.json";
import { useData } from "vitepress";
import { Author } from "../types";
import PluginList from "../PluginList.vue";
import Search from "../Search.vue";
import { ref, computed } from "vue";
import { updateTitle } from "../../utils/title";

const { params } = useData();
const author: Author = (json as any).find(
  (author: Author) => author.username === params?.value?.pkg
);

const search = ref();

const pluginsFiltered = computed(() =>
  author.plugins.filter((plugin) =>
    search.value
      ? plugin.name
          ?.toLocaleLowerCase()
          .includes(search.value?.toLocaleLowerCase()) ||
        plugin.description
          ?.toLocaleLowerCase()
          .includes(search.value?.toLocaleLowerCase())
      : plugin
  )
);

updateTitle(params?.value?.pkg);
</script>

<template>
  <div class="p-4 px-[1.1rem] md:px-[32px]">
    <div>
      <h2 class="text-2xl font-bold">
        {{ author.name }} <span class="font-extralight">|</span>
        {{ author.plugins.length }} Plugins
      </h2>
      <div class="relative grow md:grow-0 lg:grow mt-6">
        <Search v-model="search" placeholder="Search a plugin"></Search>
      </div>
    </div>

    <PluginList :data="pluginsFiltered"></PluginList>
    <div
      v-if="pluginsFiltered.length === 0 && author.plugins.length != 0"
      class="text-center mt-6"
    >
      No packages found for author {{ author.name }}
    </div>
  </div>
</template>
