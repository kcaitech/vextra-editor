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
const isLayerShow = ref(false);
const closeLayerShowPopup = () => {
    isLayerShow.value = false
}
const layerIsShow = () => {
    isLayerShow.value = true
}
</script>
<template>
    <div style="position: relative;">
        <TypeHeader :title="'图层是否显示'" class="mt-24">
            <template #tool>
                <div class="edit-comps">
                    <div class="edit_svg" @click="layerIsShow">
                        <svg-icon icon-class="relevance"></svg-icon>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <CompLayerShow :context="context" v-if="isLayerShow" @close-dialog="closeLayerShowPopup" right="250px" :add-type="'Show'" :width="260" :title="`图层是否显示`"></CompLayerShow>
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