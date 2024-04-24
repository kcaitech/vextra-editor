<script lang="ts" setup>
import { IKcDesk } from './ikcdesk'
import WinOps from "./WinOps.vue"
import MacOps from "./MacOps.vue"

const props = defineProps<{ kcdesk: IKcDesk }>();

const platform = props.kcdesk.getPlatform();
const isMac = platform == 'darwin';

</script>

<template>
    <div class="topbar">
        <MacOps v-if="isMac" :kcdesk="kcdesk" />
        <div class="topbarmain"></div>
        <div class="topbarlist"></div>
        <WinOps v-if="!isMac" :kcdesk="kcdesk" />
    </div>
</template>

<style scoped lang="scss">
.topbar {
    height: 40px;
    width: 100%;
    background-color: black;
    display: flex;
    flex-direction: row;
}

.topbarmain {
    width: 60px;
    height: 100%;
    background-color: green;
}

.topbarlist {
    width: 100%;
    height: 100%;
    flex: 1;
}

</style>./ikcdesk