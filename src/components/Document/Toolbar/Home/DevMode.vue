<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref, onMounted, onUnmounted } from 'vue';
import { Tool } from '@/context/tool';

interface Props {
    context: Context,
    params: any,
}

const props = defineProps<Props>();
const { t } = useI18n();

const isLable = ref(props.context.tool.isLable);
const tool_watcher = (t: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}

onMounted(() => {
    props.context.tool.watch(tool_watcher);
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
})
</script>

<template>

    <div class="model" v-if="isLable" >
        <span style="color: #BFBFBF; font-size: 12px">【开发模式】</span>
    </div>


</template>

<style scoped lang="scss">
.model {
    flex: 0 0 72px;
    display: flex;
    align-items: center;
}
</style>