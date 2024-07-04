import { onMounted } from "vue";

export const updateTitle = (title: string) =>
  onMounted(() => {
    document.title = /* "NativeScript Marketplace - " +  */ title;
  });
