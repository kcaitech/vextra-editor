<script setup lang="ts">
import { Context } from "@/context";
import { FillCatch, FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { Fill } from "@kcdesign/data";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { onUnmounted, ref, watchEffect } from "vue";
import { MaskInfo } from "@/components/Document/Attribute/Fill2/basic";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";

const props = defineProps<{
    context: Context;
    manager: FillContextMgr;
    fills: FillCatch[];
    info: MaskInfo;
}>();
const emits = defineEmits<{
    (e: "show-style-lib", event: MouseEvent): void;
}>();

const colors = ref<Fill[]>(props.fills.map(i => i.fill).reverse());
const name = ref<string>(props.info.name);

onUnmounted(watchEffect(() => {
    colors.value = props.fills.map(i => i.fill).reverse();
    name.value = props.info.name;
}));
</script>
<template>
    <MaskPort @delete="() => manager.removeMask()" @unbind="() => manager.unbind()">
        <div class="desc" @click="event => emits('show-style-lib', event)">
            <ColorBlock :colors="colors as Fill[]" round disabled-alpha/>
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