<script setup lang="ts">
import { ref } from "vue";
import SvgIcon from "@/components/common/SvgIcon.vue";
import down_icon from "@/assets/icons/svg/triangle-down.svg";
import right_icon from "@/assets/icons/svg/triangle-right.svg";
import { SheetCatch } from "@/components/Document/Attribute/Fill2/Lib/ctx";
import { Context } from "@/context";

defineProps<{
    context: Context;
    data: SheetCatch;
    item: any;
}>();
const extend = ref<boolean>(true);
</script>
<template>
    <div class="sheet-panel">
        <div class="header" @click="extend=!extend">
            <SvgIcon :icon="extend ? down_icon: right_icon"/>
            <span>{{ data.name }}</span>
        </div>
        <div v-if="extend" style="width: 100%;height: fit-content;">
            <component v-for="c in data.variables" :is="item" :context="context" :data="c" :key="c.id"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.sheet-panel {
    width: 100%;
    height: fit-content;

    .header {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 6px;
        border-radius: 6px;
        box-sizing: border-box;
        font-weight: var(--font-weight-medium);

        &:hover {
            background-color: #f5f5f5;
        }

        img {
            width: 14px;
            height: 14px;
        }
    }
}
</style>