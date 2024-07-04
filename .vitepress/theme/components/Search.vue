<script setup lang="ts">
import Icon from "./Icon.vue";

const search = defineModel();
defineProps<{ placeholder: string }>();
</script>

<template>
  <input
    name="search"
    v-model="search"
    type="text"
    :placeholder
    class="relative block w-[200px] md:w-[300px] disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 transition ease-in form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-3.5 py-2.5 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 shadow-none bg-gray-300/20 hover:bg-gray-300/40 dark:bg-secondary dark:hover:bg-secondary/50 ps-11"
  />
  <span
    class="absolute inset-y-0 start-0 flex items-center pointer-events-none px-3.5"
    ><Icon
      icon="search"
      class="flex-shrink-0 text-gray-400 dark:text-gray-500 h-5 w-5"
    ></Icon
  ></span>
</template>
