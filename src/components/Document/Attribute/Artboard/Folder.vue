<script lang="ts" setup>
import { TL } from "@/components/Document/Attribute/Artboard/template";
import SvgIcon from "@/components/common/SvgIcon.vue";

interface Props {
    title: string;
    extend: boolean;
    list: TL[];
}

interface Emits {
    (e: 'toggle'): void;

    (e: 'action', temp: TL): void;
}

defineProps<Props>();
const emits = defineEmits<Emits>();

</script>
<template>
    <div class="container">
        <div class="title" @click="() => {emits('toggle')}">
            <svg-icon icon-class="right" :class="extend ? 'extend' :'fold'"></svg-icon>
            <div class="name">{{ title }}</div>
        </div>
        <div v-if="extend" class="list-container">
            <div v-for="(tl, index) in list" :key="index" class="tl" @click="() => {emits('action', tl)}">
                <div class="name">{{ tl.name }}</div>
                <div class="size">{{ `${tl.width} x ${tl.height}` }}</div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.container {
    width: 100%;
    border-bottom: 1px solid #EBEBEB;
    box-sizing: border-box;

    .title {
        width: inherit;
        height: 40px;
        padding: 12px 14px;
        box-sizing: border-box;

        display: flex;
        align-items: center;

        .extend {
            width: 12px;
            height: 12px;
            transform: rotate(90deg);
        }

        .fold {
            width: 12px;
            height: 12px;
        }

        .name {
            margin-left: 2px;
            line-height: 16px;
        }
    }

    .list-container {
        width: inherit;
        padding: 4px 8px;
        box-sizing: border-box;

        .tl {
            box-sizing: border-box;
            padding: 0 6px;
            height: 32px;
            width: inherit;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: var(--default-radius);
        }

        .tl:hover {
            background-color: rgb(239, 239, 239);
        }
    }
}
</style>