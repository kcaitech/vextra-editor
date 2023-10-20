<script lang="ts" setup>
import {useI18n} from 'vue-i18n';
import {Context} from '@/context';
import TypeHeader from '../TypeHeader.vue';
import {ref, nextTick, onUnmounted, watch, onMounted, computed} from 'vue'
import ComponentDialog from './ComponentDialog.vue';
import {shape_track, get_shape_within_document} from '@/utils/content';
import {Shape, SymbolRefShape, Variable, VariableType} from '@kcdesign/data';
import {ArrowDown, MoreFilled} from '@element-plus/icons-vue';
import SelectMenu from '../PopoverMenu/SelectMenu.vue';
import {get_var_for_ref} from "@/utils/symbol";

const {t} = useI18n();
const props = defineProps<{
    context: Context
    shape: SymbolRefShape
}>()

const resetMenu = ref(false)
const showCompsDialog = ref(false)
const textValue = ref('文本内容')
const menuItems = ['默认']
const attrValue = ref('默认')
const comps = ref<HTMLDivElement>();
const comps_posi = ref({x: 0, y: 0});
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

const closeDialog = () => {
    showCompsDialog.value = false;
}
const compsDialog = () => {
    props.context.component.set_scroll_target(props.shape.refId);
    if (comps.value) {
        const el = comps.value.getBoundingClientRect();
        comps_posi.value.x = el.x - (el.width + 32);
        comps_posi.value.y = el.y;
    }
    showCompsDialog.value = true;
}

const editComps = () => {
    const refId = props.context.selection.selectedShapes[0].refId;
    const shape = get_shape_within_document(props.context, refId)
    if (shape) {
        shape_track(props.context, shape)
    }
}
const untie = () => {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.extractSymbol(props.shape);
        if (shapes) {
            selection.selectShape(shapes);
            resetMenu.value = false;
        }
    }
}
const selectoption = ref(false)
const showMenu = () => {
    if (selectoption.value) return selectoption.value = false
    selectoption.value = true;
}
const inputRef = ref<any>()
const selectAllText = () => {
    inputRef.value.select()
}
// const variables = ref<Variable[]>([]);
const visibles = ref<Variable[]>([]);
const textContents = ref<Variable[]>([]);
const instances = ref<Variable[]>([]);
const attrStates = ref<Variable[]>([]);

const watchShape = () => {
    // varUnwatch(variables.value as Variable[])
    // variables.value = props.shape.variables;
    updateData();
    // varWatch(variables.value as Variable[])
}

const updateData = () => {
    const variables = Array.from(props.shape.variables?.values() || []);
    visibles.value = variables.filter(item => item.type === VariableType.Visible) || [];
    instances.value = variables.filter(item => item.type === VariableType.SymbolRef) || [];
    textContents.value = variables.filter(item => item.type === VariableType.Text) || [];
    attrStates.value = variables.filter(item => item.type === VariableType.Status) || [];
}

// const varWatch = (variables: Variable[]) => {
//     variables.forEach(item => {
//         item.watch(updateData)
//     })
// }
// const varUnwatch = (variables: Variable[]) => {
//     variables.forEach(item => {
//         item.unwatch(updateData)
//     })
// }

onMounted(() => {
    watchShape();
    props.shape.watch(watchShape)
    watch(() => props.shape, (nVal, oVal) => {
        oVal.unwatch(watchShape);
        nVal.watch(watchShape);
    })
})
onUnmounted(() => {
    props.shape.unwatch(watchShape)
    document.removeEventListener('click', closeResetMenu)
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
                        <div class="untie">{{ t('compos.reset_all_attr') }}</div>
                    </div>
                </div>
            </div>
        </template>
    </TypeHeader>
    <div class="module_container">
        <component :is="InstanceAttrCard" :context="props.context" :type="VariableType.Status"></component>
        <component :is="InstanceAttrCard" :context="props.context" :type="VariableType.SymbolRef"></component>
        <component :is="InstanceAttrCard" :context="props.context" :type="VariableType.Text"></component>
        <component :is="InstanceAttrCard" :context="props.context" :type="VariableType.Visible"></component>
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