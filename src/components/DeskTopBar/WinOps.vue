<script lang="ts" setup>
import { IKcDesk } from './ikcdesk'

const props = defineProps<{ kcdesk: IKcDesk }>();

</script>

<template>

    <div class="topbarops">
        <button @click="() => { kcdesk.toggleMaximize() }">M</button>
        <button @click="() => { kcdesk.minimize() }">I</button>
        <button @click="() => { kcdesk.close() }">C</button>
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
</style>./ikcdesk