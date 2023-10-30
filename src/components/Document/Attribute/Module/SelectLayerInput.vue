<script setup lang="ts">
import { Context } from '@/context';
import { Shape, ShapeType, Variable, VariableType } from '@kcdesign/data';
import { ArrowDown } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import { get_instance_from_symbol, get_layer_from_symbol, get_text_from_symbol } from '@/utils/symbol';
import SelectLayer from '../PopoverMenu/ComposAttri/SelectLayer.vue';

const { t } = useI18n();

interface Props {
    title: string,
    context: Context,
    addType: VariableType,
    placeholder: string,
    variable?: Variable,
    selectId?: string[]
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'change', data: string[]): void;
}>()
const selectoption = ref(false);
const selectLayerName = ref('');
const selectLayerid = ref<string[]>([]);
const selectList = ref<any[]>([]);
const isselectLayer = ref(false);

const showSelectLayer = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.context.selection.selectedShapes[0].type !== ShapeType.Symbol) return;
    selectoption.value = false;
    if (isselectLayer.value && e.target instanceof Element && e.target.closest('.input')) return isselectLayer.value = false;
    isselectLayer.value = true;
    props.context.esctask.save(de_show_select_layer);
}

function de_show_select_layer() {
    const is_achieve = isselectLayer.value;
    isselectLayer.value = false;
    return is_achieve;
}

const get_symbol_layer = () => {
    const symbolshape = props.context.selection.symbolshape;
    if (!symbolshape) return;
    if (props.addType === VariableType.Visible) {
        const select: Shape[] = [];
        selectList.value = get_layer_from_symbol(symbolshape, props.variable, select);
        selectLayerid.value = select.map(item => item.id);
        selectLayerName.value = getShapesName(selectLayerid.value);
    } else if (props.addType === VariableType.Text) {
        const select: Shape[] = [];
        selectList.value = get_text_from_symbol(symbolshape, props.variable, select);
        selectLayerid.value = select.map(item => item.id);
        selectLayerName.value = getShapesName(selectLayerid.value);
    } else if (props.addType === VariableType.SymbolRef) {
        const select: Shape[] = [];
        selectList.value = get_instance_from_symbol(symbolshape, props.variable, select);
        selectLayerid.value = select.map(item => item.id);
        selectLayerName.value = getShapesName(selectLayerid.value);
    }
}

function select_change(data: string[]) {
    selectLayerName.value = getShapesName(data);
    selectLayerid.value = data;
    emit("change", data);
}

const get_bind_layer_name = () => {
    if (props.selectId && props.selectId.length > 0) {
        selectLayerName.value = getShapesName(props.selectId);
    }
}

const getShapesName = (ids: string[]) => {
    const page = props.context.selection.selectedPage;
    let names: string[] = [];
    if (!page) return '';
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const shape = page.getShape(id);
        if (shape) {
            names.push(shape.name);
        }
    }
    let result = names.length > 0 ? names.join(',') : '';
    return result;
}

onMounted(() => {
    get_bind_layer_name();
    get_symbol_layer();
});
</script>

<template>
    <div class="container">
        <span>{{ title }}</span>
        <div class="select-layer">
            <div class="input" @click="showSelectLayer" @mouseup.stop
                :style="{ opacity: context.selection.selectedShapes[0].type !== ShapeType.Symbol ? '0.5' : '1' }">
                <span v-if="selectLayerName" class="value">{{ selectLayerName }}</span>
                <span v-else style="opacity: 0.5">{{ placeholder }}</span>
                <el-icon>
                    <ArrowDown />
                </el-icon>
            </div>
            <SelectLayer v-if="isselectLayer" @close="isselectLayer = false" :type="props.addType" :context="context"
                :selectList="selectList" @change="select_change" :layerId="selectLayerid"></SelectLayer>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 30px;
    width: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    span {
        width: 60px;
    }

    >div {
        flex: 1;
    }

    .el-input {
        width: 100%;
        height: 30px;
        font-size: 10px;

        :deep(.el-input__wrapper) {
            background-color: var(--grey-light);
            box-shadow: none;
        }

        :deep(.el-input__wrapper.is-focus) {
            box-shadow: 0 0 0 1px var(--active-color) inset;
        }
    }

    .el-select {
        width: 100%;
        height: 30px;
        font-size: 10px;

        >div {
            height: 100%;
        }

        .el-option {
            font-size: 10px
        }

        :deep(.el-input__wrapper) {
            height: 30px;
            font-size: 10px;
            background-color: var(--grey-light);
            box-shadow: none;

            .el-icon svg {
                width: 10px;
                height: 10px;
                color: black;
            }
        }
    }
}

.select-layer {
    position: relative;
    z-index: 1;

    .input {
        width: 100%;
        height: 30px;
        border-radius: 4px;
        background-color: var(--grey-light);
        padding-left: 10px;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        span {
            flex: 1;
        }

        .value {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .el-icon {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>