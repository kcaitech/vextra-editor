<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import { Action } from '@/context/workspace';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
const { t } = useI18n()
const props = defineProps<{
    active: boolean
    context: Context
}>();
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
const pickerOpts = {
    types: [
        {
            description: "Images",
            accept: {
                "image/*": [".png", ".jpeg", ".jpg"],
            },
        },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
};
let fileHandle;
async function getFile() {
    [fileHandle] = await (window as any).showOpenFilePicker(pickerOpts);
    fileHandle.getFile().then((res: any) => {
        const reader = new FileReader();
        let buff: any, base64: any;
        reader.readAsArrayBuffer(res);
        reader.onload = function (evt) {
            if (evt.target?.result) {
                buff = evt.target.result;
                if (buff) {
                    reader.readAsDataURL(res);
                    reader.onload = function (evt) {
                        if (evt.target?.result) {
                            base64 = evt.target.result;
                            if (buff && base64) {
                                const media = { buff, base64 };
                                props.context.workspace.setImage(media);
                            }
                        }
                    };
                }
            }
        }
    })
}
function select(action: Action) {
    getFile();
    emit('select', action);
}
</script>
<template>
    <el-tooltip class="box-item" effect="dark" :content="`${t('home.picture')} &nbsp;&nbsp; Shift+Ctrl+K`"
        placement="bottom" :show-after="500" :offset="10" :hide-after="0">
        <ToolButton ref="button" @click="() => { select(Action.AddImage) }" :selected="props.active">
            <div class="svg-container">
                <svg-icon icon-class="picture"></svg-icon>
            </div>
        </ToolButton>
    </el-tooltip>
</template>
<style scoped lang="scss">
.svg-container {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;

    >svg {
        width: 15px;
        height: 15px;
    }
}
</style>