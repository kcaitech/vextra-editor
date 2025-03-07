/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ locate: 'left' | 'right' }>();
const locate = computed<string>(() => props.locate === "left" ? "top:0;left: 0" : "top:0;right: 0");
const assist = computed(() => {
    const c = "width: 4px;height: 100%;background-color: transparent;position: absolute;top:0;"
    return props.locate === "left" ? c + "left: -2px" : c + "right: -2px";
});

const emits = defineEmits<{
    (e: "offset", offset: number): void;
}>();
const working = ref<boolean>(false);
const divider = ref<HTMLDivElement>();

function down() {
    if (working.value) return;
    working.value = true;
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);
    window.addEventListener("blur", end);
}

function move(event: MouseEvent) {
    emits("offset", event.movementX);
}

function end() {
    working.value = false;
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", end);
    window.removeEventListener("blur", end);
}
</script>
<template>
<div class="divider" :style="locate" @mousedown="down">
    <div :style="assist"/>
    <div v-if="working" ref="divider" class="active"/>
    <div v-if="working" class="mask"/>
</div>
</template>
<style lang="scss" scoped>
@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.divider {
    width: 2px;
    height: 100%;
    cursor: ew-resize;
    position: absolute;
    z-index: 1;

    > .active {
        width: 2px;
        height: 100%;
        background-color: var(--active-color);
        position: absolute;
        animation: fade-in 0.15s ease-in-out forwards;
    }

    > .mask {
        position: fixed;
        z-index: 2;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: transparent;
        cursor: ew-resize;
    }
}
</style>