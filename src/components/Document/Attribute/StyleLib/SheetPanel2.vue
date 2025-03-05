<script setup lang="ts">
import { ref } from "vue";
import SvgIcon from "@/components/common/SvgIcon.vue";
import down_icon from "@/assets/icons/svg/triangle-down.svg";
import right_icon from "@/assets/icons/svg/triangle-right.svg";
import { Context } from "@/context";
import { FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { SheetCatch } from "../stylectx";

defineProps<{
    context: Context;
    manager: FillsContextMgr;
    data: SheetCatch;
    item: any;
}>();
const extend = ref<boolean>(true);
</script>
<template>
    <el-scrollbar>
        <div class="content">
            <div class="sheet-panel" >
                <div class="header" @click="extend = !extend">
                    <SvgIcon :icon="extend ? down_icon : right_icon" />
                    <span>{{ data.name }}</span>
                </div>
                <div v-if="extend" style="width: 100%;height: fit-content;">
                    <component v-for="c in data.variables" :key="c.id" :is="item" :context="context" :manager="manager"
                        :data="c" />
                </div>
            </div>
        </div>
    </el-scrollbar>
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