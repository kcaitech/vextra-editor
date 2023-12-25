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
    align-items: center;
    min-height: 44px;

    .state_item {
        display: flex;
        align-items: center;
        // width: calc(100% - 22px);
        width: 100%;
        gap: 12px;

        .state_name {
            display: flex;
            align-items: center;
            width: 40%;
            box-sizing: border-box;

            span {
                color: #595959;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .state_value {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 11px;
            width: 60%;
            flex: 1;
            border-radius: 6px;

            >svg {
                width: 10px;
                height: 10px;
            }

            .input {
                position: relative;
                width: 100%;
                height: 32px;
                border-radius: 4px;
                padding-left: 11px;
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

            .el-select {
                width: 100%;
                height: 32px;
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

                    &:hover {
                        border-color: var(--grey-light);
                        box-shadow: none;
                    }
                }
            }

            :deep(.el-textarea) {
                width: 100%;
                font-size: var(--font-default-fontsize);

                .el-textarea__inner {
                    font-size: 12px;
                    padding: 5px 12px !important;
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
                        background-color:  #F5F5F5 !important;
                        box-shadow: 0 0 0 1px var(--active-color) inset;
                    }
                }
            }
        }

        .border {
            background-color: var(--grey-light);
        }
    }

    .delete {
        flex: 0 0 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 22px;
        height: 22px;
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