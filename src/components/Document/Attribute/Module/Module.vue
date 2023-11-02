<script lang="ts" setup>
import {useI18n} from 'vue-i18n';
import {Context} from '@/context';
import {computed} from 'vue'
import ComponentAttr from './ComponentAttr.vue';
import ComponentState from './ComponentState.vue';
import InstanceAttr from './InstanceAttr.vue';
import LayerShow from './LayerShow.vue';
import TextContent from './TextContent.vue';
import ComponentInstance from './ComponentInstance.vue';
import {Shape, ShapeType, SymbolRefShape, SymbolShape} from '@kcdesign/data';
import {is_shapes_if_symbolref, is_state_selection} from "@/utils/symbol";

interface Props {
    context: Context
    shapeType: string
    shapes: Shape[]
}

const props = defineProps<Props>();
const {t} = useI18n();

const p_symble = computed(() => {
    let isSymble = false;
    if (props.shapes.length === 1) {
        const shape = props.shapes[0]
        let p = shape.parent;
        if (p && p.type === ShapeType.Symbol) {
            isSymble = true;
        }
        while (p && p.type !== ShapeType.Page) {
            if (p.type === ShapeType.Symbol) {
                isSymble = true;
            }
            p = p.parent;
        }
    } else {
        isSymble = false
    }
    return isSymble
})

const is_symbolref = () => {
   return is_shapes_if_symbolref(props.shapes);
}

function is_state() {
    return is_state_selection(props.shapes);
}
</script>

<template>
    <div class="module-panel">
        <ComponentAttr :context="context" v-if="shapeType === ShapeType.Symbol && !is_state()"
                       :shape="(shapes[0] as SymbolShape)">
        </ComponentAttr>
        <ComponentState :context="context" v-if="is_state()" :shapes="props.shapes as SymbolShape[]"></ComponentState>
        <InstanceAttr :context="context" v-if="is_symbolref()"
                      :shapes="(shapes as SymbolRefShape[])">
        </InstanceAttr>
        <LayerShow :context="context" v-if="p_symble && shapeType !== ShapeType.Symbol"></LayerShow>
        <TextContent :context="context" v-if="p_symble && shapeType === ShapeType.Text"></TextContent>
        <ComponentInstance :context="context" :shapes="shapes" v-if="p_symble && shapeType === ShapeType.SymbolRef">
        </ComponentInstance>
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