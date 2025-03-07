/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import {
    get_vari_value_for_ref2,
    RefAttriListItem,
    switch_symref_state
} from "@/utils/symbol";
import { ref, watch } from "vue";
import { Context } from "@/context";
import { onMounted, onUpdated } from "vue";
import { useI18n } from "vue-i18n";
import { OverrideType, SymbolShape } from "@kcdesign/data";
import Select, { SelectItem, SelectSource } from "@/components/common/Select.vue";
import { genOptions } from "@/utils/common";

const { t } = useI18n();

interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const status_value = ref<SelectItem>({ value: 0, content: t('attr.center') });
const optionsSource: SelectSource[] = genOptions(props.data.values.map((v, idx) => {
    return [idx, v];
}));

function select(val: SelectItem) {
    const _v = props.data.values[val.value as number];
    const symref = props.context.selection.symbolrefshape;
    if (!symref) {
        return console.log("wrong role");
    }
    const overrides = symref.findOverride(props.data.variable.id, OverrideType.Variable);    
    const _var = overrides ? overrides[overrides.length - 1] : props.data.variable;
    
    switch_symref_state(props.context, _var, _v, t);
}

function getVattagValue() {
    const symbol_ref = props.context.selection.symbolrefshape;
    if (!symbol_ref) {
        return;
    }
    let val = get_vari_value_for_ref2(symbol_ref, props.data.variable);
    if (val === SymbolShape.Default_State) {
        val = t('compos.dlt');
    }
    const _v = props.data.values.findIndex(i => i === val);
    if (_v < 0) {
        return;
    }
    status_value.value = optionsSource[_v].data;
}

watch(() => props.data, getVattagValue);
onUpdated(getVattagValue);
onMounted(getVattagValue);
</script>
<template>
    <div class="module_state_item">
        <div class="state_item">
            <div class="state_name"><span>{{ data.variable.name }}</span></div>
            <Select class="select" :source="optionsSource" :selected="status_value" @select="select"></Select>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.module_state_item {
    position: relative;
    display: flex;
    align-items: center;
    height: 32px;
    margin-bottom: 8px;

    .state_item {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;

        .state_name {
            flex: 1;
            max-width: 86px;
            box-sizing: border-box;

            span {
                display: block;
                width: 100%;
                color: #595959;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .select {
            width: 126px;
            height: 32px;
        }
    }
}
</style>