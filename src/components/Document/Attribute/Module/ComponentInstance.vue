<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import SelectLayerInput from './SelectLayerInput.vue';
import { ref, onUnmounted, onMounted } from 'vue';
import CompLayerShow from '../PopoverMenu/CompLayerShow.vue';
import { Shape, SymbolRefShape } from '@kcdesign/data';
import { get_shape_within_document, shape_track } from '@/utils/content';
import { MoreFilled } from '@element-plus/icons-vue';
import { VariableType } from '@kcdesign/data';
import { get_var_for_ref } from "@/utils/symbol";
import PopoverDefaultInput from './PopoverDefaultInput.vue';
interface Props {
    context: Context
    shapes: Shape[]
}

const props = defineProps<Props>();
const { t } = useI18n();
const isInstanceShow = ref(false);
const saveExamplesToggle = () => {
    isInstanceShow.value = false
}
const layerIsShow = () => {
    getDialogPosi();
    isInstanceShow.value = true
}

const resetMenu = ref(false)
const untie = () => {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.extractSymbol(props.shapes[0] as SymbolRefShape);
        if (shapes) {
            selection.selectShape(shapes);
            resetMenu.value = false;
        }
    }
}
const editComps = () => {
    const refId = props.context.selection.selectedShapes[0].refId;
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
const dialog_posi = ref({ x: 0, y: 0 });
const getDialogPosi = () => {
    if (atrrdialog.value) {
        const el = atrrdialog.value.getBoundingClientRect();
        dialog_posi.value.x = el.x - (el.width + 32);
        dialog_posi.value.y = el.y;
    }
}
onMounted(() => {

})
onUnmounted(() => {
    document.removeEventListener('click', closeResetMenu)
})
</script>

<template>
    <div style="position: relative;" ref="atrrdialog">
        <TypeHeader :title="t('compos.compos_instance')" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="rele_svg" @click="layerIsShow">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                    <div class="edit_svg" @click.stop="editComps">
                        <svg-icon icon-class="edit-comp"></svg-icon>
                    </div>
                    <div class="reset_svg" @click.stop="selectReset">
                        <el-icon>
                            <MoreFilled />
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

        <CompLayerShow :context="context" v-if="isInstanceShow" @close-dialog="saveExamplesToggle" right="250px"
            :add-type="VariableType.SymbolRef" :width="260" :title="t('compos.instance_toggle')" :dialog_posi="dialog_posi">
            <template #layer>
                <SelectLayerInput :title="t('compos.compos_instance')" :add-type="VariableType.SymbolRef"
                    :context="props.context" :placeholder="t('compos.place_select_instance')"></SelectLayerInput>
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

        >svg {
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

        >svg {
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

        >svg {
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
</style>