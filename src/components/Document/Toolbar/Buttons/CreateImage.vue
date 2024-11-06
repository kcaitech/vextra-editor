<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref } from 'vue';
import { string_by_sys } from '@/utils/common';
import Tooltip from '@/components/common/Tooltip.vue';
import { ImageLoader } from "@/imageLoader";

const { t } = useI18n();
const props = defineProps<{
    params: {
        active: boolean
    },
    context: Context
}>();
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml';
const picker = ref<HTMLInputElement>();

async function select() {
    picker.value?.click();
}

function change(e: Event) {
    if (!e.target) return;
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    const loader = new ImageLoader(props.context);
    loader.insertImageByPackages(files, true);
    if (picker.value) (picker.value as HTMLInputElement).value = '';
}
</script>
<template>
<Tooltip :content="string_by_sys(`${t('home.picture')} &nbsp;&nbsp; Shift Ctrl K`)">
    <ToolButton ref="button" @click="select" :selected="props.params.active">
        <div class="svg-container">
            <svg-icon icon-class="picture"/>
        </div>
    </ToolButton>
</Tooltip>
<input type="file" ref="picker" :accept="accept" :multiple="true" id="filepicker"
       @change="(e: Event) => { change(e) }"/>
</template>
<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

    > svg {
        width: 18px;
        height: 18px;
    }
}

#filepicker {
    display: none;
}
</style>