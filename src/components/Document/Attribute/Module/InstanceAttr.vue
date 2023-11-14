<script lang="ts" setup>
import {useI18n} from 'vue-i18n';
import {Context} from '@/context';
import TypeHeader from '../TypeHeader.vue';
import {onMounted, onUnmounted, ref} from 'vue'
import {get_shape_within_document, shape_track} from '@/utils/content';
import {Shape, ShapeType, SymbolRefShape} from '@kcdesign/data';
import {MoreFilled} from '@element-plus/icons-vue';
import {
    get_var_for_ref,
    is_able_to_unbind,
    is_symbolref_disa,
    RefAttriListItem,
    reset_all_attr_for_ref
} from "@/utils/symbol";
import {cardmap} from "./InstanceAttrCard/map";
import Status from "./InstanceAttrCard/IACStatus.vue"
import Visible from "./InstanceAttrCard/IACVisible.vue"
import {Selection} from '@/context/selection';

interface Props {
    context: Context
    shapes: SymbolRefShape[]
}

const {t} = useI18n();
const props = defineProps<Props>();
const resetMenu = ref(false);
const variables = ref<RefAttriListItem[]>([]);
const visible_variables = ref<RefAttriListItem[]>([]);
const untie_state = ref<boolean>(false);
const selectReset = (e: MouseEvent) => {
    if (resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('click', closeResetMenu);
    props.context.esctask.save(close_popover);
}

const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false;
    }
    document.removeEventListener('click', closeResetMenu);
}

function close_popover() {
    const is_exist = resetMenu.value;
    resetMenu.value = false;
    document.removeEventListener('click', closeResetMenu);
    return is_exist;
}

const editComps = () => {
    let shape: Shape | undefined
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    let refId = symref.refId;
    shape = get_shape_within_document(props.context, refId);
    if (!shape) return;
    shape_track(props.context, shape);
}
const untie = () => {
    if (!untie_state.value) return;
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    const shapes = editor.extractSymbol(props.shapes);
    if (!shapes) return;
    selection.rangeSelectShape(shapes);
    resetMenu.value = false;
}

const shape_watcher = (arg: any) => {
    if (arg !== 'shape-frame') updateData();
}

const updateData = () => {
    if (props.shapes.length === 1) {
        const symref = props.context.selection.symbolrefshape;
        if (!symref) return;
        const result = get_var_for_ref(props.context, symref, t);
        variables.value = [];
        visible_variables.value = [];
        if (!result) return;
        variables.value = result.variables;
        visible_variables.value = result.visible_variables;
    } else if (props.shapes.length > 1) {

    }
}

function reset_all_attr() {
    if (props.shapes.length === 1) {
        reset_all_attr_for_ref(props.context);
    } else {

    }
}

function updater_untie_state() {
    untie_state.value = is_able_to_unbind(props.context.selection.selectedShapes);
}

function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        updater_untie_state();
        watchShapes();
        updateData();
    }
}

const watchedShapes = new Map();

function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.selectedShapes.length) {
        for (let i = 0, len = selection.selectedShapes.length; i < len; i++) {
            const v = selection.selectedShapes[i];
            if (v.type !== ShapeType.SymbolRef) continue;
            const p = get_ref_ref(v as SymbolRefShape);
            if (p) needWatchShapes.set(p.id, p);
            needWatchShapes.set(v.id, v)
        }
    }
    watchedShapes.forEach((v, k) => {
        if (!needWatchShapes.has(k)) {
            v.unwatch(shape_watcher);
            watchedShapes.delete(k);
        }
    })
    needWatchShapes.forEach((v, k) => {
        if (!watchedShapes.has(k)) {
            v.watch(shape_watcher);
            watchedShapes.set(k, v);
        }
    })
}

function get_ref_ref(symref: SymbolRefShape) {
    const varsContainer = symref.varsContainer;
    if (!varsContainer) return;
    let p = symref.parent;
    while (p) {
        if (p.type === ShapeType.SymbolRef && !p.varsContainer) return p;
        p = p.parent;
    }
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    watchShapes();
    updater_untie_state();
    updateData();
})
onUnmounted(() => {
    document.removeEventListener('click', closeResetMenu);
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => v.unwatch(shape_watcher));
})
</script>

<template>
    <div style="margin-bottom: 10px;">
        <TypeHeader :title="t('compos.instance_attr')" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click.stop="editComps" v-if="is_symbolref_disa(props.shapes)">
                        <svg-icon icon-class="edit-comp"></svg-icon>
                    </div>
                    <div class="reset_svg" @click.stop="selectReset">
                        <el-icon>
                            <MoreFilled/>
                        </el-icon>
                        <div class="reset_menu" v-if="resetMenu">
                            <div :class="{ untie, disabled: !untie_state }" @click="untie">
                                <span>{{ t('compos.untie') }}</span>
                                <span>快捷键</span>
                            </div>
                            <div class="untie" @click="reset_all_attr">{{ t('compos.reset_all_attr') }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <div>
            <div class="module_container" :style="{ marginBottom: variables.length > 0 ? '10px' : '0' }">
                <component v-for="item in variables" :key="item.variable.id + props.shapes[0].id"
                           :is="cardmap.get(item.variable.type) || Status" :context="props.context"
                           :data="item"></component>
            </div>
            <div v-if="visible_variables.length" class="visible-var-container">
                <div class="show">
                    <div class="title">{{ t('compos.layer_show') }}:</div>
                    <div class="items-wrap">
                        <component v-for="item in visible_variables" :key="item.variable.id + props.shapes[0].id"
                                   :is="Visible" :context="props.context"
                                   :data="(item as RefAttriListItem)"></component>
                    </div>
                </div>
                <div class="place"></div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.edit-comps {
    width: 44px;
    height: 22px;
    display: flex;
    align-items: center;

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

            .disabled {
                pointer-events: none;
                opacity: 0.2;
            }
        }
    }

}

.module_container {
    font-size: var(--font-default-fontsize);
}

.visible-var-container {
    display: flex;
    width: 100%;

    .show {
        display: flex;
        width: calc(100% - 22px);

        .title {
            width: 40%;
            line-height: 26px;
            font-weight: 600;
            padding-right: 10px;
        }

        .items-wrap {
            width: 60%;
        }
    }

    .place {
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
</style>