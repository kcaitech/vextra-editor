<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import { Context } from '@/context';
import { useRoute } from 'vue-router';
import { open_preview } from '@/utils/preview';
import { ShapeType } from '@kcdesign/data';
const { t } = useI18n()
const props = defineProps<{
    context: Context
}>();
const route = useRoute();
const preview = () => {
    const selected = props.context.selection.selectedShapes;
    const artboard = selected.find(item => item.type === ShapeType.Artboard || item.type === ShapeType.Symbol || item.type === ShapeType.SymbolRef);
    open_preview(route.query.id as string, props.context, t, artboard?.id);
}
</script>

<template>
    <Tooltip :content="t('preview.preview')">
        <div class="preview" @click="preview">
            <svg-icon icon-class="preview"></svg-icon>
        </div>
    </Tooltip>
</template>

<style scoped lang="scss">
.preview {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    cursor: pointer;
    border-radius: 4px;
    box-sizing: border-box;

    >svg {
        width: 18px;
        height: 18px;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

}
</style>