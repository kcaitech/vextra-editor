<script lang="ts" setup>
import { XY } from "@/context/selection";
import { ref } from "vue";

interface Props {
    site: XY;
}

defineProps<Props>();

const pulse = ref<HTMLDivElement>();

function locate() {
    if (!pulse) return;

}

</script>
<template>
<div ref="pulse" class="container">
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