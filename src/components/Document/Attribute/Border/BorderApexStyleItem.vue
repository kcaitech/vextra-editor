<script lang="ts" setup>
import { computed } from 'vue'
import { SelectItem } from '@/components/common/Select.vue'
const props = defineProps<{ data: SelectItem }>();
const emit = defineEmits<{
    (e: "select", data: SelectItem): void;
}>();

function select() {
    emit('select', props.data);
}
const isEnd = computed<boolean>(() => {
    return props.data.content.startsWith('end');
})
</script>
<template>
    <div class="border-front-style-item-container" @click="select">
        <svg-icon :class="{ isEnd }" :icon-class="props.data.value"></svg-icon>
    </div>
</template>
<style scoped lang="scss">
.border-front-style-item-container {
    height: 30px;
    width: 68px;
    padding: 0 8px 0 6px;
    color: #333333;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

    >svg {
        width: 36px;
        height: 30px;
        margin-right: 6px;
    }

    >.isEnd {
        transform: rotate(180deg);
    }
}
.border-front-style-item-container:hover {
    background-color: #1878F5;
    color: #FFFFFF;
}
</style>