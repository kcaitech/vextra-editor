<script setup lang="ts">
import { OverridesGetter, TextShape, OverrideShape } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { renderOverride } from "@kcdesign/data"

const props = defineProps<{ data: TextShape, overrides?: OverridesGetter }>();
const reflush = ref(0);
let override: OverrideShape | undefined = props.overrides?.getOverrid(props.data.id);

// 需要watch的数据
// 1. props的data,可能切换对象
// 2. props的overrides,同上
// 3. props.data,需要监听对象数据变更
// 4. props.overrides, 同上
// 5. override, 如果存在也要监听

const overridesWatcher = () => {
    if (!override) {
        override = props.overrides?.getOverrid(props.data.id);
        if (override) override.watch(watcher);
    }
}

watch(() => props.overrides, (val, old) => {
    if (override) override.unwatch(watcher);
    override = undefined;
    if (old) old.unwatch(overridesWatcher);
    if (val) {
        val.watch(overridesWatcher);
        override = val.getOverrid(props.data.id);
        if (override) override.watch(watcher);
    }
})

const watcher = () => {
    reflush.value++;
}
watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})

onMounted(() => {
    if (override) override.watch(watcher);
    if (props.overrides) props.overrides.watch(overridesWatcher);
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    if (override) override.unwatch(watcher);
    if (props.overrides) props.overrides.unwatch(overridesWatcher);
})
function render() {
    if (override) return renderOverride(h, props.data, override, reflush.value !== 0 ? reflush.value : undefined)
    return r(h, props.data, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render />
</template>