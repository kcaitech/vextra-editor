<script lang="ts" setup>
import { IKcDesk } from '@/basic/ikcdesk'

const props = defineProps<{ kcdesk: IKcDesk }>();

</script>

<template>

    <div class="topbarops">
        <button @click="() => { kcdesk.winToggleMaximize() }">M</button>
        <button @click="() => { kcdesk.winMinimize() }">I</button>
        <button @click="() => { kcdesk.winClose() }">C</button>
    </div>

</template>

<style scoped lang="scss">
.topbarops {
    width: auto;
    height: 100%;
    background-color: green;

    button {
        width: 26px;
        height: 100%;
    }
}
</style>