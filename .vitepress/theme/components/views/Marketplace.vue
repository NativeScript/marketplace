<script setup lang="ts">
import json from "./../../../../src/data/plugins.json";
import Search from "../Search.vue";
import PluginList from "../PluginList.vue";
import { ref, computed } from "vue";
import { Plugin } from "../types";

const search = ref("");

const dataFiltered = computed(() =>
  (json as Plugin[]).filter((plugin) =>
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
</script>

<template>
  <div class="p-4 px-[1.1rem] md:px-[32px]">
    <div
      class="md:border-[1px] grid grid-cols-1 sm:grid-cols-2 border-ns rounded-2xl my-4 relative"
    >
      <div
        class="flex justify-center items-center sm:items-start flex-col p-3 pl-8"
      >
        <div class="text-6xl">Plugins</div>
        <div class="text-2xl mt-3 text-gray-400 text-center sm:text-start">
          Discover a comprehensive list of
          <span class="text-ns font-bold">NativeScript</span> plugins to enhance
          your app development experience.
        </div>
      </div>

      <div class="flex items-center justify-center relative p-24 sm:p-0">
        <div
          class="absolute rounded-2xl"
          style="
            height: 100%;
            width: 100%;
            background: rgb(255, 255, 255);
            background: radial-gradient(
              circle,
              #65adf1 0%,
              #65adf1 0%,
              rgba(15, 23, 42, 1) 60%
            );
          "
        ></div>
        <img
          class="h-[200px] w-[200px]"
          style="z-index: 1"
          src="https://raw.githubusercontent.com/NativeScript/artwork/92d179ecb79dbbbb0d5329af8c0f477bc3dd0392/logo/export/NativeScript_Logo_White_Transparent.svg"
        />
      </div>
    </div>

    <div class="relative grow md:grow-0 lg:grow mt-8">
      <Search v-model="search" placeholder="Search a package"></Search>
    </div>
    <PluginList :data="dataFiltered"></PluginList>
    <div
      v-if="dataFiltered.length === 0 && json.length != 0"
      class="text-center mt-6"
    >
      No packages found
    </div>
  </div>
</template>
