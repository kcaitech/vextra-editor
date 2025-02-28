<script setup lang="ts">
import { Context } from "@/context";
import { Blur } from "@kcdesign/data";
import { onUnmounted, ref, watchEffect } from "vue";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import { BlurCatch, BlurContextMgr } from "./ctx";
import { useI18n } from "vue-i18n";

/**
 * 当图层使用样式库里的样式之后，属性面板不再展示详细的样式信息，取而代之的是该样式库里对应样式的基本信息
 * 本组件是由该基本信息为状态的组件。除了展示基本信息之外，本组件可以打开样式库面板、解绑样式、删除该样式；
 */
const props = defineProps<{
    context: Context;
    manager: BlurContextMgr;
    blur: BlurCatch;
    info: MaskInfo;
    active: boolean;
}>();
const emits = defineEmits<{
    (e: "show-style-lib", event: MouseEvent): void;
}>();

const t = useI18n().t;

const name = ref<string>(props.info.name);

onUnmounted(watchEffect(() => {
    name.value = props.info.name;
}));
</script>
<template>
    <MaskPort @delete="() => manager.removeMask()" @unbind="() => manager.unbind()" :active="active"
        :disabled="info.disabled">
        <div class="blur_desc" @click="event => emits('show-style-lib', event)">
            <div class="effect" />
            <div class="name">{{
                info.disabled ? t('stylelib.deleted_style') : info.name
                }}
            </div>
        </div>
    </MaskPort>
</template>
<style scoped lang="scss">
.blur_desc {
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
    }

    .name {
        flex: 0 0 116px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>