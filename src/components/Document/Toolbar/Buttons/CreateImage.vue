<script setup lang="ts">
import ToolButton from '../ToolButton.vue';
import { Action, Media, WorkSpace } from '@/context/workspace';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { onMounted, onUnmounted } from 'vue';
import { get_frame } from '@/utils/image';
const { t } = useI18n();
interface Porps {
    active: boolean
    context: Context
}
interface Emits {
    (e: "select", action: Action): void;
}
const props = defineProps<Porps>();
const emit = defineEmits<Emits>();
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';

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
function change(e: Event) {
    if (e.target) {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
            if (files.length === 1) {
                const file = files[0];
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
                                        const frame = get_frame(file);
                                        const media = { name: file.name, frame, buff: new Uint8Array(buff), base64 };
                                        props.context.workspace.setImage([media]);
                                        emit('select', Action.AddImage);
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (files.length > 1) {
                props.context.workspace.notify(WorkSpace.FREEZE);
                multiple(files);
            }
        }
    }
}
function multiple(files: any) {
    const media: Media[] = [];
    const len = files.length;
    let index = 0;
    try {
        iteration();
    } catch (error) {
        props.context.workspace.notify(WorkSpace.THAW);
    }
    function iteration() {
        const file = files[index];
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
                                const frame = get_frame(file);
                                if (index < len - 1) {
                                    media.push({ name: file.name, frame, buff: new Uint8Array(buff), base64 });
                                    index++;
                                    iteration();
                                } else {
                                    console.log('medias', media);
                                    props.context.workspace.setImage(media);
                                    props.context.workspace.notify(WorkSpace.THAW);
                                }
                            } else {
                                index++;
                                iteration();
                            }
                        } else {
                            index++;
                            iteration();
                        }
                    }
                } else {
                    index++;
                    iteration();
                }
            } else {
                index++;
                iteration();
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
    <input type="file" :accept="accept" :multiple="true" id="filepicker" @change="(e: Event) => { change(e) }">
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