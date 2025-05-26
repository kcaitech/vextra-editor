/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { computed } from 'vue'
import ComponentAttr from './ComponentAttr.vue';
import ComponentState from './ComponentState.vue';
import LayerShow from './LayerShow.vue';
import TextContent from './TextContent.vue';
import ComponentInstance from './ComponentInstance.vue';
import { ShapeView, ShapeType, SymbolView, SymbolRefView } from '@kcdesign/data';
import { is_state_selection } from "@/utils/symbol";

interface Props {
    context: Context
    shapeType: string
    shapes: ShapeView[]
}

const props = defineProps<Props>();

const p_symble = computed(() => {
    let isSymble = false;
    if (props.shapes.length === 1) {
        const shape = props.shapes[0]
        let p = shape.parent;
        if (p && (p.type === ShapeType.Symbol || p.type === ShapeType.SymbolUnion)) {
            isSymble = true;
        }
        while (p && p.type !== ShapeType.Page) {
            if ((p.type === ShapeType.Symbol || p.type === ShapeType.SymbolUnion)) {
                isSymble = true;
            }
            p = p.parent;
        }
    } else {
        isSymble = false
    }
    return isSymble
})

const is_module_attr = () => {
    return p_symble.value || props.shapeType === ShapeType.Symbol || props.shapeType === ShapeType.SymbolUnion;
}

function is_state() {
    return is_state_selection(props.shapes);
}

function layer() {
    const selected = props.context.selection.selectedShapes;

    if (selected.length === 1) {
        const f = selected[0];
        return f.type !== ShapeType.Symbol && f.type !== ShapeType.SymbolUnion && !f.isVirtualShape;
    } else {
        return false;
    }
}

function text() {
    const selected = props.context.selection.selectedShapes;

    if (selected.length === 1) {
        const f = selected[0];
        return f.type === ShapeType.Text && !f.isVirtualShape;
    } else {
        return false;
    }
}

function symbolref() {
    const selected = props.context.selection.selectedShapes;

    if (selected.length === 1) {
        const f = selected[0];
        return f.type === ShapeType.SymbolRef && !f.isVirtualShape;
    } else {
        return false;
    }
}

</script>

<template>
    <div class="module-panel" v-if="is_module_attr()">
        <ComponentAttr :context="context"
            v-if="(shapeType === ShapeType.Symbol || shapeType === ShapeType.SymbolUnion) && !is_state()"
            :shape="(shapes[0] as SymbolView)">
        </ComponentAttr>
        <ComponentState v-if="is_state()" :context="context" :shapes="props.shapes as SymbolView[]"></ComponentState>
        <LayerShow v-if="layer()" :context="context"></LayerShow>
        <TextContent v-if="text()" :context="context"></TextContent>
        <ComponentInstance v-if="symbolref()" :context="context" :shapes="shapes as SymbolRefView[]">
        </ComponentInstance>
    </div>
</template>

<style scoped lang="scss">
.module-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;
}
</style>