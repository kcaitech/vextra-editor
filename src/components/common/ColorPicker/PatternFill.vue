<script setup lang="ts">
import PatternToolBit from "@/components/common/ColorPicker/PatternToolBit.vue";
import { insert_imgs, modify_imgs, SVGReader } from "@/utils/content";
import { after_import } from "@/utils/clipboard";
import { ref } from "vue";
import { Context } from "@/context";
import PatternMode from "./PatternMode.vue"
import { ImageScaleMode } from "@kcdesign/data";
import { ImgFrame } from "@/context/atrribute";

const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
const picker = ref<HTMLInputElement>();

const props = defineProps<{
    context: Context
    scale: number | undefined
    imageScaleMode: ImageScaleMode | undefined
    image: string | undefined
}>()
const emits = defineEmits<{
    (e: 'changeMode', mode: ImageScaleMode): void;
    (e: 'setImageRef', ref: string, origin: ImgFrame): void;
}>();
function change(e: Event) {
    if (e.target) {
        const files = (e.target as HTMLInputElement).files;
        if (!files?.length) {
            return;
        }
        const file = files[0];
        const frame: { width: number, height: number } = { width: 100, height: 100 };
        const reader = new FileReader();
        let buff: any, base64: any;
        const img = new Image();
        img.onload = function () {
            frame.width = img.width;
            frame.height = img.height;
            const origin = { width: img.width, height: img.height }
            reader.onload = function (evt) {
                if (!evt.target?.result) {
                    return;
                }
                buff = evt.target.result;
                if (!buff) {
                    return;
                }
                reader.onload = function (evt) {
                    if (!evt.target?.result) {
                        return;
                    }
                    base64 = evt.target.result;
                    if (!(buff && base64)) {
                        return;
                    }
                    const media = { name: file.name, frame, buff: new Uint8Array(buff), base64 };
                    const container: any = {};
                    modify_imgs(props.context, [media], container);
                    const keys = Array.from(Object.keys(container) || []) as string[];
                    changeImageRef(keys[0], origin);
                    after_import(props.context, container);
                    if (picker.value) (picker.value as HTMLInputElement).value = '';
                }
                reader.readAsDataURL(file);
            }
            reader.readAsArrayBuffer(file);
        }
        img.src = URL.createObjectURL(file);
    }
}
function selectImage() {
    const filepicker = document.getElementById('fillfilepicker');
    if (filepicker) {
        filepicker.click();
    }
}

const changeImageRef = (urlRef: string, origin: ImgFrame) => {
    emits('setImageRef', urlRef, origin);
}

</script>
<template>
    <div class="container">
        <div class="header">
            <PatternMode :context="context" :scale="scale" :imageScaleMode="imageScaleMode"
                @changeMode="(mode) => emits('changeMode', mode)"></PatternMode>
        </div>
        <div class="body">
            <div class="mask" @click="selectImage">
                <img :src="image" alt="">
                <div class="pic-picker">
                    <div> {{ '选择图片' }}</div>
                </div>
                <input type="file" ref="picker" :accept="accept" :multiple="false" id="fillfilepicker"
                    @change.stop="(e: Event) => { change(e) }" />
            </div>
        </div>
        <div class="tool">
            <pattern-tool-bit type="曝光" :value="0" />
            <pattern-tool-bit type="对比度" :value="0" />
            <pattern-tool-bit type="饱和度" :value="60" />
            <pattern-tool-bit type="色温" :value="-60" />
            <pattern-tool-bit type="色调" :value="100" />
            <pattern-tool-bit type="色相" :value="100" />
        </div>
    </div>


</template>
<style scoped lang="scss">
.container {
    width: 100%;

    .header {
        height: 32px;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 12px;
        box-sizing: border-box;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .body {
        padding: 0 12px;
        width: 100%;
        height: 170px;
        box-sizing: border-box;

        .mask {
            background: conic-gradient(#eee 25%, white 0deg 50%, #eee 0deg 75%, white 0deg) 0 / 20px 20px;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            box-sizing: border-box;

            img {
                position: absolute;
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }

            >.pic-picker {
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;

                div {
                    transition: 0.2s;
                    width: 100px;
                    height: 32px;
                    text-align: center;
                    line-height: 32px;
                    visibility: hidden;
                    color: #fff;
                    border: 1px solid #fff;
                    border-radius: 8px;
                    background-color: rgba(255, 255, 255, 0.2);
                }
            }

            #fillfilepicker {
                display: none;
            }
        }

        .mask:hover {
            >.pic-picker {
                div {
                    visibility: visible;
                }

                background-color: rgba(0, 0, 0, 0.15);
            }
        }
    }

    .tool {
        width: 100%;
        padding: 12px;
        box-sizing: border-box;
    }
}
</style>