<script lang="ts" setup>
import {useI18n} from 'vue-i18n';
import {Context} from '@/context';
import TypeHeader from '../TypeHeader.vue';
import {ref, onUnmounted, watch, onMounted} from 'vue'
import {shape_track, get_shape_within_document} from '@/utils/content';
import {SymbolRefShape} from '@kcdesign/data';
import {MoreFilled} from '@element-plus/icons-vue';
import {RefAttriListItem, get_var_for_ref, reset_all_attr_for_ref} from "@/utils/symbol";
import {cardmap} from "./InstanceAttrCard/map";
import Status from "./InstanceAttrCard/IACStatus.vue"
import Visible from "./InstanceAttrCard/IACVisible.vue"

interface Props {
    context: Context
    shape: SymbolRefShape
}

const {t} = useI18n();
const props = defineProps<Props>();
const resetMenu = ref(false);
const variables = ref<RefAttriListItem[]>([]);
const visible_variables = ref<RefAttriListItem[]>([]);
const selectReset = (e: MouseEvent) => {
    if (resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('click', closeResetMenu)
}

const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false;
    }
    document.removeEventListener('click', closeResetMenu);
}

const editComps = () => {
    const symref = props.context.selection.symbolrefshape;
    if (!symref) return;
    const shape = get_shape_within_document(props.context, symref.refId)
    if (!shape) return;
    shape_track(props.context, shape);
}
const untie = () => {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    const shapes = editor.extractSymbol(props.shape);
    if (!shapes) return;
    selection.selectShape(shapes);
    resetMenu.value = false;
}

const shape_watcher = (arg: any) => {
    if (arg !== 'shape-frame') updateData();
}

const updateData = () => {
    const result = get_var_for_ref(props.context, props.shape);
    if (!result) return;
    variables.value = result.variables;
    visible_variables.value = result.visible_variables;
}

function reset_all_attr() {
    reset_all_attr_for_ref(props.context);
}

watch(() => props.shape, (nVal, oVal) => {
    oVal.unwatch(shape_watcher);
    nVal.watch(shape_watcher);
    updateData();
})
onMounted(() => {
    updateData();
    props.shape.watch(shape_watcher);
})
onUnmounted(() => {
    props.shape.unwatch(shape_watcher);
    document.removeEventListener('click', closeResetMenu);
})
</script>

<template>
    <TypeHeader :title="t('compos.instance_attr')" class="mt-24">
        <template #tool>
            <div class="edit-comps">
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
    <div class="module_container">
        <component v-for="item in variables" :key="item.variable.id" :is="cardmap.get(item.variable.type) || Status"
                   :context="props.context"
                   :data="item"></component>
    </div>
    <div v-if="visible_variables.length" class="visible-var-container">
        <div class="show">
            <div class="title">{{ t('compos.layer_show') }}:</div>
            <div class="items-wrap">
                <component v-for="item in visible_variables" :key="item.variable.id" :is="Visible"
                           :context="props.context"
                           :data="item"></component>
            </div>
        </div>
        <div class="place"></div>
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
        }
    }

}

.module_container {
    font-size: var(--font-default-fontsize);
    margin-bottom: 10px;
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