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
onMounted(() => {})
</script>
<template>
    <div class="border-style-item-container" @click="select">
       <svg-icon :icon-class="props.data.value"></svg-icon>
        <span>{{ props.data.content }}</span>
    </div>
</template>
<style scoped lang="scss">
.border-style-item-container {
    height:  var(--default-input-height);
    width: 100%;
    color: var(--theme-color);
    padding: 0 var(--default-padding);
    margin-left: var(--default-margin-half);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    > span {
        text-align: left;
        line-height: var(--default-input-height);
        flex: 0 0 40px;
    }
    > svg {
        width: calc(100% - 48px);
        height: 100%;
    }
}
</style>