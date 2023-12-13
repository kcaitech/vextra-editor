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
    <div class="border-position-item-container" @click="select">
        {{ props.data.content }}
    </div>
</template>
<style scoped lang="scss">
.border-position-item-container {
    height: 32px;
    width: 100%;
    color: #262626;;
    //text-align: left;
    //line-height: var(--default-input-height);
    padding: 9px 6px 9px 12px;
    box-sizing: border-box;
    font-weight: 500;
}
.border-position-item-container:hover {
    background-color: #1878F5;
    color: #FFFFFF;
}
</style>