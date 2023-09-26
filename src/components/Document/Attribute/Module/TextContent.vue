<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick } from 'vue';
import CompLayerShow from '../PopoverMenu/CompLayerShow.vue';
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
        <TypeHeader :title="'文本内容'" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="textDialog">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <CompLayerShow :context="context" v-if="isTextShow" @close-dialog="closeLayerShowPopup" right="250px" :add-type="''" :width="260" :title="`文本内容`" :dialog_posi="dialog_posi"></CompLayerShow>
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
}</style>