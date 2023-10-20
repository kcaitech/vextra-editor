<script setup lang="ts">
import { Context } from '@/context';
import { VariableType, ShapeType } from '@kcdesign/data'; 
import SelectLayer from "./SelectLayer.vue";
import { ArrowDown } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import { get_layer_from_symbol } from '@/utils/symbol';

const { t } = useI18n();
interface Props {
    title?: string,
    top?: string,
    right?: string,
    width?: number,
    height?: string | number,
    context: Context,
    addType: VariableType,
    dialog_posi: { x: number, y: number }
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
onMounted(() => {
    get_symbol_layer();
})
</script>

<template>
    <div>
        <span>{{
            addType === VariableType.SymbolRef ? `${t('compos.compos_instance')}` : `${t('compos.select_layer')}`
        }}</span>
        <div class="select-layer" @mouseup="showSelectLayer" @click.stop>
            <div class="input"
                :style="{ opacity: context.selection.selectedShapes[0].type !== ShapeType.Symbol ? '0.5' : '1' }">
                <span v-if="selectLayer"></span>
                <span v-else style="opacity: 0.5">{{
                    addType === VariableType.SymbolRef ? `${t('compos.place_select_instance')}` :
                    `${t('compos.place_select_layer')}`
                }}</span>
                <el-icon>
                    <ArrowDown />
                </el-icon>
            </div>
            <SelectLayer v-if="isselectLayer" @close="isselectLayer = false" :type="props.addType" :context="context"
                :selectList="selectList"></SelectLayer>
        </div>
    </div>
</template>

<style scoped lang="scss">
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