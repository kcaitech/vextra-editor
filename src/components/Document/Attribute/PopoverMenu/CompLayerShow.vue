<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {Context} from '@/context';
import {ShapeType, VariableType} from '@kcdesign/data';
import {useI18n} from 'vue-i18n';
import {get_layer_from_symbol} from "@/utils/symbol";

const {t} = useI18n();

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

interface Emits {
    (e: 'closeDialog'): void;

    (e: 'saveLayerShow', type: VariableType): void;

    (e: 'name-change', name: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function popoverClose() {
    emit('closeDialog');
}

const attrName = ref('')
const isselectLayer = ref(false)


const selectList = ref<any[]>([])

const save = () => {
    emit('saveLayerShow', props.addType)
}

const get_symbol_layer = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        let symbolLayer = get_layer_from_symbol(shapes[0]);
        console.log('symbolLayer:', symbolLayer)
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

const comps = ref<HTMLDivElement>()
const cur_top = ref(0)
const cur_p = ref(0)

function name_change(v: any) {
    emit('name-change', v);
}

onMounted(() => {
    get_symbol_layer();
    if (comps.value) {
        const body_h = document.body.clientHeight;
        const {y, height} = comps.value.getBoundingClientRect();
        const su = body_h - y;
        const cur_t = su - height;
        cur_p.value = cur_t;
        if (cur_t > 0) {
            cur_top.value = props.dialog_posi!.y;
        } else {
            cur_top.value = props.dialog_posi!.y - Math.abs(cur_t);
        }
        if (cur_top.value - 40 < 0) {
            cur_top.value = 40
        }
    }
})
</script>

<template>
    <div class="dialog_box" ref="comps" :style="{
        width: `${props.width ? props.width : 360}px`,
        left: props.dialog_posi.x - 10 + 'px',
        top: cur_p === 0 ? props.dialog_posi!.y + 10 + 'px' : cur_top + 'px'
    }">
        <div class="header">
            <span class="title">{{ props.title }}</span>
            <div @click="popoverClose" class="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="body">
            <!-- 图层选择插槽 -->
            <slot name="layer"></slot>
            <!-- 属性名 -->
            <div>
                <span>{{ t('compos.attr_name') }}</span>
                <div>
                    <el-input v-model="attrName" :placeholder="t('compos.attr_name_input')" @input="name_change"/>
                </div>
            </div>
            <p class="warn" v-if="false">{{ t('compos.duplicate_name') }}</p>
            <!-- 默认值 -->
            <slot name="default_value"></slot>
        </div>
        <div class="footer">
            <el-button style="background-color: #9775fa;" @click="save">确认</el-button>
        </div>
    </div>
    <div class="overlay" @click.stop="isselectLayer = false" @mousedown.stop @wheel.stop></div>
</template>

<style scoped lang="scss">
.dialog_box {
    position: fixed;
    outline: none;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: #ffffff;
    border-radius: 4px;
    z-index: 10004;

    .header {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        font-size: var(--font-default-fontsize);
        padding: 0 var(--default-padding);
        box-sizing: border-box;
        align-items: center;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
        }

        .close {
            width: 24px;
            height: 24px;
            position: absolute;
            right: var(--default-padding);
            display: flex;
            align-items: center;
            justify-content: center;

            > svg {
                width: 65%;
                height: 65%;
            }
        }
    }

    .body {
        width: 100%;
        height: calc(100% - 32px);
        font-size: 10px;
        padding: 0 var(--default-padding);
        box-sizing: border-box;

        .warn {
            padding: 0;
            color: red;
            transform: scale(.9);
            margin: 3px;
            margin-left: 60px;
        }

        > div {
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
        }
    }

    .footer {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px 0;
    }
}

:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}

:deep(.el-button) {
    color: #fff;
}

:deep(.el-select-dropdown__item.selected) {
    color: #9775fa !important;
    font-size: 10px;
}

:deep(.el-select-dropdown__item>span) {
    font-size: 10px !important;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10003;
    background-color: rgba(0, 0, 0, 0.3);
}
</style>