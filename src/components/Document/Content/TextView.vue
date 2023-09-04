<script setup lang="ts">
import { OverridesGetter, TextShape, OverrideShape } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { renderTextShape as r } from "@kcdesign/data"
import { renderOverride } from "@kcdesign/data"

const props = defineProps<{ data: TextShape, overrides?: OverridesGetter }>();
const reflush = ref(0);
let override: OverrideShape | undefined = props.overrides?.getOverrid(props.data.id);

const watcher = () => {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})

watchEffect(() => {
    if (!props.overrides) {
        if (override) {
            override.unwatch(watcher);
            override = undefined;
        }
        return;
    }
    const o = props.overrides.getOverrid(props.data.id);
    if (o === override) {
        // undefined
    }
    else if (o && override && o.id !== override.id) {
        override.unwatch(watcher);
        o.watch(watcher);
    }
    else if (o) {
        o.watch(watcher);
    }
    else if (override) {
        override.unwatch(watcher);
    }
    override = o;
})

onMounted(() => {
    if (override) override.watch(watcher);
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    if (override) override.unwatch(watcher);
    stopWatch();
})
function render() {
    if (override) return renderOverride(h, props.data, override, reflush.value !== 0 ? reflush.value : undefined)
    return r(h, props.data, reflush.value !== 0 ? reflush.value : undefined);
}

</script>

<template>
    <render />
</template>