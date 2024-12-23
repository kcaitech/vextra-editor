<script setup lang="ts">
import { Context } from '@/context';
import { ShapeView, Variable, VariableType } from '@kcdesign/data';
import { ArrowDown } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import SelectLayer from '../PopoverMenu/ComposAttri/SelectLayer.vue';
import { get_options_from_symbol, is_symbol_or_union } from "@/utils/symbol";
import { v4 } from "uuid";
import SvgIcon from "@/components/common/SvgIcon.vue";
import { computed } from 'vue';

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

const disabled = computed<boolean>(() => {
    const symbol = props.context.selection.symbolview;
    return !symbol || !is_symbol_or_union(symbol)
});

const showSelectLayer = (e: MouseEvent) => {
    e.stopPropagation();

    const symbol = props.context.selection.symbolview;
    if (!symbol || !is_symbol_or_union(symbol)) {
        return;
    }

    selectoption.value = false;

    if (isselectLayer.value) {
        return isselectLayer.value = false;
    }

    isselectLayer.value = true;
    props.context.escstack.save(v4(), de_show_select_layer);
}

function de_show_select_layer() {
    const is_achieve = isselectLayer.value;
    isselectLayer.value = false;
    return is_achieve;
}

const get_symbol_layer = () => {
    const symbolshape = props.context.selection.symbolview;
    if (!symbolshape) return;
    const select: ShapeView[] = [];
    selectList.value = get_options_from_symbol(symbolshape, props.addType, t('compos.dlt'), props.variable, select);
    selectLayerid.value = select.map(item => item.id);
    selectLayerName.value = getShapesName(selectLayerid.value);
    emit("change", selectLayerid.value);
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

import down_icon from '@/assets/icons/svg/down.svg';

</script>

<template>
    <div class="container">
        <span>{{ title }}</span>
        <div class="select-layer">
            <div :class="{ input_lay: true, disabled, }" @click="showSelectLayer">
                <span v-if="selectLayerName" class="value" style="color: black;">{{ selectLayerName }}</span>
                <span v-else style="color: #BFBFBF">{{ placeholder }}</span>
                <SvgIcon :icon="down_icon" :style="{ transform: `rotate(${isselectLayer ? '-180deg' : '0deg'})` }">
                    <ArrowDown />
                </SvgIcon>
            </div>
            <SelectLayer v-if="isselectLayer" @close="isselectLayer = false" :type="props.addType" :context="context"
                :selectList="selectList" @change="select_change" :layerId="selectLayerid"></SelectLayer>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 32px;
    width: 100%;
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    span {
        width: 60px;
        color: #737373;
    }

    >div {
        flex: 1;
    }

    .el-input {
        width: 100%;
        height: 32px;
        font-size: 12px;

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
        font-size: 12px;

        >div {
            height: 100%;
        }

        .el-option {
            font-size: 12px
        }

        :deep(.el-input__wrapper) {
            height: 30px;
            font-size: 12px;
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

    .input_lay {
        width: 100%;
        height: 32px;
        border-radius: 6px;
        background-color: #F5F5F5;
        padding-left: 10px;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        &:hover {
            background-color: #EBEBEB;
        }

        &:active {
            background-color: #EBEBEB;
        }

        span {
            flex: 1;
        }

        .value {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        //.el-icon {
        //    width: 30px;
        //    height: 30px;
        //    display: flex;
        //    align-items: center;
        //    justify-content: center;
        //    transition: all 0.3s ease;
        //}

        >svg {
            width: 12px;
            height: 12px;
            color: #666666;
            transition: all 0.3s ease;
            margin-right: 7px;
        }
    }

    .disabled {
        opacity: 0.5;
        pointer-events: none;
    }
}
</style>