<script lang="ts" setup>
import normal from "@/assets/doge-normal.png";
import warning from "@/assets/doge-warning2.png";
import emergency from "@/assets/doge-emergency.png";

import { onMounted, onUnmounted, ref } from "vue";
import { throttle } from "lodash";

const assetsStatus = ref(normal);
const network = ref<number>(1);
const emergencyVisible = ref<boolean>(false);
const emergencyCount = ref<number>(0);

const HEIGHT = 108;
const HEIGHT_CSS = `${HEIGHT}px`;
const TOP_CSS = `-${HEIGHT - 58}px`;
const fixed = ref<boolean>(false);

function record() {
    window.open(`${window.location.origin}/watch`);
}

const boardOpacity = ref<number>(0);

function enter() {
    boardOpacity.value = 1;
}

function leave() {
    if (fixed.value) return;
    boardOpacity.value = 0;
}

function modifyFixedStatus() {
    fixed.value = !fixed.value;
    boardOpacity.value = fixed.value ? 1 : 0;
}

function checkNetworkStatus() {
    if (navigator.onLine) {
        removeEmergency();
        network.value = 1;
    } else {
        getEmergency();
        emergencyCount.value++;
        network.value = 0;
    }
}

const blink = throttle(() => {
    let times = 0;
    let timer: any = null;

    timer = setInterval(() => {
        emergencyVisible.value = !Boolean(times % 2);
        times++;

        if (times === 10) {
            // stop blink;
            emergencyVisible.value = true;
            clearInterval(timer);
            timer = null;
        }
    }, 250);
}, 4000);

function getEmergency() {
    assetsStatus.value = warning;
    blink();
}

function removeEmergency() {
    assetsStatus.value = normal;
    emergencyVisible.value = false;
}

function clearEmergency() {
    removeEmergency();
    emergencyCount.value = 0;
}

onMounted(() => {
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
});
onUnmounted(() => {
    window.removeEventListener('online', checkNetworkStatus);
    window.removeEventListener('offline', checkNetworkStatus);
});
</script>
<template>
<div class="container"
     @mouseenter="enter"
     @mouseleave="leave"
>
    <div style="cursor: pointer;position: relative;">
        <img v-if="emergencyVisible" title="emergency" style="width: 36px; position: absolute; top: 36px; left: 16px;"
             :src="emergency"
             alt="emergency">
        <img title="老实小狗" style="width: 96px;" :src="assetsStatus" alt="老实小狗" @click="modifyFixedStatus">
    </div>

    <div class="board" :style="{opacity: boardOpacity, 'pointer-events': boardOpacity ? 'auto' : 'none'}">
        <div class="logger" @click="record">
            <span>查看日志</span>
            <div v-if="emergencyCount">{{ emergencyCount }}</div>
        </div>
        <div class="logger" @click="clearEmergency">
            <span>清除警告</span>
        </div>
        <div class="logger">
            <span>重置系统</span>
        </div>
        <div class="network">
            <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                 width="200" height="200">
                <path
                    d="M1012.3915 297.221c-276.295-276.295-724.404-276.295-1000.699 0-15.59 15.59-15.59 40.798 0 56.277 15.59 15.589 40.797 15.589 56.276 0 245.227-245.228 642.92-245.228 888.147 0 15.59 15.589 40.797 15.589 56.276 0 15.479-15.48 15.479-40.687 0-56.277z m-850.666 171.15c-15.59 15.59-15.59 40.798 0 56.277 15.59 15.59 40.797 15.59 56.276 0 162.306-162.306 425.554-162.306 587.86 0 15.589 15.59 40.797 15.59 56.276 0 15.59-15.59 15.59-40.798 0-56.276-193.374-193.374-506.928-193.374-700.412 0z m551.042 181.544l0.221-0.221c-110.562-110.562-289.783-110.562-400.235 0-15.59 15.59-15.59 40.797 0 56.276 15.59 15.59 40.797 15.59 56.276 0 79.494-79.494 208.3-79.494 287.683 0l0.221-0.221a40.39 40.39 0 0 0 2.985 3.317c15.59 15.589 40.798 15.589 56.277 0 15.589-15.59 15.589-40.798 0-56.276-1.217-0.996-2.322-1.88-3.428-2.875zM453.3885 874.909c0 32.974 26.73 59.704 59.704 59.704 32.973 0 59.703-26.73 59.703-59.704 0-32.973-26.73-59.704-59.703-59.704-32.974 0-59.704 26.73-59.704 59.704z"
                    :fill="network ? 'green' : 'red'"></path>
            </svg>
            <span :style="{color: network ? 'grey' : 'red', fontSize: '10px', 'font-weight': 600}">{{
                    network ? '在线' : '离线'
                }}</span>
        </div>
    </div>
</div>
</template>
<style scoped lang="scss">
.container {
    position: fixed;
    right: 144px;
    bottom: 0;
    z-index: 12;
    font-size: 12px;
    color: grey;
}

.board {
    position: absolute;
    width: 108px;
    height: v-bind(HEIGHT_CSS);
    padding: 4px 8px;
    box-sizing: border-box;

    border-radius: 8px;
    border: 1px solid #e0e0e0;

    top: v-bind(TOP_CSS);
    left: 60px;
    background-color: #fff;

    transition: 0.2s;
    transform-origin: right bottom;


    .logger {
        width: 100%;
        height: 24px;
        display: flex;
        align-items: center;
        position: relative;
        cursor: pointer;

        > div {
            min-width: 20px;
            height: 14px;
            border-radius: 10px;
            position: absolute;
            left: 52px;
            top: 4px;
            text-align: center;
            color: white;
            line-height: 14px;
            padding: 0 2px;
            background-color: red;
            font-weight: 600;
            font-size: 10px;
        }
    }

    .logger:hover {
        font-weight: 600;
    }

    .network {
        width: 100%;
        height: 32px;

        position: absolute;
        bottom: 0;

        display: flex;
        gap: 8px;
        align-items: center;

        .icon {
            width: 14px;
            height: 14px;

        }
    }
}
</style>