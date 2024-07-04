<script setup lang="ts">
import Icon from "./Icon.vue";
import { Plugin } from "./types";
import { computed } from "vue";

const props = defineProps<{ data: Plugin[] }>();
const dataSort = computed(() =>
  props.data.sort((a, b) => {
    return b.downloadStats.lastMonth - a.downloadStats.lastMonth;
  })
);
</script>

<template>
  <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <a
      v-for="(plugin, i) in dataSort"
      :key="i"
      :href="'/plugins/' + plugin.name"
      class=""
    >
      <div
        class="rounded-xl p-3 bg-secondary flex flex-col justify-between h-full"
        style="box-shadow: inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1)"
      >
        <div>
          <div class="font-bold text-lg">{{ plugin.name }}</div>
          <div class="text-gray-400 mt-2 line-clamp-2">
            {{ plugin.description }}
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div>
            <div class="inline-flex justify-center items-center text-[14px]">
              <span>{{ plugin.downloadStats.lastMonth }}</span>
              <Icon icon="download" style="font-size: 18px" />
            </div>
            <div
              class="inline-flex justify-center items-center ml-2 text-[14px]"
            >
              <span>v.{{ plugin.version }}v</span>
            </div>
          </div>
          <div class="text-gray-400 inline-flex items-center">
            <Icon icon="person" style="font-size: 18px" />
            by {{ plugin.author.username }}
          </div>
        </div>
      </div>
    </a>
  </div>
</template>
