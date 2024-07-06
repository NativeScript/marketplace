<script setup lang="ts">
import json from "./../../../../src/data/plugins.json";
//@ts-ignore
import jsonWithReadme from "./../../../../src/data/pluginData.dat?raw";
import { useData } from "vitepress";
import { Plugin } from "../types";
import Icon from "../Icon.vue";
import { updateTitle } from "../../utils/title";

const { params } = useData();

const plugin = (json as Plugin[]).find(
  (plugin) => plugin.name === params?.value?.pkg
) as Plugin;
const dataPlugins = JSON.parse(jsonWithReadme);
const readme = dataPlugins[plugin.name].readme;

updateTitle(params?.value?.pkg);
</script>

<template>
  <div class="p-4 px-[1.1rem] md:px-[32px]">
    <div class="flex flex-col-reverse lg:flex-row w-full">
      <div
        v-if="
          !readme.includes('No README found.') &&
          !readme.includes('No README data found')
        "
        v-html="readme"
        class="markdown-body vp-doc lg:pr-8 flex-1 pt-6 lg:pt-0"
      ></div>
      <div v-else class="text-2xl font-bold py-2 lg:pr-8 flex-1 pt-6 lg:pt-0">
        {{ plugin.name }}
      </div>
      <div
        class="lg:w-[300px] w-full text-gray-400 font-medium mt-2 lg:mt-[3rem] lg:sticky top-[80px] self-baseline"
      >
        <a :href="plugin.links.homepage" target="_blank">
          <div
            class="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 transition ease-in w-full justify-center font-medium rounded-md text-sm gap-x-2.5 px-3.5 py-2.5 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-700 dark:text-gray-200 disabled:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 shadow-none bg-primary/40 hover:bg-primary/50 inline-flex items-center cursor-pointer"
          >
            Documentation
          </div>
        </a>
        <div class="flex mt-6">
          <Icon icon="show_chart" class="self-end pb-1"></Icon>
          <div class="ml-1">
            <div class="text-xs">Monthly Downloads</div>
            <span>{{ plugin.downloadStats.lastMonth }}</span>
          </div>
        </div>

        <div class="flex mt-4">
          <Icon icon="label" class="self-end pb-1"></Icon>
          <div class="ml-1">
            <div class="text-xs">Latest Version</div>
            <span>v{{ plugin.version }}</span>
          </div>
        </div>
        <div class="flex mt-4">
          <Icon icon="group" class="self-end pb-1"></Icon>
          <div class="ml-1">
            <div class="text-xs">Team/User</div>
            <span>{{ plugin.author.username }}</span>
          </div>
        </div>
        <div
          class="flex border-gray-200 dark:border-gray-800 w-full border-t border-solid my-4"
        ></div>
        <div>
          <h4 class="text-white">Github</h4>
          <a :href="plugin.links.repository" target="_blank">
            <div class="mt-2 text-sm flex items-center">
              <span>View Source</span>
              <Icon
                icon="chevron_right"
                class="self-end"
                style="font-size: 16px"
              ></Icon>
            </div>
          </a>
        </div>
        <div
          class="flex border-gray-200 dark:border-gray-800 w-full border-t border-solid my-4"
        ></div>
        <div>
          <h4 class="text-white">npm</h4>
          <a :href="plugin.links.npm" target="_blank">
            <div class="mt-2 text-sm flex items-center">
              <span>Package</span>
              <Icon
                icon="chevron_right"
                class="self-end"
                style="font-size: 16px"
              ></Icon>
            </div>
          </a>
        </div>
        <div
          class="flex border-gray-200 dark:border-gray-800 w-full border-t border-solid my-4"
        ></div>
        <div>
          <h4 class="text-white">Maintainers</h4>
          <div class="mt-2 flex -space-x-1 overflow-hidden mt-2">
            <a
              v-for="(maintainer, i) in plugin.maintainers"
              :key="i"
              :title="maintainer.username"
              :href="`https://github.com/${maintainer.username}`"
              target="_blank"
            >
              <img
                :src="`https://github.com/${maintainer.username}.png?size=24`"
                class="inline-block h-6 w-6 cursor-pointer rounded-full ring-2 ring-white dark:ring-slate-800 min-h-6 min-w-6"
              />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!--  <div ref="test"></div> -->
  </div>
</template>
