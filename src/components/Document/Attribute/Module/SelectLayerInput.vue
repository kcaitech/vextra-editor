<script setup lang="ts">
import {Context} from '@/context';
import {ShapeType, VariableType} from '@kcdesign/data';
import {ArrowDown} from '@element-plus/icons-vue';
import {useI18n} from 'vue-i18n';
import {onMounted, ref} from 'vue';
import {get_layer_from_symbol} from '@/utils/symbol';
import SelectLayer from '../PopoverMenu/SelectLayer.vue';
import {TaskType} from "@/context/escstack";

const {t} = useI18n();

interface Props {
    title: string,
    context: Context,
    addType: VariableType,
    placeholder: string
}

const props = defineProps<Props>();

const selectoption = ref(false);
const selectLayer = ref('');
const selectList = ref<any[]>([]);
const isselectLayer = ref(false);

const showSelectLayer = (e: MouseEvent) => {
    e.stopPropagation();
    selectoption.value = false;
    if (isselectLayer.value && e.target instanceof Element && e.target.closest('.input')) return isselectLayer.value = false;
    isselectLayer.value = true;
    props.context.esctask.save(TaskType.DIALOG, de_show_select_layer);
}

function de_show_select_layer() {
    const is_achieve = isselectLayer.value;
    isselectLayer.value = false;
    return is_achieve;
}

const get_symbol_layer = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        let symbolLayer = get_layer_from_symbol(shapes[0]);
        if (props.addType === VariableType.Text) {
            symbolLayer = symbolLayer.map(v => {
                v.data = v.data.filter(item => item.type === ShapeType.Text);
                return v;
            }).filter(v => v.data.length > 0);
        } else if (props.addType === VariableType.SymbolRef) {
            symbolLayer = symbolLayer.map(v => {
                v.data = v.data.filter(item => item.type === ShapeType.SymbolRef);
                return v;
            }).filter(v => v.data.length > 0);

        }
        selectList.value = symbolLayer;
    }
}
onMounted(get_symbol_layer);
</script>

<template>
    <div class="container">
        <span>{{ title }}</span>
        <div class="select-layer" @mouseup="showSelectLayer" @click.stop>
            <div class="input"
                 :style="{ opacity: context.selection.selectedShapes[0].type !== ShapeType.Symbol ? '0.5' : '1' }">
                <span v-if="selectLayer"></span>
                <span v-else style="opacity: 0.5">{{ placeholder }}</span>
                <el-icon>
                    <ArrowDown/>
                </el-icon>
            </div>
            <SelectLayer v-if="isselectLayer" @close="isselectLayer = false" :type="props.addType" :context="context"
                         :selectList="selectList"></SelectLayer>
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

    > div {
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

        > div {
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