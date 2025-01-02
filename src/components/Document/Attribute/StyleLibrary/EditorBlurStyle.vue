<template>
    <div class="editor-style" :style="{ top: props.top + 'px', left: props.left + 'px' }">
        <div class="header">
            <div class="title">编辑模糊样式</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input v-focus ref="effectname" type="text" id="name" v-model="name"
                    @keydown.esc="props.context.escstack.execute()" @change="setSheetName">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input ref="effectdes" type="text" id="des" v-model="des"
                    @keydown.esc="props.context.escstack.execute()" @change="setSheetDes">
            </div>
        </div>
        <div class="effect">
            <div class="create-effect">
                <div class="title">特效</div>
                <div v-if="!blurInfo" class="add">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </div>
            <div v-if="blurInfo" class="effect-list">
                <div class="item">
                    <div class="show">
                        <div :class="blurInfo.isEnabled ? 'visibility' : 'hidden'" @click.stop="toggleVisible()">
                            <svg-icon v-if="blurInfo.isEnabled" icon-class="select"></svg-icon>
                        </div>
                    </div>
                    <BlurTypeSelect :context="context" :blur="blurInfo" :shapes="shapes" :entry="'style'"
                        :reflush="reflush" @select="positionSelect" />
                    <BlurDetail :context="props.context" :blur="blurInfo" :shapes="props.shapes" :entry="'style'"
                        @set-blur-saturation="setBlurSaturation" @key-down-saturation="keyDownSaturation"
                        @drag-blur-saturation="dragBlurSaturation" />
                    <div class="delete" :class="{ disable }">
                        <svg-icon icon-class="delete"></svg-icon>
                    </div>
                </div>
            </div>
        </div>

    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BlurType, LinearApi, Blur, BlurMask } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { genOptions } from '@/utils/common';
import { computed } from 'vue';
import BlurDetail from "../Blur/BlurDetail.vue";
import BlurTypeSelect from "../Blur/BlurTypeSelect.vue";
import { FillRenderer } from './fillRenderer';
import { BlurHandler } from '@/transform/blur';



const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    top: number;
    left: number
    maskid: string
    reder: FillRenderer
}>();

const emits = defineEmits<{
    (e: 'close'): void;
}>()

const { t } = useI18n();
const positonOptionsSource: SelectSource[] = genOptions([
    [BlurType.Gaussian, t(`blur.gaussian`)],
    [BlurType.Background, t(`blur.background`)]
]);
const effectname = ref<HTMLInputElement>()
const effectdes = ref<HTMLInputElement>()
const name = ref<string>();
const des = ref<string>();
const reflush = ref<number>(0);
const blurInfo = ref<Blur>();

const disable = computed(() => {
    return blurInfo.value ? true : false
})

function dragBlurSaturation(fn: BlurHandler, value: number) {
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as BlurMask
    fn.executeBlurMaskSaturation(mask.sheet, mask.id, value)
}

function keyDownSaturation(fn: LinearApi, value: number) {
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as BlurMask
    fn.modifyBlurMaskBlurSaturation(mask.sheet, mask.id, value)
}

function setBlurSaturation(value: number) {
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as BlurMask
    const editor = props.context.editor4Doc()
    editor.modifyBlurMaskBlurSaturation(mask.sheet, mask.id, value)
}

function positionSelect(type: BlurType) {
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as BlurMask
    const editor = props.context.editor4Doc()
    editor.modifyBlurMaskBlurType(mask.sheet, mask.id, type)
}

const toggleVisible = () => {
   
    
    const mask = props.reder.currentTarget(props.maskid) as BlurMask
    const editor = props.context.editor4Doc()
    if (!props.maskid) return
    const value = !mask.blur.isEnabled;

    console.log('111111',mask,value,editor);
    editor.modifyBlurMaskBlurEnabled(mask.sheet, mask.id, value)

}

const setSheetName = () => {
    const mask = props.reder.currentTarget(props.maskid) as BlurMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleName(mask.sheet, mask.id, name.value)
}

const setSheetDes = () => {
    const mask = props.reder.currentTarget(props.maskid) as BlurMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleDescription(mask.sheet, mask.id, des.value)
}

const update = () => {
    blurInfo.value = undefined;
    if (props.reder && props.maskid) {
        const mask = props.reder.currentTarget(props.maskid) as BlurMask;
        name.value = mask.name ?? '模糊样式';
        des.value = mask.description ?? '';
        blurInfo.value = mask.blur;
    }
    reflush.value++;
}

watch(() => props.maskid, () => {
    update();
})

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib') {
        update();
    }
}

onMounted(() => {
    update();
    props.context.data.watch(stylelib_watcher)
})

onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher)
})


</script>
<style lang="scss" scoped>
.disable {
    pointer-events: none;
    opacity: 0.4;
}

.editor-style {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .close {
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            svg {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
                /* margin-top: 1px; */
                box-sizing: border-box;
            }
        }
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .name,
        .des {
            display: flex;
            align-items: center;
            height: 32px;
            gap: 8px;

            input {
                flex: 1;
                outline: none;
                font-size: 12px;
                padding: 10px 8px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid transparent;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878f5;
                }
            }
        }
    }

    .effect {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        margin-bottom: 8px;
        box-sizing: border-box;

        .create-effect {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;

            .add {
                width: 28px;
                height: 28px;
                display: flex;
                border-radius: 4px;

                &:hover {
                    background-color: #F5F5F5;
                }

                svg {
                    width: 16px;
                    height: 16px;
                    margin: auto;
                }
            }
        }

        .effect-list {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .item {
                display: flex;
                align-items: center;
                height: 32px;
                gap: 8px;

                .show {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;

                    .visibility {
                        flex: 0 0 14px;
                        width: 14px;
                        height: 14px;
                        background-color: var(--active-color);
                        box-sizing: border-box;
                        color: #ffffff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: 4px;

                        >svg {
                            width: 60%;
                            height: 60%;
                        }
                    }

                    .hidden {
                        flex: 0 0 14px;
                        width: 14px;
                        height: 14px;
                        background: #FFFFFF;
                        border-radius: 4px;
                        border: 1px solid #EBEBEB;
                        box-sizing: border-box;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                }


                .select {
                    flex: 1;
                }

                .setting,
                .delete {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    border-radius: 4px;

                    &:hover {
                        background-color: #F5F5F5;
                    }

                    svg {
                        width: 16px;
                        height: 16px;
                        margin: auto;
                    }
                }
            }
        }
    }

    .create-bnt {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        margin-bottom: 12px;
        font-size: 12px;
        width: 100px;
        height: 40px;
        border-radius: 6px;
        background-color: #1878f5;
        color: #fff;

        &:hover {
            background-color: #429AFF;
        }

        &:active {
            background-color: #0A59CF;
        }
    }
}
</style>
