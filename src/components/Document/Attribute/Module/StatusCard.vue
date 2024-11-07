<script setup lang="ts">
import SelectMenu from "@/components/Document/Attribute/PopoverMenu/ComposAttri/SelectMenu.vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { Context } from "@/context";
import { useI18n } from "vue-i18n";
import { nextTick, onMounted, onUnmounted, onUpdated, ref } from "vue";
import { StatusValueItem, get_tag_value } from "@/utils/symbol";
import { Selection } from "@/context/selection";
import { Menu } from "@/context/menu";
import { SymbolShape, SymbolView } from "@kcdesign/data";

interface Props {
    context: Context
    data: StatusValueItem
}

const props = defineProps<Props>();
const { t } = useI18n();
const attrValueInput = ref('')
const editAttrValue = ref(false)
const revalueInput = ref();
const top = ref<number>(0);
const statusValue = ref();
const menuIndex = ref();
const edit_symbol = ref<SymbolView>();
const onRevalue = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.target instanceof Element && e.target.closest('.status-icon-down')) return;
    editAttrValue.value = true;
    nextTick(() => {
        if (revalueInput.value) {
            attrValueInput.value = statusValue.value;
            (revalueInput.value as HTMLInputElement).focus();
            (revalueInput.value as HTMLInputElement).select();
        }
    })
}
const selectText = () => {
    nextTick(() => {
        if (revalueInput.value) {
            revalueInput.value.select();
            edit_symbol.value = props.context.selection.symbolstate;
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
const selectOption = ref(false);
const showMenu = (e: MouseEvent) => {
    if (selectOption.value) {
        return selectOption.value = false;
    }
    props.context.menu.notify(Menu.CLOSE_COMP_MENU);
    selectOption.value = true;
    nextTick(locate);
}
function locate() {
    if (menuIndex.value === -1) {
        top.value = 30;
    } else {
        top.value = -(menuIndex.value * 32 + 4);
    }
}

const getVarTagValue = () => {
    const shape = props.context.selection.symbolstate;
    if (!shape) return;
    let val = get_tag_value(shape, props.data.variable);
    if (val === SymbolShape.Default_State) {
        val = t('compos.dlt');
    }

    statusValue.value = val;
    menuIndex.value = props.data.values.findIndex(v => v === val);
}
const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        getVarTagValue();
        if (selectOption.value) {
            selectOption.value = false;
        }
    }
}


function select(index: number) {
    if (index === props.data.values.length - 1) {
        editAttrValue.value = true;
        attrValueInput.value = '新的值';
        nextTick(() => {
            (revalueInput.value as HTMLInputElement).focus();
            (revalueInput.value as HTMLInputElement).select();
        })
    } else {
        const val = props.data.values[index];
        save_change(val);
    }
    selectOption.value = false;
}

function save_change(v: string) {
    const state = edit_symbol.value || props.context.selection.symbolstate;
    if (!v || !state) return;
    const editor = props.context.editor4Shape(state);
    if (v === t('compos.dlt')) {
        v = SymbolShape.Default_State;
    }
    editor.modifyStateSymTagValue(props.data.variable.id, v);
}
onUpdated(() => {
    console.log('--update--')
    getVarTagValue();
})
onMounted(() => {
    console.log('--mounted--')
    getVarTagValue();
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
                    <div class="input">
                        <span>{{ statusValue }}</span>
                        <el-icon @click.stop="showMenu" class="status-icon-down">
                            <ArrowDown
                                :style="{ transform: selectOption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }"/>
                        </el-icon>
                    </div>
                    <SelectMenu v-if="selectOption" :top="top" width="100%" :menuItems="data.values" :context="context"
                                :menuIndex="menuIndex" @close="selectOption = false" @selectIndex="select"></SelectMenu>
                </div>
                <div class="module_input" v-if="editAttrValue">
                    <el-input v-model="attrValueInput" ref="revalueInput" @blur="input_blur" @focus="selectText"
                        @keydown.stop="onEditAttrValue" />
                </div>
            </div>
            <!-- <div class="delete"></div> -->
        </div>
    </div>
</template>
<style scoped lang="scss">
.module_state_item {
    display: flex;
    flex-direction: column;
    margin-top: 6px;

    .module_con {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .state_item {
        display: flex;
        align-items: center;
        // width: calc(100% - 22px);
        width: 100%;

        .state_name {
            display: flex;
            align-items: center;
            width: 40%;
            box-sizing: border-box;
            margin-right: 12px;

            span {
                color: #595959;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .state_value {
            position: relative;
            display: flex;
            align-items: center;
            border-radius: 6px;
            width: 60%;
            flex: 1;
            background-color: var(--grey-light);

            >svg {
                width: 12px;
                height: 12px;
            }

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .input {
                width: 100%;
                height: 32px;
                border-radius: 4px;
                padding-left: 9px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                background-color: #F5F5F5;

                span {
                    flex: 1;
                }

                .status-icon-down {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 4px;
                    border-radius: 4px;

                    >svg {
                        width: 12px;
                        height: 12px;
                    }
                }

                .status-icon-down:hover {
                    background-color: rgba($color: #000000, $alpha: 0.08);
                }
            }
        }
    }

    .module_input {
        display: flex;
        align-items: center;
        padding-left: 9px;
        box-sizing: border-box;
        width: calc(100% - 58px);
        height: 32px;

        .el-input {
            font-size: var(--font-default-fontsize);
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