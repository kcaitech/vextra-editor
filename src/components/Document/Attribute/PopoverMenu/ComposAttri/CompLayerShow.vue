<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { Context } from '@/context';
import { SymbolShape, Variable, VariableType } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { is_valid_name } from "@/utils/symbol";

const { t } = useI18n();

interface Props {
    title?: string,
    top?: string,
    right?: string,
    width?: number,
    height?: string | number,
    context: Context,
    addType: VariableType,
    dialog_posi: { x: number, y: number },
    selected_layer?: string[],
    default_name?: string,
    variable?: Variable,
    symbol?: SymbolShape, // 图层所在的组件
}

interface Emits {
    (e: 'closeDialog'): void;

    (e: 'saveLayerShow', type: VariableType, name: string): void;

    (e: 'name-change', name: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function popoverClose() {
    emit('closeDialog');
}

const attrName = ref('');
const isselectLayer = ref(false);
const fixed = ref(false);
const isWarnRepeat = ref(false);
const isWarnNull = ref(false);

watch(() => props.selected_layer, (v) => {
    if (v && v.length > 0) {
        if (!fixed.value || attrName.value.length < 1) {
            attrName.value = getShapesName(v);
            validate();
        }
    } else {
        if (!fixed.value) {
            attrName.value = '';
        }
    }
    emit("name-change", attrName.value);
})

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

const save = () => {
    if (!validate()) return;
    // save_name(attrName.value);
    emit('saveLayerShow', props.addType, attrName.value)
}

const comps = ref<HTMLDivElement>()
const cur_top = ref(0)
const cur_p = ref(0)

function name_change(v: any) {
    emit('name-change', attrName.value);
    fixed.value = true;
    isWarnRepeat.value = false;
    isWarnNull.value = false;
}
const input = ref();
const focus = () => {
    if (input.value) {
        input.value.select();
    }
}

function keyboard_watcher(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        save();
    }
}

function save_name(v: string) {
    const shape = props.context.selection.symbolshape || props.symbol;
    const value = attrName.value !== props.default_name || '';
    if (!shape || !props.variable || !value) return;
    const editor = props.context.editor4Shape(shape);
    editor.modifyVariableName(props.variable, v);
}

const validate = () => {
    const len = attrName.value.trim().length > 0;
    const shape = props.context.selection.symbolshape || props.symbol;
    if (!shape) return false;
    if(props.default_name && attrName.value === props.default_name) return true;
    const repeat = is_valid_name(shape, attrName.value, props.addType);
    if (!len || !repeat) {
        if (!len) isWarnNull.value = true;
        else isWarnRepeat.value = true;
        if (input.value) input.value.focus();
        return false;
    } else {
        isWarnRepeat.value = false;
        isWarnNull.value = false;
        return true;
    }
}

watchEffect(() => {
    props.default_name;
    if (props.default_name) {
        attrName.value = props.default_name;
        fixed.value = true;
    }
})

onMounted(() => {
    if (comps.value) {
        const body_h = document.body.clientHeight;
        const { y, height } = comps.value.getBoundingClientRect();
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
    document.addEventListener('keydown', keyboard_watcher);
})
onUnmounted(() => {
    document.removeEventListener('keydown', keyboard_watcher);
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
                    <el-input v-model="attrName" ref="input" :placeholder="t('compos.attr_name_input')" @input="name_change"
                        @keydown.stop="keyboard_watcher" @focus="focus" @change="validate()"/>
                </div>
            </div>
            <p class="warn" v-if="isWarnRepeat">{{ t('compos.duplicate_name') }}</p>
            <p class="warn" v-if="isWarnNull">属性名称不能为空</p>
            <!-- 默认值 -->
            <slot name="default_value"></slot>
        </div>
        <div class="footer">
            <el-button :style="{backgroundColor: '#9775fa'}" @click="save">确认</el-button>
        </div>
    </div>
    <div class="overlay" @click.stop="isselectLayer = false"></div>
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

            >svg {
                width: 65%;
                height: 65%;
            }
        }
    }

    .body {
        width: 100%;
        height: calc(100% - 32px);
        font-size: 12px;
        padding: 0 var(--default-padding);
        box-sizing: border-box;

        .warn {
            font-size: 10px;
            padding: 0;
            color: red;
            margin: 3px;
            margin-left: 60px;
        }

        >div {
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
                font-size: 12px;

                :deep(.el-input__wrapper) {
                    background-color: var(--grey-light);
                    box-shadow: none;
                    .el-input__inner {
                        line-height: 100%;
                    }
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
    font-size: 12px;
}

:deep(.el-select-dropdown__item>span) {
    font-size: 12px !important;
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