<script setup lang="ts">
import { Context } from '@/context';

interface Props {
    context: Context,
    params: any
}
const props = defineProps<Props>();

</script>
<template>
    <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
        <div class="vertical-line" />
    </div>
</template>

<style scoped lang="scss">
.vertical-line {
    width: 1px;
    height: 20px;
    background-color: grey;
    flex: 0 0 auto;
    margin-left: 5px;
    margin-right: 5px;
}
</style>