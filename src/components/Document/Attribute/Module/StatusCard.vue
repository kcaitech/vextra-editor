<script setup lang="ts">
import SelectMenu from "@/components/Document/Attribute/PopoverMenu/SelectMenu.vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { Context } from "@/context";
import { useI18n } from "vue-i18n";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { StatusValueItem, get_tag_value } from "@/utils/symbol";
import { Selection } from "@/context/selection";

interface Props {
    context: Context
    data: StatusValueItem
}

const props = defineProps<Props>();
const { t } = useI18n();
const attrValueInput = ref('')
const editAttrValue = ref(false)
const revalueInput = ref<HTMLDivElement>();

const onRevalue = (e: MouseEvent) => {
    e.stopPropagation();
    editAttrValue.value = true
    nextTick(() => {
        if (revalueInput.value) {
            attrValueInput.value = statusValue.value;
            (revalueInput.value as HTMLInputElement).focus();
            (revalueInput.value as HTMLInputElement).select();
        }
    })
}

const closeValueInput = () => {
    editAttrValue.value = false
}
function input_blur(e: InputEvent) {
    const v = (e.target as HTMLInputElement).value;
    save_change(v);
    closeValueInput();
}
const onEditAttrValue = (e: KeyboardEvent) => {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        const v = (e.target as HTMLInputElement).value;
        save_change(v);
        closeValueInput();
    }
}
const selectoption = ref(false);
const showMenu = (e: MouseEvent) => {
    if (selectoption.value) return selectoption.value = false
    selectoption.value = true;
}
const statusValue = ref();
const getVattagValue = () => {
    const shape = props.context.selection.symbolstate;
    if (shape) {
        statusValue.value = get_tag_value(shape, props.data.variable);
    }
}
const selected_watcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        getVattagValue();
    }
}

function selcet(index: number) {
    const val = props.data.values[index];
    save_change(val);
}

function save_change(v: string) {
    const state = props.context.selection.symbolstate;
    if (!v || !state) return;
    const editor = props.context.editor4Shape(state);
    editor.modifyStateSymTagValue(props.data.variable.id, v);
}

onMounted(() => {
    getVattagValue();
    props.context.selection.watch(selected_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
})
</script>
<template>
    <div class="module_state_item">
        <div class="module_con">
            <div class="state_item">
                <div class="state_name"><span>{{ data.variable.name }}</span></div>
                <div class="state_value" v-if="!editAttrValue" @dblclick="onRevalue">
                    <div class="input" @click.stop="showMenu">
                        <span>{{ statusValue }}</span>
                        <el-icon @click.stop="showMenu">
                            <ArrowDown
                                :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                        </el-icon>
                        <SelectMenu v-if="selectoption" :top="33" width="100%" :menuItems="data.values"
                            @close="selectoption = false" @selectIndex="selcet"></SelectMenu>
                    </div>
                </div>
                <div class="module_input" v-if="editAttrValue">
                    <el-input v-model="attrValueInput" ref="revalueInput" @blur="input_blur" @keydown="onEditAttrValue" />
                </div>
            </div>
            <div class="delete"></div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.module_state_item {
    display: flex;
    flex-direction: column;
    margin-bottom: 3px;

    .module_con {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 30px;
    }

    .state_item {
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;

        .state_name {
            display: flex;
            align-items: center;
            width: 40%;
            height: 100%;

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .state_value {
            display: flex;
            align-items: center;
            border-radius: 4px;
            flex: 1;
            height: 100%;
            background-color: var(--grey-light);

            >svg {
                width: 10px;
                height: 10px;
            }

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .input {
                position: relative;
                width: 100%;
                height: 30px;
                border-radius: 4px;
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
    }

    .module_input {
        display: flex;
        align-items: center;
        padding-left: 10px;
        box-sizing: border-box;
        width: calc(100% - 58px);
        height: 30px;

        .el-input {
            font-size: 10px;
            height: 30px;
        }
    }

    .warn {
        margin-left: 30%;
        color: red;
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
</style>