<script setup lang="ts">
import { get_vari_value_for_ref, modify_vari_value_for_ref, RefAttriListItem } from "@/utils/symbol";
import { ref, onMounted, watch } from "vue";
import { Context } from "@/context";
import { OverrideType } from "@kcdesign/data";

interface Props {
    context: Context
    data: RefAttriListItem
}

const props = defineProps<Props>();
const textValue = ref('');
const inputRef = ref();

const selectAllText = () => {
    inputRef.value?.select()
}

function get_value() {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return console.log("wrong role");
    const text = get_vari_value_for_ref(symref, props.data.variable);
    textValue.value = typeof text === 'string' ? text : text.toString();
}

const keysumbit = (e: KeyboardEvent) => {
    const { shiftKey, ctrlKey, metaKey } = e;
    if (e.key === 'Enter') {
        if (ctrlKey || metaKey || shiftKey) {
            inputRef.value = inputRef.value + '\n'
        } else {
            inputRef.value.blur();
        }
    }
}

watch(() => props.data, get_value);

function change(v: string) {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return console.log("wrong role");
    const overrides = symref.findOverride(props.data.variable.id, OverrideType.Variable);
    const _var = overrides ? overrides[overrides.length - 1] : props.data.variable;
    modify_vari_value_for_ref(props.context, _var, v);
}

onMounted(get_value);
</script>
<template>
    <div class="module_state_item">
        <div class="state_item">
            <div class="state_name"><span>{{ props.data.variable.name }}</span></div>
            <div class="state_value" style="padding: 0;">
                <el-input ref="inputRef" v-model="textValue" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                    resize="none" @focus="selectAllText" @change="change" @keydown.stop="keysumbit" />
            </div>
        </div>
        <!-- <div class="delete"></div> -->
    </div>
</template>
<style lang="scss" scoped>
.module_state_item {
    position: relative;
    display: flex;

    .state_item {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        //margin-top: 6px;

        .state_name {
            flex: 1;
            max-width: 86px;
            box-sizing: border-box;

            span {
                display: block;
                width: 100%;
                color: #595959;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .state_value {
            padding: 0 9px;
            flex: 0 0 126px;
            border-radius: 6px;

            >svg {
                width: 10px;
                height: 10px;
            }

            :deep(.el-textarea) {
                width: 100%;
                font-size: var(--font-default-fontsize);

                .el-textarea__inner {
                    font-size: 12px;
                    padding: 5px 9px !important;
                    min-height: 32px !important;
                    background-color: #F5F5F5;
                    line-height: 22px;
                    box-shadow: none;
                    border-radius: 6px;
                    color: #000000;

                    &:hover {
                        background-color: #EBEBEB;
                    }

                    &:focus {
                        background-color: #F5F5F5 !important;
                        box-shadow: 0 0 0 1px var(--active-color) inset;
                    }
                }
            }
        }
    }
}

:deep(.el-select-dropdown__item.selected) {
    color: #9775fa !important;
    font-size: 12px;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
    background-color: var(--grey-light);
}

:deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}

:deep(.el-textarea__inner::-webkit-scrollbar) {
    width: 6px;
}

:deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
    border-radius: 6px;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    background-color: #c3c3c3;
}

:deep(.el-textarea__inner::-webkit-scrollbar-track) {
    background-color: transparent;
}
</style>