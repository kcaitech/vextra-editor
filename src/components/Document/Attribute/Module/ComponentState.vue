<script lang="ts" setup>
import {useI18n} from 'vue-i18n';
import {Context} from '@/context';
import {onMounted, onUnmounted, ref, watch} from "vue";
import StatusCard from "@/components/Document/Attribute/Module/StatusCard.vue";
import {is_wrong_bind, states_tag_values_sort, StatusValueItem} from "@/utils/symbol";
import {Shape, SymbolShape} from "@kcdesign/data"
import TypeHeader from '../TypeHeader.vue';

interface Props {
    context: Context
    shapes: SymbolShape[]
}

const props = defineProps<Props>()
const {t} = useI18n();
const data = ref<StatusValueItem[]>();
const conflict = ref<boolean>(false);

function update_list() {
    data.value = states_tag_values_sort(props.shapes);
    data.value.forEach(item => {
        item.values.push('add');
    })
    conflict.value = is_wrong_bind(props.shapes);
    console.log('state attribute update result: ', data.value);
}

watch(() => props.shapes, (v, o) => {
    unwatch_shapes(o);
    watch_shapes(v);
    update_list();
})

function watch_shapes(shapes: Shape[]) {
    for (let i = 0, len = shapes.length; i < len; i++) {
        shapes[i].watch(update_list);
    }
}

function unwatch_shapes(shapes: Shape[]) {
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
        <TypeHeader :title="t('compos.compos_state')" class="mt-24">
            <template #tool>
                <div class="compos_state"></div>
            </template>
        </TypeHeader>
        <StatusCard v-for="item in data" :context="props.context" :data="item" :key="item.variable.id"></StatusCard>
        <div v-if="conflict" style="width: 100% ;text-align: center; color: red; box-sizing: border-box; border: 2px solid orangered">存在冲突</div>
    </div>
</template>

<style lang="scss" scoped>
.module_container {
    font-size: var(--font-default-fontsize);
    margin-bottom: 10px;
}

.compos_state {
    width: 22px;
    height: 22px;
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}
</style>