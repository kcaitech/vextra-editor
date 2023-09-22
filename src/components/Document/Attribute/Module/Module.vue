<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref, nextTick } from 'vue'
import ComponentAttr from './ComponentAttr.vue';
import ComponentState from './ComponentState.vue';
import InstanceAttr from './InstanceAttr.vue';
import LayerShow from './LayerShow.vue';
import TextContent from './TextContent.vue';
import { ShapeType } from '@kcdesign/data';
const props = defineProps<{
    context: Context
    shapeType: string
}>()
const { t } = useI18n();

</script>

<template>
    <div class="module-panel">
        <ComponentAttr :context="context" v-if="shapeType === ShapeType.Symbol"></ComponentAttr>
        <ComponentState :context="context" v-if="shapeType === ShapeType.SymbolRef"></ComponentState>
        <InstanceAttr :context="context" v-if="shapeType === ShapeType.SymbolRef"></InstanceAttr>
        <LayerShow :context="context" v-if="shapeType === ShapeType.SymbolRef"></LayerShow>
        <TextContent :context="context" v-if="shapeType === ShapeType.SymbolRef"></TextContent>
    </div>
</template>

<style scoped lang="scss">
.module-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    box-sizing: border-box;
}
</style>