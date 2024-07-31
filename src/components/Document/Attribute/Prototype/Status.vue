<template>
    <div class="component-status">
        <div class="state" v-for="i in variables" :key="i.variable.id">
            <span>{{ i.variable.name }}：</span>
            <Select class="select" id="select" :visibility="true"
                :source="genOptions(i.values.map((v, idx) => { return [idx, v]; }))"
                :selected="genOptions(i.values.map((v, idx) => { return [idx, v]; })).find(t => t.data.content === i.current_state)?.data"
                @select="changetarget($event, i.variable.id)"></Select>
        </div>
    </div>

</template>

<script setup lang="ts">
import { Context } from '@/context';
import { onMounted, ref, watch } from 'vue';
import {
    get_var_for_ref,
    states_tag_values_sort,
    RefAttriListItem,
    StatusValueItem
} from "@/utils/symbol";
import { ShapeView, SymbolRefView, SymbolView } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { genOptions } from '@/utils/common';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';

export interface Data {
    data: SelectItem
    id: string
}

const props = defineProps<{
    context: Context,
    targetNodeId: string | undefined
}>()

const emits = defineEmits<{
    (e: "changestatus", data: Data): void
}>()

const { t } = useI18n()
const variables = ref<RefAttriListItem[] | StatusValueItem[]>([])

const changetarget = (data: SelectItem, id: string) => {
    emits('changestatus', { data, id })
}

function search(shape: ShapeView, id: string) {
    if (shape.id === id) {
        const result = states_tag_values_sort([shape as SymbolView], t);
        if (result) variables.value = result
    } else {
        const len = shape.childs.length
        if (len) shape.childs.forEach(s => search(s, id))
    }
}

const getState = (id: string | undefined) => {
    const shapes = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!id) {
        if (shapes.length === 1) {
            const shape = shapes[0];
            if (shape instanceof SymbolRefView) {
                const result = get_var_for_ref(shape, t);
                if (result) variables.value = result.variables
            }
            if (shape instanceof SymbolView) {
                const result = states_tag_values_sort([shape], t);
                if (result) variables.value = result
            }
        }
    } else {
        if (page) search(page, id);
    }
}




watch(() => props.targetNodeId, (n, o) => {
    if (n !== o) getState(n)
})

onMounted(() => {
    console.log(props.targetNodeId);
    
    getState(props.targetNodeId)
})

</script>

<style lang="scss" scoped>
.component-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;

    .state {
        display: flex;
        align-items: center;
        width: 140px;

        span {
            white-space: nowrap;
        }
    }
}
</style>
