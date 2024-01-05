<script lang="ts" setup>
import { computed, ref } from 'vue'
import { SelectItem } from '@/components/common/Select.vue'
interface Props {
    data: SelectItem;
    isCurValue: boolean;
}
interface Emits {
    (e: "select", data: SelectItem): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const hoverApex = ref<boolean>(false);
function select() {
    emits('select', props.data);
}
const isEnd = computed<boolean>(() => {
    return props.data.content.startsWith('end');
})
</script>
<template>
    <div class="border-front-style-item-container" @click="select" @mouseenter="hoverApex = true"
        @mouseleave="hoverApex = false">
        <svg-icon :class="{ isEnd }" :icon-class="hoverApex ? 'white-' + props.data.value : props.data.value"></svg-icon>
        <svg-icon class="check" v-show="props.isCurValue" :icon-class="hoverApex ? 'white-select' : 'page-select'"></svg-icon>
    </div>
</template>
<style scoped lang="scss">
.border-front-style-item-container {
    height: 32px;
    width: 68px;

    padding: 0 6px;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-between;

    >svg {
        width: 36px;
        height: 32px;
    }

    .check {
        width: 12px;
        height: 12px;
    }

    >.isEnd {
        transform: rotate(180deg);
    }
}

.border-front-style-item-container:hover {
    background-color: var(--active-color);
    color: #FFFFFF;
}
</style>