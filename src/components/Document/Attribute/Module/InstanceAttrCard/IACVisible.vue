/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { RefAttriListItem } from "@/utils/symbol";

import { Context } from "@/context";
import { onMounted, onUpdated, ref, watch } from "vue";
import { OverrideType, ShapeView, GroupShapeView, VariableType } from "@kcdesign/data";

interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const open = ref(false);

function get_value() {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    const id = props.data.variable.id;
    open.value = !!symref.naviChilds && deep(symref.naviChilds);

    function deep(children: ShapeView[]) {
        for (const c of children) {
            if (c.varbinds?.get(VariableType.Visible) === id && c.isVisible) return true;
            if (c instanceof GroupShapeView && deep(c.childs)) return true;
        }
        return false;
    }
}

function change(v: boolean) {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return console.log("wrong role");
    const overrides = symref.findOverride(props.data.variable.id, OverrideType.Variable);
    const _var = overrides ? overrides[overrides.length - 1] : props.data.variable;
    const editor = props.context.editor4Shape(symref);
    editor.modifySymbolRefVisibleVariable(_var, v);
}

watch(() => props.data, () => {
    get_value();
})

onUpdated(get_value);
onMounted(get_value);
</script>
<template>
    <div class="item-wrap">
        <div class="name">{{ props.data.variable.name }}</div>
        <el-switch v-model="open" size="small" style="--el-switch-on-color: #1878F5" @change="change" />
    </div>
</template>
<style lang="scss" scoped>
.item-wrap {
    display: flex;
    height: 28px;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;

    .name {
        max-width: 82px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

:deep(.el-switch--small) {
    font-size: 12px;
    line-height: 20px;
    height: 20px;
}

:deep(.el-switch__core) {
    min-width: 36px;
    height: 20px;
    border-radius: 100px;
}

:deep(.el-switch__action) {
    width: 16px !important;
    height: 16px !important;
}

:deep(.is-checked .el-switch__core .el-switch__action) {
    left: calc(100% - 17px) !important;
}
</style>