<script lang="ts" setup>
import { onMounted, ref } from 'vue';
interface Props {
  code: string
}
const props = defineProps<Props>();
const render_code = ref<string>(props.code);
function is_mac() {
  return /macintosh|mac os x/i.test(navigator.userAgent);
}
function init_code() {
  if (is_mac()) {
    let src = props.code;
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
  <span>
    {{ render_code }}
  </span>
</template>
<style scoped lang="scss"></style>