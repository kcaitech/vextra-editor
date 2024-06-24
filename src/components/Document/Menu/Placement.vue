<script lang="ts" setup>
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { onMounted, onUnmounted, ref } from 'vue';

interface Props {
    params: {
        visible: boolean,
        pos: {
            x: number
            y: number
        }
    }
    context: Context
}

const props = defineProps<Props>();
const show_placement = ref<boolean>(false);

function menu_watcher(t?: number) {
    if (t === Menu.SHOW_PLACEMENT) {
        show_placement.value = true;
    } else if (t === Menu.HIDE_PLACEMENT) {
        show_placement.value = false;
    }
}
onMounted(() => {
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
})
</script>
<template>
<div v-if="props.params.visible" class="container"
     :style="{ left: `${props.params.pos.x}px`, top: `${props.params.pos.y}px`, opacity: show_placement ? 1 : 0 }">
    <div class="dot"></div>
    <div class="pulse"></div>
    <div class="pulse1"></div>
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