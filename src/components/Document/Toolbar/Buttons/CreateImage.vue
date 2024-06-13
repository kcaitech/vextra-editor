<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { onMounted, onUnmounted, ref } from 'vue';
import { string_by_sys } from '@/utils/common';
import Tooltip from '@/components/common/Tooltip.vue';
import { insert_imgs, Media, SVGReader } from '@/utils/content';
import { Tool } from '@/context/tool';
import { after_import } from '@/utils/clipboard';
const { t } = useI18n();
interface Porps {
    params: {
        active: boolean
    },
    context: Context
}
const props = defineProps<Porps>();
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
const picker = ref<HTMLInputElement>();

function tool_watcher(t: number) {
    if (t === Tool.SELECT_IMAGE) {
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
                if (file.type === "image/svg+xml") {
                    SVGReader(props.context, file);
                    return;
                }
                const frame: { width: number, height: number } = { width: 100, height: 100 };
                const reader = new FileReader();
                let buff: any, base64: any;
                const img = new Image();
                img.onload = function () {
                    frame.width = img.width;
                    frame.height = img.height;
                    reader.onload = function (evt) {
                        if (evt.target?.result) {
                            buff = evt.target.result;
                            if (buff) {
                                reader.onload = function (evt) {
                                    if (evt.target?.result) {
                                        base64 = evt.target.result;
                                        if (buff && base64) {
                                            const media = { name: file.name, frame, buff: new Uint8Array(buff), base64 };
                                            const container: any = {};
                                            insert_imgs(props.context, t, [media], container);
                                            after_import(props.context, container);
                                            if (picker.value) (picker.value as HTMLInputElement).value = '';
                                        }
                                    }
                                }
                                reader.readAsDataURL(file);
                            }
                        }
                    }
                    reader.readAsArrayBuffer(file);
                }
                img.src = URL.createObjectURL(file);
            } else if (files.length > 1) {
                props.context.workspace.setFreezeStatus(true);
                multiple(files);
            }
        }
    }
}
function multiple(files: any) {
    const media: Media[] = [];
    const len = files.length;
    let index = 0;
    const container: any = {};
    try {
        iteration();
    } catch (error) {
        console.log(error);
        props.context.workspace.setFreezeStatus(false);
    }

    // 挨个加载，遇到错误资源跳一步
    function iteration() {
        const file = files[index];
        const reader = new FileReader();
        let buff: any, base64: any;
        const frame: { width: number, height: number } = { width: 100, height: 100 };
        const img = new Image();
        img.onload = function () {
            frame.width = img.width;
            frame.height = img.height;
            reader.onload = function (evt) {
                if (evt.target?.result) {
                    buff = evt.target.result;
                    if (buff) {
                        reader.onload = function (evt) {
                            if (evt.target?.result) {
                                base64 = evt.target.result;
                                if (buff && base64) {
                                    if (index < len - 1) {
                                        media.push({ name: file.name, frame, buff: new Uint8Array(buff), base64 });
                                        index++;
                                        iteration();
                                    } else {
                                        media.push({ name: file.name, frame, buff: new Uint8Array(buff), base64 });
                                        insert_imgs(props.context, t, media, container);
                                        after_import(props.context, container);
                                        if (picker.value) {
                                            (picker.value as HTMLInputElement).value = '';
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
                        reader.readAsDataURL(file);
                    } else {
                        index++;
                        iteration();
                    }
                } else {
                    index++;
                    iteration();
                }
            }
            reader.readAsArrayBuffer(file);
        }
        img.src = URL.createObjectURL(file);
    }
}
onMounted(() => {
    props.context.tool.watch(tool_watcher);
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
})
</script>
<template>
    <Tooltip :content="string_by_sys(`${t('home.picture')} &nbsp;&nbsp; Shift Ctrl K`)">
        <ToolButton ref="button" @click="select" :selected="props.params.active" style="width: 32px">
            <div class="svg-container">
                <svg-icon icon-class="picture"></svg-icon>
            </div>
        </ToolButton>
    </Tooltip>
    <input type="file" ref="picker" :accept="accept" :multiple="true" id="filepicker" @change="(e: Event) => { change(e) }">
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

    >svg {
        width: 18px;
        height: 18px;
    }
}

#filepicker {
    display: none;
}
</style>