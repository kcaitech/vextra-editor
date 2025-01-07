<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const props = defineProps<{
    code: string
}>();

const render_code = ref<string>(props.code);

function is_mac() {
    return /macintosh|mac os x/i.test(navigator.userAgent);
}

function init_code() {
    if (!is_mac()) return;
    let src = props.code;

    render_code.value = src
        .replace(/ctrl|Ctrl/g, "⌘")
        .replace(/shift|Shift/g, "⇧")
        .replace(/alt|Alt/g, "⌥");
}

onMounted(init_code);
</script>

<template>
<span>{{ render_code }}</span>
</template>