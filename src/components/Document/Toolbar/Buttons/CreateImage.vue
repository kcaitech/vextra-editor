<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import { Action } from '@/context/workspace';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { onMounted, onUnmounted } from 'vue';
const { t } = useI18n()
const props = defineProps<{
    active: boolean
    context: Context
}>();
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
// const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
const accept = 'image/*';

function key(e: KeyboardEvent) {
    const { shiftKey, ctrlKey, code } = e;
    if (shiftKey && ctrlKey && code === 'KeyK') {
        const filepicker = document.getElementById('filepicker');
        if (filepicker) {
            filepicker.click();
        }
    }
}
async function select() {
    const filepicker = document.getElementById('filepicker');
    if (filepicker) {
        filepicker.click();
    }
}
function get_frame(file: any) {
    const frame = { width: 100, height: 100 };
    const img = new Image();
    img.onload = function () {
        frame.width = img.width;
        frame.height = img.height;
    }
    img.src = URL.createObjectURL(file);
    console.log("宽度: " + frame.width);
    console.log("高度: " + frame.height);
}
function get_media(file: any) {
    const media = { name: 'file', buff: new Uint8Array([]), base64: '' };
    const reader = new FileReader();
    let buff: any, base64: any;
    reader.readAsArrayBuffer(file);
    reader.onload = function (evt) {
        if (evt.target?.result) {
            buff = evt.target.result;
            if (buff) {
                reader.readAsDataURL(file);
                reader.onload = function (evt) {
                    if (evt.target?.result) {
                        base64 = evt.target.result;
                        if (buff && base64) {
                            media.name = file.name;
                            media.buff = new Uint8Array(buff);
                            media.base64 = base64;
                        }
                    }
                }
            }
        }
    }
}
function change(e: Event) {
    if (e.target) {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length === 1) {
            const file = files[0];
            // get_frame(file);
            const reader = new FileReader();
            let buff: any, base64: any;
            reader.readAsArrayBuffer(file);
            reader.onload = function (evt) {
                if (evt.target?.result) {
                    buff = evt.target.result;
                    if (buff) {
                        reader.readAsDataURL(file);
                        reader.onload = function (evt) {
                            if (evt.target?.result) {
                                base64 = evt.target.result;
                                if (buff && base64) {
                                    const media = { name: file.name, buff: new Uint8Array(buff), base64 };
                                    props.context.workspace.setImage(media);
                                    emit('select', Action.AddImage);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
onMounted(() => {
    document.addEventListener('keydown', key);
})
onUnmounted(() => {
    document.removeEventListener('keydown', key);
})
</script>
<template>
    <el-tooltip class="box-item" effect="dark" :content="`${t('home.picture')} &nbsp;&nbsp; Shift+Ctrl+K`"
        placement="bottom" :show-after="500" :offset="10" :hide-after="0">
        <ToolButton ref="button" @click="select" :selected="props.active">
            <div class="svg-container">
                <svg-icon icon-class="picture"></svg-icon>
            </div>
        </ToolButton>
    </el-tooltip>
    <input type="file" :accept="accept" :multiple="false" id="filepicker" @change="(e: Event) => { change(e) }">
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

#filepicker {
    display: none;
}
</style>