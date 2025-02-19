<template>
    <div id="modify-blur-panel" class="editor-style">
        <div class="header">
            <div class="title">{{ t('stylelib.editor_blur') }}</div>
            <div class="close" @click.stop="emits('close')">
                <SvgIcon :icon="close_icon" />
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">{{ t('stylelib.name') }}</label>
                <input v-focus type="text" id="name" v-model="name" @keydown.esc="props.context.escstack.execute()"
                    @change="setSheetName">
            </div>
            <div class="des">
                <label for="des">{{ t('stylelib.description') }}</label>
                <input type="text" id="des" v-model="des" @keydown.esc="props.context.escstack.execute()"
                    @change="setSheetDes">
            </div>
        </div>
        <div class="effect">
            <div class="create-effect">
                <div class="title">{{ t('stylelib.blur') }}</div>
                <div v-if="!blurInfo" class="add">
                    <SvgIcon :icon="add_icon" />
                </div>
            </div>
            <div v-if="blurInfo" class="effect-list">
                <div class="item">
                    <div class="show">
                        <div :class="blurInfo.isEnabled ? 'visibility' : 'hidden'" @click.stop="toggleVisible()">
                            <SvgIcon v-if="blurInfo.isEnabled" :icon="select_icon"></SvgIcon>
                        </div>
                    </div>
                    <BlurTypeSelect :context="context" :blur="blurInfo" :shapes="shapes" :entry="'style'"
                        :reflush="reflush" @select="positionSelect" />
                    <BlurDetail :manager="manager" :context="props.context" :blur="(blurInfo as any)" :shapes="props.shapes"
                        @set-blur-saturation="setBlurSaturation" @key-down-saturation="keyDownSaturation"
                        @drag-blur-saturation="dragBlurSaturation" />
                    <div class="delete" :class="{ disable }">
                        <SvgIcon :icon="delete_icon"></SvgIcon>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BlurType, LinearApi, Blur, BlurMask } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { genOptions } from '@/utils/common';
import { computed } from 'vue';
import BlurDetail from "../BlurDetail.vue";
import BlurTypeSelect from "../BlurTypeSelect.vue";
import { FillRenderer } from '../../StyleLib/fillRenderer';
import { BlurHandler } from '@/transform/blur';
import add_icon from '@/assets/icons/svg/add.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import close_icon from '@/assets/icons/svg/close.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    maskid: string
    reder: FillRenderer
}>();

const emits = defineEmits<{
    (e: 'close'): void;
}>()

const { t } = useI18n();
const positionOptionsSource: SelectSource[] = genOptions([
    [BlurType.Gaussian, t(`blur.gaussian`)],
    [BlurType.Background, t(`blur.background`)]
]);
const name = ref<string>();
const des = ref<string>();
const reflush = ref<number>(0);
const blurInfo = ref<Blur>();

const disable = computed(() => !!blurInfo.value);

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
    console.log('mounted');
    
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
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
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

            img {
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

                img {
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

                        >img {
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

                    img {
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
