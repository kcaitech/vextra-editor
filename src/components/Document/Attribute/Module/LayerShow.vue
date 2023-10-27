<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick, onMounted } from 'vue';
import CompLayerShow from '../PopoverMenu/CompLayerShow.vue';
import SelectLayerInput from './SelectLayerInput.vue';
import { VariableType } from '@kcdesign/data';
import PopoverDefaultInput from './PopoverDefaultInput.vue';
const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();
const isLayerShow = ref(false);
const closeLayerShowPopup = () => {
    isLayerShow.value = false
}
const layerIsShow = () => {
    getDialogPosi();
    isLayerShow.value = true
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
    const shapes = props.context.selection.selectedShapes;
    console.log(shapes[0].parent);
    
})
</script>
<template>
    <div style="position: relative;" ref="atrrdialog">
        <TypeHeader :title="t('compos.layer_isShow')" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="layerIsShow">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <CompLayerShow :context="context" v-if="isLayerShow" @close-dialog="closeLayerShowPopup" right="250px"
            :add-type="VariableType.Visible" :width="260" :title="t('compos.layer_isShow')" :dialog_posi="dialog_posi">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Visible"
                    :context="props.context" :placeholder="t('compos.place_select_layer')"></SelectLayerInput>
            </template>
            <template #default_value>
                <PopoverDefaultInput :context="context" :add-type="VariableType.Visible"></PopoverDefaultInput>
            </template>
        </CompLayerShow>
    </div>
</template>
<style lang="scss" scoped>
.edit-comps {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;

    .edit_svg {
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
}
</style>