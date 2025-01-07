<script setup lang="ts">
import PatternToolBit from "@/components/common/ColorPicker/PatternToolBit.vue";
import { modify_imgs } from "@/utils/content";
import { ref, watch } from "vue";
import { Context } from "@/context";
import PatternMode from "./PatternMode.vue"
import { ColorPicker, ImagePack, ImageScaleMode, PaintFilter, PaintFilterType, ShapeType } from "@kcdesign/data";
import { ImgFrame } from "@/context/atrribute";
import { flattenShapes } from "@/utils/cutout";
import { useI18n } from "vue-i18n";
import { ImageLoader } from "@/imageLoader";

const accept = 'image/png, image/jpeg, image/gif, image/svg+xml';
const picker = ref<HTMLInputElement>();

const props = defineProps<{
    context: Context
    scale: number | undefined
    imageScaleMode: ImageScaleMode | undefined
    image: string | undefined
    paintFilter?: PaintFilter
}>()
const emits = defineEmits<{
    (e: 'changeMode', mode: ImageScaleMode): void;
    (e: 'setImageRef', ref: string, origin: ImgFrame, imageMgr: any): void;
    (e: 'changeScale', scale: number): void;
    (e: 'changeRotate'): void;
}>();
let colorEditor: ColorPicker | undefined;
const paint_filter = ref<PaintFilter>();
const t = useI18n().t;

function change(e: Event) {
    if (!e.target) return;
    const files = (e.target as HTMLInputElement).files;
    if (!files?.length) return;
    const file = files[0];
    const imageLoader = new ImageLoader(props.context);
    imageLoader
        .packFile(file, false)
        .then(res => {
            if (!res) return;
            const result = res as ImagePack;
            const { size, buff, base64 } = result;
            const media = { name: file.name || '', frame: result.size, buff, base64 };
            const container: any = {};
            modify_imgs(props.context, [media], container);
            const keys = Array.from(Object.keys(container) || []) as string[];
            changeImageRef(keys[0], size, { buff, base64 });
            const selected = props.context.selection.selectedShapes;
            const upload = selected.map(shape => ({ shape, upload: [{ buff, ref: keys[0] }] }));
            imageLoader.upload(upload)
        });
    if (picker.value) (picker.value as HTMLInputElement).value = '';
}

function selectImage() {
    const filepicker = picker.value;
    if (filepicker) filepicker.click();
}

const changeImageRef = (urlRef: string, origin: ImgFrame, imageMgr: any) => {
    emits('setImageRef', urlRef, origin, imageMgr);
}


const changePaint = (value: number, type: PaintFilterType) => {
    const page = props.context.selection.selectedPage;
    if (!colorEditor) {
        if (!page) return;
        colorEditor = new ColorPicker(props.context.coopRepo, props.context.data, page);
    }
    const locat = props.context.color.locat;
    if (!locat) return;
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const v = (value - 80) * (type === PaintFilterType.Hue ? 2.25 : 1.25);
    colorEditor?.executeImageFilter(shapes, type, v, locat.index);
}

const startChange = (e: MouseEvent) => {
    const page = props.context.selection.selectedPage;
    if (colorEditor || !page) return;
    colorEditor = new ColorPicker(props.context.coopRepo, props.context.data, page);
}
const endChange = () => {
    colorEditor?.commit();
    colorEditor = undefined;
}

watch(() => props.paintFilter, (v) => {
    paint_filter.value = v;
}, { immediate: true, deep: true })

</script>
<template>
<div class="container">
    <div class="header">
        <PatternMode :context="context" :scale="scale" :imageScaleMode="imageScaleMode"
                     @changeMode="(mode) => emits('changeMode', mode)" @changeRotate="emits('changeRotate')"
                     @changeScale="(s) => emits('changeScale', s)"></PatternMode>
    </div>
    <div class="body">
        <div class="mask" @click="selectImage">
            <img :src="image" alt="">
            <div class="pic-picker">
                <div> {{ t('attr.selected_picture') }}</div>
            </div>
            <input type="file" ref="picker" :accept="accept" :multiple="false" id="fillfilepicker"
                   @change.stop="(e: Event) => { change(e) }"/>
        </div>
    </div>
    <div class="tool">
        <pattern-tool-bit :type="t('attr.brightness')" :value="paint_filter?.exposure || 0"
                          @change="(v) => changePaint(v, PaintFilterType.Exposure)" @down="startChange"
                          @onUp="endChange"/>
        <pattern-tool-bit :type="t('attr.contrast')" :value="paint_filter?.contrast || 0"
                          @change="(v) => changePaint(v, PaintFilterType.Contrast)" @down="startChange"
                          @onUp="endChange"/>
        <pattern-tool-bit :type="t('attr.saturation')" :value="paint_filter?.saturation || 0"
                          @change="(v) => changePaint(v, PaintFilterType.Saturation)" @down="startChange"
                          @onUp="endChange"/>
        <pattern-tool-bit :type="t('attr.temperature')" :value="paint_filter?.temperature || 0"
                          @change="(v) => changePaint(v, PaintFilterType.Temperature)" @down="startChange"
                          @onUp="endChange"/>
        <pattern-tool-bit :type="t('attr.tint')" :value="paint_filter?.tint || 0"
                          @change="(v) => changePaint(v, PaintFilterType.Tint)" @down="startChange" @onUp="endChange"/>
        <pattern-tool-bit :type="t('attr.shadow')" :value="paint_filter?.shadow || 0"
                          @change="(v) => changePaint(v, PaintFilterType.Shadow)" @down="startChange"
                          @onUp="endChange"/>
        <pattern-tool-bit :type="t('attr.hue')" :value="(paint_filter?.hue || 0) * (100 / 180)"
                          @change="(v) => changePaint(v, PaintFilterType.Hue)" @down="startChange" @onUp="endChange"/>
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
        height: 190px;
        box-sizing: border-box;

        .mask {
            border: solid 1px #efefef;
            background: conic-gradient(#eee 25%, white 0deg 50%, #eee 0deg 75%, white 0deg) 0 / 15px 15px;
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

            > .pic-picker {
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
                    border-radius: 6px;
                    background-color: rgba(0, 0, 0, 0.2);
                }
            }

            #fillfilepicker {
                display: none;
            }
        }

        .mask:hover {
            > .pic-picker {
                background-color: rgba(0, 0, 0, 0.1);

                div {
                    visibility: visible;
                }
            }
        }
    }

    .tool {
        width: 100%;
        padding: 0 16px 12px 16px;
        box-sizing: border-box;
    }
}
</style>