<script lang="ts" setup>
import { defineProps, defineEmits, onMounted } from 'vue'
import { SelectItem } from '@/components/common/Select.vue'
const props = defineProps<{ data: SelectItem }>();
const emit = defineEmits<{
    (e: "select", data: SelectItem): void;
}>();

function select() {
    emit('select', props.data)
}

// hooks
onMounted(() => {})
</script>
<template>
    <div class="border-position-item-container" @click="select">
        {{ props.data.content }}
    </div>
</template>
<style scoped lang="scss">
.border-position-item-container {
    height: 32px;
    width: 100%;
    color: var(--theme-color-anti);
    text-align: left;
    line-height: 32px;
    padding: 0 var(--default-padding);
    margin-left: var(--default-margin-half);
    box-sizing: border-box;
}
</style>