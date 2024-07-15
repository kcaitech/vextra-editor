<script lang="ts" setup>
import { SelectItem } from '@/components/common/Select.vue';
import { computed } from 'vue'
const props = defineProps<{
    data: SelectItem | null
}>();
const isEnd = computed(() => {
    return props.data?.content.startsWith('end');
})
</script>

<template>
    <div class="item-container">
        <svg-icon :class="{ isEnd }" :icon-class="props.data?.value || ''"></svg-icon>
    </div>
</template>

<style scoped lang="scss">
.item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;

    >svg {
        width: 40px;
        height: auto;
    }

    >.isEnd {
        transform: rotate(180deg);
    }
}
</style>