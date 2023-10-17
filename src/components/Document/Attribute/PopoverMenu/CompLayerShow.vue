<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {Context} from '@/context';
import SelectLayer from "./SelectLayer.vue";
import {ArrowDown} from '@element-plus/icons-vue'
import {ShapeType, SymbolShape, VariableType} from '@kcdesign/data';
import SelectMenu from './SelectMenu.vue';
import {useI18n} from 'vue-i18n';

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
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function popoverClose() {
    emit('closeDialog');
}

const selectLayer = ref('')
const attrName = ref('')
const isselectLayer = ref(false)
const options = [
    {
        value: '显示',
        label: '显示',
    },
    {
        value: '隐藏',
        label: '隐藏',
    }
]
const defaultValue = ref('显示');
const textDefaultValue = ref('');
const selectList = ref<any[]>([])

function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') popoverClose();
    else e.stopPropagation();
}

const showSelectLayer = (e: MouseEvent) => {
    e.stopPropagation();
    selectoption.value = false;
    if (isselectLayer.value && e.target instanceof Element && e.target.closest('.input')) return isselectLayer.value = false;
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        if (shapes[0].type === ShapeType.Symbol) {
            const symbol = shapes[0] as SymbolShape
            if (props.addType === VariableType.Visible) {
                selectList.value = symbol.childs.filter(item => item.type !== ShapeType.Symbol);
            } else if (props.addType === VariableType.Text || props.addType === VariableType.Status) {
                selectList.value = symbol.childs.filter(item => item.type === ShapeType.Text);
            } else if (props.addType === VariableType.Instance) {
                selectList.value = symbol.childs.filter(item => item.type === ShapeType.SymbolRef);
            }
        } else {
            return;
        }
    }
    isselectLayer.value = true;
}
const save = () => {
    emit('saveLayerShow', props.addType)
}

const selectoption = ref(false)
const menuItems = ['显示', '隐藏']
const showMenu = () => {
    if (selectoption.value) return selectoption.value = false
    selectoption.value = true;
}
const handleShow = (index: number) => {
    defaultValue.value = menuItems[index];
}

const comps = ref<HTMLDivElement>()
const cur_top = ref(0)
const cur_p = ref(0)
onMounted(() => {
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
    document.addEventListener('keyup', esc);
})
onUnmounted(() => {
    document.removeEventListener('keyup', esc);
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
            <div>
                <span>{{
                        addType === 'toggle' ? `${t('compos.compos_instance')}` : `${t('compos.select_layer')}`
                    }}</span>
                <div class="select-layer" @mouseup="showSelectLayer" @click.stop>
                    <div class="input"
                         :style="{ opacity: context.selection.selectedShapes[0].type !== ShapeType.Symbol ? '0.5' : '1' }">
                        <span v-if="selectLayer"></span>
                        <span v-else style="opacity: 0.5">{{
                                addType === 'toggle' ? `${t('compos.place_select_instance')}` :
                                    `${t('compos.place_select_layer')}`
                            }}</span>
                        <el-icon>
                            <ArrowDown/>
                        </el-icon>
                    </div>
                    <SelectLayer v-if="isselectLayer" @close="isselectLayer = false" :type="props.addType"
                                 :context="context" :selectList="selectList"></SelectLayer>
                </div>
            </div>
            <div>
                <span>{{ t('compos.attr_name') }}</span>
                <div>
                    <el-input v-model="attrName" :placeholder="t('compos.attr_name_input')"/>
                </div>
            </div>
            <p class="warn" v-if="false">{{ t('compos.duplicate_name') }}</p>
            <div v-if="props.addType !== 'toggle' && props.addType">
                <span>默认值</span>
                <div v-if="props.addType === 'Show'" class="show">
                    <div class="input" @click.stop="showMenu">
                        <span>{{ defaultValue }}</span>
                        <el-icon>
                            <ArrowDown
                                :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }"/>
                        </el-icon>
                        <SelectMenu v-if="selectoption" :top="33" width="100%" :menuItems="menuItems"
                                    @select-index="handleShow" @close="selectoption = false"></SelectMenu>
                    </div>
                </div>
                <div v-if="props.addType === 'Text'">
                    <el-input v-model="textDefaultValue"
                              :placeholder="t('compos.default_text_input')"/>
                </div>
            </div>
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
    }

    .footer {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px 0;
    }
}

.show {
    .input {
        position: relative;
        width: 100%;
        height: 30px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        padding-left: 11px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        background-color: var(--grey-light);

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
}</style>