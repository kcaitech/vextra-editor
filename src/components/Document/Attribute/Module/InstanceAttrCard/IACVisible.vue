<script setup lang="ts">
import {get_vari_value_for_ref, modify_vari_value_for_ref, RefAttriListItem} from "@/utils/symbol";
import {useI18n} from "vue-i18n";

import {Context} from "@/context";
import {onMounted, ref} from "vue";

const {t} = useI18n();

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
    modify_vari_value_for_ref(props.context, props.data.variable, v);
}

onMounted(get_value);
</script>
<template>
    <div class="item-wrap">
        <div class="name">{{ props.data.variable.name }}</div>
        <el-switch v-model="open" size="small" style="margin-left: 10px;--el-switch-on-color: #9775fa"
                   @change="change"/>
    </div>
</template>
<style lang="scss" scoped>
.item-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .name {
        flex: 0 0 84px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>