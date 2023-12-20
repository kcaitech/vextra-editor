<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {Context} from '@/context';
import TypeHeader from '../TypeHeader.vue';
import SelectLayerInput from './SelectLayerInput.vue';
import {ref, onUnmounted, onMounted, watch} from 'vue';
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import {OverrideType, Shape, SymbolRefShape, SymbolShape, Variable} from '@kcdesign/data';
import {get_shape_within_document, shape_track} from '@/utils/content';
import {MoreFilled} from '@element-plus/icons-vue';
import {VariableType} from '@kcdesign/data';
import {
    create_var_by_type,
    get_symbol_by_layer,
    is_bind_x_vari,
    modify_variable,
    reset_all_attr_for_ref
} from "@/utils/symbol";
import {message} from '@/utils/message';
import {Selection} from '@/context/selection';

interface Props {
    context: Context
    shapes: Shape[]
}

const props = defineProps<Props>();
const {t} = useI18n();
const isInstanceShow = ref(false);
const saveExamplesToggle = () => {
    isInstanceShow.value = false
}
const layerIsShow = () => {
    getDialogPosi(atrrdialog.value);
    isInstanceShow.value = true
}

const resetMenu = ref(false)
const untie = () => {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.extractSymbol(props.shapes as SymbolRefShape[]);
        if (shapes) {
            selection.rangeSelectShape(shapes);
            resetMenu.value = false;
        }
    }
}
const editComps = () => {
    const refShape = props.context.selection.selectedShapes[0];
    const refId = refShape && (refShape instanceof SymbolRefShape) ? refShape.refId : undefined
    if (!refId) return;
    const shape = get_shape_within_document(props.context, refId)
    if (shape) {
        shape_track(props.context, shape)
    }
}
const selectReset = (e: MouseEvent) => {
    if (resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('click', closeResetMenu)
}
const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false
    }
    document.removeEventListener('click', closeResetMenu)
}

const atrrdialog = ref<HTMLDivElement>();
const dialog_posi = ref({x: 0, y: 0});
const getDialogPosi = (div: HTMLDivElement | undefined) => {
    if (div) {
        const el = div.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}

function reset_all_attr() {
    reset_all_attr_for_ref(props.context);
}

const is_bind = ref<Variable>();
const sym_layer = ref<SymbolShape>();
const default_name = ref('');
const selectId = ref<string[]>([]);
const shape = ref(props.context.selection.selectedShapes[0]);
const isBind = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        const vari = is_bind_x_vari(shapes[0], OverrideType.SymbolID);
        sym_layer.value = get_symbol_by_layer(shapes[0]);
        selectId.value = [shapes[0].id];
        is_bind.value = vari;
        if (vari) {
            default_name.value = vari.name;
        } else {
            default_name.value = shapes[0].name;
        }
    }
}
const card_ref = ref<HTMLDivElement>();

function edit_instance() {
    getDialogPosi(card_ref.value);
    isInstanceShow.value = true;
}

function save_layer_show(type: VariableType, name: string) {
    if (is_bind.value) {
        if (!sym_layer.value) return;
        modify_variable(props.context, sym_layer.value, is_bind.value, name, is_bind.value.value, [is_bind.value.value])
    } else {
        if (!name.trim()) {
            message('info', t('compos.validate_info_2'));
            return;
        }
        const shapes = props.context.selection.selectedShapes;
        const ids = shapes.map(item => item.id);
        if (!sym_layer.value) return;
        create_var_by_type(props.context, VariableType.SymbolRef, name, undefined, ids, sym_layer.value);
    }
    isInstanceShow.value = false;
}

const getValue = (id: string) => {
    return props.context.data.symbolsMgr.getSync(id)?.name;
}
const selected_watcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        isBind();
    }
}

function variable_watcher(args: any[]) {
    if (args && (args.includes('variable') || args.includes('childs'))) isBind();
}

watch(() => shape.value, (v, o) => {
    if (o) {
        o.unwatch(variable_watcher);
    }
    v.watch(variable_watcher);
}, {immediate: true})

function _delete() {
    if (!is_bind.value) return;
    const select = props.context.selection.selectedShapes;
    if (select.length === 1) {
        const editor = props.context.editor4Shape(select[0]);
        editor.removeBinds(OverrideType.SymbolID);
    }
}

onMounted(() => {
    isBind();
    shape.value.watch(variable_watcher);
    props.context.selection.watch(selected_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    shape.value.unwatch(variable_watcher);
    document.removeEventListener('click', closeResetMenu)

})
</script>

<template>
    <div style="position: relative; margin-bottom: 10px;" ref="atrrdialog">
        <TypeHeader :title="t('compos.compos_instance')" class="mt-24" :active="true">
            <template #tool>
                <div class="edit-comps">
                    <div class="rele_svg" @click="layerIsShow" v-if="!is_bind">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                    <div class="edit_svg" @click.stop="editComps">
                        <svg-icon icon-class="edit-comp"></svg-icon>
                    </div>
                    <div class="reset_svg" @click.stop="selectReset">
                        <el-icon>
                            <MoreFilled/>
                        </el-icon>
                        <div class="reset_menu" v-if="resetMenu">
                            <div class="untie" @click="untie">
                                <span>{{ t('compos.untie') }}</span>
                                <span>快捷键</span>
                            </div>
                            <div class="untie" @click="reset_all_attr">{{ t('compos.reset_all_attr') }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <div class="attr_con" v-if="is_bind" ref="card_ref">
            <div class="module_item_left" @click="edit_instance">
                <div class="module_name-2">
                    <div style="width: 30px;" class="svg">
                        <svg-icon icon-class="pattern-rectangle"
                                  style="width: 10px; height: 10px; transform: rotate(45deg); margin-top: 0;"></svg-icon>
                    </div>
                    <div class="name">
                        <span style="width: 40%;">{{ is_bind?.name }}</span>
                        <span style="width: 60%;"> {{ getValue(is_bind?.value) }}</span>
                    </div>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <CompLayerShow :context="context" v-if="isInstanceShow" @close-dialog="saveExamplesToggle" right="250px"
                       :add-type="VariableType.SymbolRef" :width="260" :title="t('compos.instance_toggle')"
                       :dialog_posi="dialog_posi" :default_name="default_name"
                       :variable="is_bind ? is_bind : undefined" @save-layer-show="save_layer_show" :symbol="sym_layer">
            <template #layer>
                <SelectLayerInput :title="t('compos.compos_instance')" :add-type="VariableType.SymbolRef"
                                  :context="props.context" :placeholder="t('compos.place_select_instance')"
                                  :selectId="selectId"></SelectLayerInput>
            </template>
        </CompLayerShow>
    </div>
</template>

<style scoped lang="scss">
.edit-comps {
    width: 66px;
    height: 22px;
    display: flex;
    align-items: center;

    .rele_svg {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        > svg {
            width: 70%;
            height: 70%;
        }
    }

    .edit_svg {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        > svg {
            width: 50%;
            height: 50%;
        }

    }

    .reset_svg {
        position: relative;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        > svg {
            width: 50%;
            height: 50%;
        }

        .reset_menu {
            position: absolute;
            top: 25px;
            right: 0;
            width: 150px;
            padding: 8px 0;
            background-color: #fff;
            border-radius: 2px;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
            z-index: 100;

            .untie {
                height: 30px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
                box-sizing: border-box;

                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }
        }
    }
}

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

        > svg {
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
        width: 100%;

        .svg {
            display: flex;
            align-items: center;
            justify-content: center;

            > svg {
                width: 14px;
                height: 14px;
            }
        }


        .name {
            flex: 1;
            display: flex;
            max-width: 100%;

            > span {
                display: block;
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-right: 10px;
            }
        }
    }

    .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.delete {
    flex: 0 0 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;

    > svg {
        width: 11px;
        height: 11px;
    }

    transition: .2s;
}
</style>