<script setup lang="ts">
import jsonAuthors from "./../../../../src/data/authors.json";
import { Author } from "../types";
import Search from "../Search.vue";
import { ref, computed } from "vue";

const authors: Author[] = jsonAuthors as any;
const search = ref();
const dataFiltered = computed(() =>
  authors
    .filter((author) =>
      search.value
        ? author.name
            ?.toLocaleLowerCase()
            .includes(search.value?.toLocaleLowerCase()) ||
          author.username
            ?.toLocaleLowerCase()
            .includes(search.value?.toLocaleLowerCase())
        : author
    )
    .sort((a, b) => b.plugins.length - a.plugins.length)
);

function getBadgeChars(name: string) {
  const splitName = name.split(" ");
  if (splitName.length > 1) {
    return splitName[0].charAt(0) + splitName[1].charAt(0);
  }
  return name.substring(0, 2);
}
</script>

<template>
  <div class="p-4 px-[1.1rem] md:px-[32px]">
    <div>
      <h2 class="text-2xl font-bold">Plugis Autors</h2>
      <div class="relative grow md:grow-0 lg:grow mt-6">
        <Search v-model="search" placeholder="Search a autor"></Search>
      </div>
    </div>
    <div
      class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <a
        v-for="(author, i) in dataFiltered"
        :key="i"
        :href="`/author/${author.username}`"
      >
        <div class="flex items-center p-3 bg-secondary rounded-lg">
          <div
            class="w-[55px] h-[55px] bg-ns flex items-center justify-center rounded-full"
          >
            {{ getBadgeChars(author.name).toUpperCase() }}
          </div>
          <div class="ml-2">
            <div class="font-bold">{{ author.name }}</div>
            <div class="text-gray-400">{{ author.plugins.length }} plugins</div>
          </div>
        </div>
      </a>
    </div>
    <div
      v-if="dataFiltered.length === 0 && authors.length != 0"
      class="text-center mt-6"
    >
      No Authors found
    </div>
  </div>
</template>
