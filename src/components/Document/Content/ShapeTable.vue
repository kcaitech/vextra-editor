<script setup lang="ts">
import { h } from 'vue';
import { TableShape, SymbolRefShape , SymbolShape, findOverride, OverrideType, layoutTable } from "@kcdesign/data";
import { renderTable as r } from "@kcdesign/data";
import { initCommonShape } from './common';
import comsMap from './comsmap';

const props = defineProps<{
    data: TableShape, 
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const common = initCommonShape(props);

function bubbleupdate() {
    common.incReflush();
}

const cellGetter = (rowIdx: number, colIdx: number) => {
    const _table = props.data;
    const cellId = _table.rowHeights[rowIdx].id + "," + _table.colWidths[colIdx].id;
    const _vars = findOverride(cellId, OverrideType.TableCell, props.varsContainer || []);
    if (_vars && _vars.length > 0) {
        return _vars[_vars.length - 1].value;
    }
    return _table.cells.get(cellId);
}
const layout = layoutTable(props.data, props.data.frame, cellGetter);

function render() {
    const ret = r(h, props.data, comsMap, props.varsContainer, layout, cellGetter, bubbleupdate, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>
