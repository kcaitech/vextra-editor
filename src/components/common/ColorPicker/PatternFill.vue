<script setup lang="ts">
import PatternToolBit from "@/components/common/ColorPicker/PatternToolBit.vue";
import { insert_imgs, SVGReader } from "@/utils/content";
import { after_import } from "@/utils/clipboard";
import { ref } from "vue";
import { Context } from "@/context";

const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
const picker = ref<HTMLInputElement>();

const props = defineProps<{ context: Context }>()

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
                    // insert_imgs(props.context, t, [media], container);
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
    const filepicker = document.getElementById('filepicker');
    if (filepicker) {
        filepicker.click();
    }
}
</script>
<template>
    <div class="container">
        <div class="header">
            {{ '充满' }}
        </div>
        <div class="body">
            <div class="mask" @click="selectImage">
                <div class="pic-picker"> {{ '选择图片' }}</div>
                <input type="file" ref="picker" :accept="accept" :multiple="false" id="filePicker"
                    @change="(e: Event) => { change(e) }" />
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
        padding: 12px 10px;
        box-sizing: border-box;
        justify-content: space-between;
    }

    .body {
        width: 100%;
        height: 160px;
        background: conic-gradient(#eee 25%, white 0deg 50%, #eee 0deg 75%, white 0deg) 0 / 20px 20px;

        .mask {
            width: 100%;
            height: 100%;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;

            background-color: transparent;

            >.pic-picker {
                width: 100px;
                height: 32px;
                text-align: center;
                line-height: 32px;
                visibility: hidden;
                color: #fff;
                border: 1px solid #fff;
                border-radius: 8px;
            }

            #filePicker {
                display: none;
            }
        }

        .mask:hover {
            background-color: rgba(0, 0, 0, 0.45);

            >.pic-picker {
                visibility: visible;
            }
        }
    }

    .tool {
        width: 100%;
        padding: 12px 10px;
        box-sizing: border-box;
    }
}
</style>