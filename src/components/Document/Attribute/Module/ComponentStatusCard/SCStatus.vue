<script lang="ts" setup>
import { Context } from "@/context";
import { AttriListItem, delete_variable, is_status_allow_to_delete, is_valid_name } from "@/utils/symbol";
import { nextTick, ref } from "vue";
import { SymbolShape, SymbolView, Variable, VariableType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";

interface Props {
    context: Context
    item: AttriListItem
    variable: Variable
}

const props = defineProps<Props>();
const showRename = ref(false);
const attrInput = ref('');
const input_s = ref<HTMLInputElement>();
const isWarnRepeat = ref(false);
const isWarnNull = ref(false);
const edit_symbol = ref<SymbolView>();
const { t } = useI18n();

function selectAllText(event: FocusEvent) {
    (event.target as HTMLInputElement).select(); // 选择输入框内的文本
    edit_symbol.value = props.context.selection.symbolshape;
}

function closeInput() {
    showRename.value = false;
}

function keyboard_watcher(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (!validate()) return;
        const _v = (e.target as HTMLInputElement).value;
        if (_v && _v !== props.variable.name) save_name(_v);
        closeInput()
    }
}

const blur = () => {
    if (!validate()) return;
    if (attrInput.value !== props.variable.name) {
        save_name(attrInput.value);
        closeInput()
    }
}

const validate = () => {
    const len = attrInput.value.trim().length > 0;
    const shape = edit_symbol.value || props.context.selection.symbolshape;
    if (!shape) return false;
    if (attrInput.value === props.variable.name) return closeInput();
    const repeat = is_valid_name(shape, attrInput.value, VariableType.Status);

    if (!len || !repeat) {
        if (!len) isWarnNull.value = true;
        else isWarnRepeat.value = true;
        if (input_s.value) input_s.value.focus();
        return false;
    } else {
        isWarnRepeat.value = false;
        isWarnNull.value = false;
        return true;
    }
}

function rename() {
    showRename.value = true;
    attrInput.value = props.variable.name;
    nextTick(() => {
        const el = input_s.value;
        if (el) {
            (el as HTMLInputElement).focus();
            el.select();
        }
    })
}

function save_name(v: string) {
    const shape = edit_symbol.value || props.context.selection.symbolshape;
    if (!shape) return;
    const editor = props.context.editor4Shape(shape);
    editor.modifyVariableName(props.variable, v);
}

function _delete() {
    const sym = props.context.selection.symbolshape;
    if (!sym) return;
    if (!is_status_allow_to_delete(sym)) return;
    delete_variable(props.context, props.variable);
}
</script>
<template>
    <div class="module_attr_item">
        <div class="attr_con">
            <div class="module_input" v-if="showRename">
                <el-input ref="input_s" v-model="attrInput" @focus="selectAllText" class="input" @blur="blur"
                    @keydown="keyboard_watcher" />
            </div>
            <div class="module_item_left" @dblclick="rename" v-else>
                <div class="module_name">
                    <svg-icon icon-class="comp-state"></svg-icon>
                </div>
                <div class="name_i" :title="props.item.values.toString()">
                    <span style="width:35%;">{{ props.variable.name }}</span>
                    <span style="width: 65%;">{{ props.item.values.toString() }}</span>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <p class="warn" v-if="isWarnRepeat">{{ t('compos.duplicate_name') }}</p>
        <p class="warn" v-if="isWarnNull">{{ t('compos.validate_info_2') }}</p>
    </div>
</template>
<style scoped lang="scss">
.module_attr_item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    width: 100%;

    .attr_con {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 32px;
        box-sizing: border-box;
    }

    .module_item_left {
        display: flex;
        align-items: center;
        border-radius: var(--default-radius);
        background-color: #F5F5F5;
        width: calc(100% - 32px);
        height: 32px;

        .module_name {
            width: 30px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #595959;

            >svg {
                width: 14px;
                height: 14px;
            }

            .name {
                max-width: 50px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        >.name_i {
            flex: 1;
            display: flex;
            max-width: calc(100% - 30px);

            >span {
                display: block;
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-right: 10px;
            }
        }

        .module_name-2 {
            display: flex;
            align-items: center;

            >svg {
                width: 14px;
                height: 14px;
                margin: 0px 10px;
            }

            .name {
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 120px;
        }
    }

    .module_item_left:hover {
        background-color: #EBEBEB;
    }

    .module_input {
        display: flex;
        align-items: center;
        width: 192px;
        height: 32px;

        .el-input {
            font-size: 12px;
            height: 32px;

            :deep(.el-input__wrapper) {
                background-color: #F5F5F5;
                border-radius: 6px;
            }
        }
    }

    .warn {
        font-size: 12px;
        color: red;
        padding: 0;
        color: red;
        margin: 3px;
    }

    .delete {
        flex: 0 0 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);
        transition: .2s;

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .delete:hover {
        background-color: #F5F5F5;
    }
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}
</style>