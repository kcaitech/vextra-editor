<script setup lang="ts">
import { onMounted, ref } from 'vue';
const props = defineProps<{
  content: string,
  offset?: number
}>();
const render_code = ref<string>(props.content);
function is_mac() {
  return /macintosh|mac os x/i.test(navigator.userAgent);
}
function init_code() {
  if (is_mac()) {
    let src = props.content;
    src = src.replace(/ctrl|Ctrl/g, "⌘");
    src = src.replace(/shift|Shift/g, "⇧");
    src = src.replace(/alt|Alt/g, "⌥");
    render_code.value = src;
  }
}
onMounted(() => {
  init_code();
})
</script>

<template>
  <el-tooltip class="box-item" effect="dark" :content="render_code" placement="bottom" :show-after="500"
    :offset="offset || 10" :hide-after="0">
    <slot />
  </el-tooltip>
</template>

<style scoped lang="scss">
</style>
