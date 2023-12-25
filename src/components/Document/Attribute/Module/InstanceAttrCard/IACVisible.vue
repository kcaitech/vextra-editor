<script setup lang="ts">
import { get_vari_value_for_ref, modify_vari_value_for_ref, RefAttriListItem } from "@/utils/symbol";
import { useI18n } from "vue-i18n";

import { Context } from "@/context";
import { onMounted, onUpdated, ref, watch } from "vue";
import { OverrideType } from "@kcdesign/data";

const { t } = useI18n();

interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const open = ref(false);

function get_value() {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    open.value = get_vari_value_for_ref(symref, props.data.variable);
}

function change(v: boolean) {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return console.log("wrong role");
    const overrides = symref.findOverride(props.data.variable.id, OverrideType.Variable);
    const _var = overrides ? overrides[overrides.length - 1] : props.data.variable;
    modify_vari_value_for_ref(props.context, _var, v);
}

watch(() => props.data, (v) => {
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
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;

    .name {
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