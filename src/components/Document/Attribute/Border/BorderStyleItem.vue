<script lang="ts" setup>
import { SelectItem } from '@/components/common/Select.vue'
import { onMounted, ref } from 'vue';
interface Props {
    data: SelectItem;
    isCurValue: boolean;
}
interface Emits {
    (e: "select", data: SelectItem): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const isHoverCurValue = ref(false);

function select() {
    emits('select', props.data)
}

</script>

<template>
    <div class="border-style-item-container" @click="select" @mouseenter="isHoverCurValue = true"
        @mouseleave="isHoverCurValue = false">
        <div class="content">
            <svg-icon :icon-class="props.data.value"></svg-icon>
            <span>{{ props.data.content }}</span>
        </div>
        <svg-icon class="check" v-show="props.isCurValue"
            :icon-class="isHoverCurValue ? 'white-select' : 'page-select'"></svg-icon>
    </div>
</template>

<style scoped lang="scss">
.border-style-item-container {
    height: 32px;
    width: 100%;
    padding: 4px 6px 4px 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .content {
        width: 60px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        >svg {
            width: 24px;
            height: 100%;
            color: #BFBFBF;
        }

        >span {
            font-family: HarmonyOS Sans;
            font-size: var(--font-default-fontsize);
            font-weight: 500;
        }
    }

    .check {
        width: 12px;
        height: 12px;
    }
}

.border-style-item-container:hover {
    background-color: var(--active-color);
    color: #fff;

    .content {
        >span {
            color: #fff;
        }

        >svg {
            color: #fff;
        }
    }
}
</style>