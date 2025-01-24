<script setup lang="ts">
import { Context } from "@/context";
import { FillCatch, FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { Fill, Shadow } from "@kcdesign/data";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { onUnmounted, ref, watchEffect } from "vue";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import { ShadowCatch, ShadowsContextMgr } from "./ctx";

/**
 * 当图层使用样式库里的样式之后，属性面板不再展示详细的样式信息，取而代之的是该样式库里对应样式的基本信息
 * 本组件是由该基本信息为状态的组件。除了展示基本信息之外，本组件可以打开样式库面板、解绑样式、删除该样式；
 */
const props = defineProps<{
    context: Context;
    manager: ShadowsContextMgr;
    shadows: ShadowCatch[];
    info: MaskInfo;
}>();
const emits = defineEmits<{
    (e: "show-style-lib", event: MouseEvent): void;
}>();

const colors = ref<Shadow[]>(props.shadows.map(i => i.shadow).reverse());
const name = ref<string>(props.info.name);

onUnmounted(watchEffect(() => {
    colors.value = props.shadows.map(i => i.shadow).reverse();
    name.value = props.info.name;
}));
</script>
<template>
    <MaskPort @delete="() => manager.removeMask()" @unbind="() => manager.unbind()">
        <div class="desc" @click="event => emits('show-style-lib', event)">
            <div class="effect" :style="{
                boxShadow: `
                        ${colors[0].position.includes('in') ? 'inset' : ''} 
                        ${colors[0].offsetX > 0 ? '1px' : colors[0].offsetX < 0 ? '-1px' : '0'} 
                        ${colors[0].offsetY > 0 ? '1px' : colors[0].offsetY < 0 ? '-1px' : '0'} 
                        ${colors[0].blurRadius > 0 ? '1px' : '0'}
                        ${colors[0].spread > 0 ? '1px' : '0'}
                        #0000004d
                        `}">
            </div>
            <span>{{ name }}</span>
        </div>
    </MaskPort>
</template>
<style scoped lang="scss">
.desc {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;

    .effect {
        width: 16px;
        height: 16px;
        background-color: #fff;
        border: 1px solid #000000e5;
        border-radius: 3px;
        overflow: hidden;
        margin: 0 8px;
    }

    .span {
        display: inline-block;
        flex: 1;
        width: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>