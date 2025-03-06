/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { onMounted, onUnmounted, ref, watch } from "vue";
import StatusCard from "@/components/Document/Attribute/Module/StatusCard.vue";
import { is_conflict_comp, is_wrong_bind, states_tag_values_sort, StatusValueItem } from "@/utils/symbol";
import { Shape, ShapeView, SymbolShape, SymbolView } from "@kcdesign/data"
import TypeHeader from '../TypeHeader.vue';
import { Warning } from '@element-plus/icons-vue';

interface Props {
    context: Context
    shapes: SymbolView[]
}

const props = defineProps<Props>()
const { t } = useI18n();
const data = ref<StatusValueItem[]>();
const conflict = ref<boolean>(false);

function update_list() {
    data.value = states_tag_values_sort(props.shapes, t);
    data.value.forEach(item => {
        item.values.push('add_new_value');
    })
    is_conflict();
}

const is_conflict = () => {
    if (is_wrong_bind(props.shapes)) {
        const conflict_comp = is_conflict_comp(props.shapes[0].parent as SymbolView);
        if (!conflict_comp) return;
        let is_conflict = false;
        conflict_comp.forEach((item: any[]) => {
            const shape_id = props.shapes[0].id;
            const i = item.findIndex(v => v.id === shape_id);
            if(i !== -1) {
                is_conflict = true;
            }
        })
        conflict.value = is_conflict;
    } else {
        conflict.value = false;
    }
}

watch(() => props.shapes, (v, o) => {
    unwatch_shapes(o);
    watch_shapes(v);
    update_list();
})

function watch_shapes(shapes: ShapeView[]) {
    for (let i = 0, len = shapes.length; i < len; i++) {
        shapes[i].watch(update_list);
    }
}

function unwatch_shapes(shapes: ShapeView[]) {
    for (let i = 0, len = shapes.length; i < len; i++) {
        shapes[i].unwatch(update_list);
    }
}

onMounted(() => {

    watch_shapes(props.shapes)
    update_list();
})
onUnmounted(() => {
    unwatch_shapes(props.shapes);
})
</script>

<template>
    <div class="module_container">
        <TypeHeader :title="t('compos.compos_state')" class="mt-24" :active="true">
            <template #tool>
                <div class="compos_state"></div>
            </template>
        </TypeHeader>
        <StatusCard v-for="item in data" :context="props.context" :data="item" :key="item.variable.id"></StatusCard>
        <div v-if="conflict" class="conflict_warn">
            <div><el-icon>
                    <Warning />
                </el-icon></div>
            <p>{{ t('compos.conflict_2')}}</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.module_container {
    font-size: var(--font-default-fontsize);
}

.compos_state {
    width: 22px;
    height: 22px;
}

.conflict_warn {
    display: flex;
    width: 100%;
    margin-top: 6px;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;
    border: 1px solid #F5F5F5;
    border-radius: var(--default-radius);
    padding: 8px;
    margin-bottom: 6px;

    >div {
        display: flex;
        align-items: center;
        width: 20px;
        height: 20px;
        margin-right: 8px;
        color: #8C8C8C;
    }

    >p {
        margin: 0;
        color: #262626;
    }
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}
</style>