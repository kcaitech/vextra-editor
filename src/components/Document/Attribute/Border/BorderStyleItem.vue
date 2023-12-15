<script lang="ts" setup>
import { onMounted } from 'vue'
import { SelectItem } from '@/components/common/Select.vue'
const props = defineProps<{ data: SelectItem }>();
const emit = defineEmits<{
    (e: "select", data: SelectItem): void;
}>();

function select() {
    emit('select', props.data)
}

// hooks
onMounted(() => { })
</script>
<template>
    <div class="border-style-item-container" @click="select">
        <svg-icon :icon-class="props.data.value"></svg-icon>
        <span>{{ props.data.content }}</span>
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

    >span {
        font-family: HarmonyOS Sans;
        font-size: 12px;
        font-weight: 500;
        flex: 0 0 40px;
        color: #000000;
    }

    >svg {
        width: calc(100% - 85px);
        height: 100%;
        margin-right: 12px;
        color: #BFBFBF;
    }
}

.border-style-item-container:hover {
    background-color: var(--active-color);
    color: #fff;

    >span {
        color: #fff;
    }

    >svg {
        color: #fff;
    }
}
</style>