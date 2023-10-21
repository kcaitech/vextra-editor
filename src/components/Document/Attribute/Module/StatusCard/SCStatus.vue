<script lang="ts" setup>
import {Context} from "@/context";
import {AttriListItem, delete_variable} from "@/utils/symbol";
import {nextTick, ref} from "vue";
import {Variable} from "@kcdesign/data";
import {useI18n} from "vue-i18n";

interface Props {
    context: Context
    item: AttriListItem
    variable: Variable
}
const props = defineProps<Props>();
const showRename = ref(false);
const attrInput = ref('');
const input_s = ref<HTMLInputElement>();
const { t } = useI18n();

function selectAllText(event: FocusEvent) {
    (event.target as HTMLInputElement).select(); // 选择输入框内的文本
}
function closeInput() {
    showRename.value = false;
}
function keyboard_watcher(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        const _v = (e.target as HTMLInputElement).value;
        if (_v && _v !== props.variable.name) save_name(_v);
        closeInput()
    }
}
function rename() {
    showRename.value = true;
    nextTick(() => {
        const el = input_s.value;
        if (el) {
            (el as HTMLInputElement).focus();
            (el as HTMLInputElement).value = props.variable.name;
        }
    })
}
function save_name(v: string) {
    const shape = props.context.selection.symbolshape;
    if (!shape) return;
    const editor = props.context.editor4Shape(shape);
    editor.modifyVariableName(props.variable, v);
}
function _delete() {
    delete_variable(props.context, props.variable);
}
</script>
<template>
    <div class="module_attr_item">
        <div class="attr_con">
            <div class="module_input" v-if="showRename">
                <el-input ref="input_s" v-model="attrInput" @focus="selectAllText" class="input" @blur="closeInput"
                          @keydown="keyboard_watcher" />
            </div>
            <div class="module_item_left" @dblclick="rename" v-else>
                <div class="module_name">
                    <svg-icon icon-class="comp-state"></svg-icon>
                    <span class="name">{{ props.variable.name }}</span>
                </div>
                <div class="name" :title="props.item.values.toString()">{{ props.item.values.toString() }}</div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <div class="warn" v-if="false">{{ t('compos.duplicate_name') }}</div>
    </div>
</template>
<style scoped lang="scss">
.module_attr_item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;
    width: 100%;

    .attr_con {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .module_item_left {
        display: flex;
        align-items: center;
        border-radius: 4px;
        background-color: var(--grey-light);
        width: calc(100% - 22px);
        height: 30px;

        .module_name {
            display: flex;
            align-items: center;
            width: 84px;

            >svg {
                width: 14px;
                height: 14px;
                margin: 0px 10px;
            }

            .name {
                max-width: 50px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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

    .module_input {
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;

        .el-input {
            font-size: 10px;
            height: 30px;
        }
    }

    .warn {
        color: red;
        transform: scale(.9);
    }

    .delete {
        flex: 0 0 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 22px;
        height: 22px;

        >svg {
            width: 11px;
            height: 11px;
        }

        transition: .2s;
    }
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}
</style>