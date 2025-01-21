<script setup lang="ts">
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import Saturation from "@/components/common/ColorPicker/Saturation.vue";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;
const emits = defineEmits(["close"]);

</script>

<template>
    <div id="color-piker-gen-2-panel" :style="{width: WIDTH_CSS}">
        <PopoverHeader title="新颜色面板" :create="false" @close="emits('close')"/>
        <Saturation/>
<!--        <div style="width: 100%; height: 64px;">-->
<!--            我爱说点实话，铁铁-->
<!--        </div>-->
    </div>
</template>

<style scoped lang="scss">
#color-piker-gen-2-panel {
    position: fixed;
    height: fit-content;
    background-color: var(--theme-color-anti);
    box-shadow: 0 4px 16px #0000002e;
    border-radius: 8px;
}
</style>