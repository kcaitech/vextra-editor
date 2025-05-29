/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { XY } from "@/context/selection";
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Menu } from "@/context/menu";

interface Props {
    context: Context;
    params: {
        site: XY;
    }
}

const props = defineProps<Props>();

const pulse = ref<boolean>(false);

function menuWatcher(t: any) {
    if (t === Menu.HIDE_PLACEMENT || t === Menu.SHUTDOWN_MENU) {
        pulse.value = false;
    } else if (t === Menu.SHOW_PLACEMENT) {
        pulse.value = true;
    }
}

onMounted(() => {
    props.context.menu.watch(menuWatcher);
});
onUnmounted(() => {
    props.context.menu.unwatch(menuWatcher);
})
</script>
<template>
<div v-if="pulse" class="container" :style="{ left:params.site.x + 'px',top:params.site.y + 'px' }">
    <div class="dot"/>
    <div class="pulse"/>
    <div class="pulse1"/>
</div>
</template>
<style lang="scss" scoped>
@keyframes warn {
    0% {
        transform: scale(0.3);
        -webkit-transform: scale(0.3);
        opacity: 0.0;
    }

    25% {
        transform: scale(0.3);
        -webkit-transform: scale(0.3);
        opacity: 0.1;
    }

    50% {
        transform: scale(0.5);
        -webkit-transform: scale(0.5);
        opacity: 0.3;
    }

    75% {
        transform: scale(0.8);
        -webkit-transform: scale(0.8);
        opacity: 0.5;
    }

    100% {
        transform: scale(1);
        -webkit-transform: scale(1);
        opacity: 0.0;
    }
}

@keyframes warn1 {
    0% {
        transform: scale(0.3);
        -webkit-transform: scale(0.3);
        opacity: 0.0;
    }

    25% {
        transform: scale(0.3);
        -webkit-transform: scale(0.3);
        opacity: 0.1;
    }

    50% {
        transform: scale(0.3);
        -webkit-transform: scale(0.3);
        opacity: 0.3;
    }

    75% {
        transform: scale(0.5);
        -webkit-transform: scale(0.5);
        opacity: 0.5;
    }

    100% {
        transform: scale(0.8);
        -webkit-transform: scale(0.8);
        opacity: 0.0;
    }
}

.container {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: transparent;
    transition: 0.32s;
    z-index: 199;
    pointer-events: none;

    > div {
        pointer-events: none;
    }

    .dot {
        position: absolute;
        width: 10px;
        height: 10px;
        left: -5px;
        top: -5px;

        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border: 1px solid var(--active-color);
        border-radius: 50%;
        background-color: var(--active-color);
        z-index: 2;
        opacity: 0.8;
    }

    .pulse {
        position: absolute;
        width: 42px;
        height: 42px;
        left: -21px;
        top: -21px;
        border: 1px solid var(--active-color);
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border-radius: 50%;
        z-index: 1;
        opacity: 0;
        -webkit-animation: warn 0.95s ease-out;
        -moz-animation: warn 0.95s ease-out;
        animation: warn 0.95s ease-out;
        -webkit-animation-iteration-count: infinite;
        -moz-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
        box-shadow: 1px 1px 30px var(--active-color);
    }

    .pulse1 {
        position: absolute;
        width: 42px;
        height: 42px;
        left: -21px;
        top: -21px;
        border: 1px solid var(--active-color);
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border-radius: 50%;
        z-index: 1;
        opacity: 0;
        -webkit-animation: warn1 0.95s ease-out;
        -moz-animation: warn1 0.95s ease-out;
        animation: warn1 0.95s ease-out;
        -webkit-animation-iteration-count: infinite;
        -moz-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
        box-shadow: 1px 1px 30px var(--active-color);
    }
}
</style>