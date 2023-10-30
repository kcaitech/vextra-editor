<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick } from 'vue';
import CompLayerShow from '../PopoverMenu/ComposAttri/CompLayerShow.vue';
import { VariableType } from '@kcdesign/data';
import SelectLayerInput from './SelectLayerInput.vue';
import PopoverDefaultInput from './PopoverDefaultInput.vue';
const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();
const isTextShow = ref(false);
const closeLayerShowPopup = () => {
    isTextShow.value = false
}
const textDialog = () => {
    getDialogPosi();
    isTextShow.value = true
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
</script>
<template>
    <div style="position: relative;" ref="atrrdialog">
        <TypeHeader :title="t('compos.text_content')" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="textDialog">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <CompLayerShow :context="context" v-if="isTextShow" @close-dialog="closeLayerShowPopup" right="250px"
            :add-type="VariableType.Status" :width="260" :title="t('compos.text_content')" :dialog_posi="dialog_posi">
            <template #layer>
                <SelectLayerInput :title="t('compos.select_layer')" :add-type="VariableType.Text"
                    :context="props.context" :placeholder="t('compos.place_select_layer')"></SelectLayerInput>
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