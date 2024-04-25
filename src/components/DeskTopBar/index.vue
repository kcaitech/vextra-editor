<script lang="ts" setup>
import { IKcDesk } from './ikcdesk'
import WinOps from "./WinOps.vue"
import MacOps from "./MacOps.vue"

const props = defineProps<{ kcdesk: IKcDesk }>();

const platform = props.kcdesk.getPlatform();
const isMac = platform == 'darwin';

let draging = false;
let mousex = 0;
let mousey = 0;
function onMouseDown(e: MouseEvent) {
    mousex = e.screenX;
    mousey = e.screenY;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}
function onMouseMove(e: MouseEvent) {
    const dx = e.screenX - mousex;
    const dy = e.screenY - mousey;
    if (draging && (Math.abs(dx) > 1 || Math.abs(dy) > 1) ||
        !draging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        draging = true;
        e.preventDefault();
        props.kcdesk.move(dx, dy);
        mousex = e.screenX;
        mousey = e.screenY;
    }
}
function onMouseUp(e: MouseEvent) {
    if (draging) {
        e.preventDefault();
        draging = false;
    }
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
}

function onDblClick() {
    props.kcdesk.toggleMaximize();
}

</script>

<template>
    <div class="topbar" @mousedown="onMouseDown" @dblclick="onDblClick">
        <MacOps v-if="isMac" :kcdesk="kcdesk" />
        <div class="topbarmain"></div>
        <div class="topbarlist"></div>
        <WinOps v-if="!isMac" :kcdesk="kcdesk" />
    </div>
</template>

<style scoped lang="scss">
.topbar {
    height: 38px;
    width: 100%;
    background-color: black;
    display: flex;
    flex-direction: row;
}

.topbarmain {
    width: 42px;
    height: 100%;
    background-color: green;
}

.topbarlist {
    width: 100%;
    height: 100%;
    flex: 1;
}
</style>./ikcdesk