<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { ShapeView, Blur, Point2D, BlurType, BasicArray, BlurMask } from "@kcdesign/data";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import {
    get_actions_add_blur,
    get_actions_add_mask,
    get_actions_blur_delete,
    get_actions_blur_enabled,
    get_actions_blur_mask,
    get_actions_blur_unify,
    get_blur
} from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';
import BlurDetail from "./BlurDetail.vue";
import BlurTypeSelect from "./BlurTypeSelect.vue";
import BlurStyle from '@/components/Document/Attribute/Blur/Lib/BlurStyle.vue';
import { getShapesForStyle } from '@/utils/style';
import SvgIcon from '@/components/common/SvgIcon.vue';
import add_icon from '@/assets/icons/svg/add.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import style_icon from '@/assets/icons/svg/styles.svg';
import unbind_icon from '@/assets/icons/svg/unbind.svg';
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";

type Props = {
    context: Context
    shapes: ShapeView[]
    selectionChange: number;
    trigger: any[];
}

const props = defineProps<Props>();
const { t } = useI18n();
const blurInfo = ref<Blur>();
const mixed = ref<boolean>(false);
const reflush = ref<number>(0);
const mask = ref<boolean>(false);
const blurMask = ref<BlurMask>();

const blurLibStatus = reactive<ElementStatus>({id: '#blur-lib-panel', visible: false});
const blurPanelStatusMgr = new ElementManager(
    props.context,
    blurLibStatus,
    {
        offsetLeft: -250,
        whiteList: ['.blur-container', '.blur-lib-panel', '.blur-left']
    }
);

function updateData() {
    mixed.value = false;
    mask.value = false;
    blurInfo.value = undefined;
    blurMask.value = undefined;
    const len = props.shapes.length;
    if (len === 1) {
        const shape = props.shapes[0];
        if (shape.style.blursMask) {
            const id = props.shapes[0].style.blursMask
            if (!id) return
            const libs = props.shapes[0].style.getStylesMgr()
            blurMask.value = libs?.getSync(id) as BlurMask
            blurInfo.value = blurMask.value.blur
            return mask.value = true;
        }
        blurInfo.value = shape.blur;
    } else if (len > 1) {
        const blur = get_blur(props.shapes);
        if (blur === 'mixed') {
            mixed.value = true;
        } else if (blur === 'mask') {
            const id = props.shapes[0].style.blursMask;
            if (!id) return;
            const libs = props.shapes[0].style.getStylesMgr();
            const blur = libs?.getSync(id) as BlurMask;
            blurMask.value = blur;
            blurInfo.value = blur.blur;
            mask.value = true;
        } else {
            blurInfo.value = blur;
        }
    }

    reflush.value++;
}

function addBlur(): void {
    const len = props.shapes.length;
    if (len < 1) return;
    const blur = new Blur(new BasicArray(), true, new Point2D(0, 0), 10, BlurType.Gaussian);
    const page = props.context.selection.selectedPage!;
    const mask = props.shapes.some(s => s.style.blursMask)
    const editor = props.context.editor4Page(page);
    if (mixed.value) {
        if (mask) {
            const s = props.shapes.findLast(i => i.style.blursMask)
            const id = s?.style.blursMask as string
            const actions = get_actions_add_mask(props.shapes, id);
            editor.shapesSetBlurMask(actions);
        } else {
            const actions = get_actions_blur_unify(props.shapes);
            editor.shapesBlurUnify(actions);
        }
    } else {
        const editor = props.context.editor4Page(page);
        editor.shapesAddBlur(get_actions_add_blur(props.shapes, blur));
    }
    hidden_selection(props.context);
}

function first() {
    if (!blurInfo.value && !mixed.value) addBlur();
}

function deleteBlur() {
    const len = props.shapes.length;
    if (len < 1) return;
    const actions = get_actions_blur_delete(props.shapes);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.shapeDeleteBlur(actions);
    }
    hidden_selection(props.context);
}

function toggleVisible() {
    const len = props.shapes.length;
    if (len < 1) return;
    const isEnabled = !blurInfo.value!.isEnabled;
    const actions = get_actions_blur_enabled(props.shapes, isEnabled);
    const editor = props.context.editor4Page(props.context.selection.selectedPage!);
    editor.setShapeBlurEnabled(actions);
    hidden_selection(props.context);
}

const delBlurMask = () => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_blur_mask(shapes)
    const editor = props.context.editor4Page(page);
    editor.shapesDelBlurMask(actions);
}

const delStyleBlur = () => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_blur_mask(shapes)
    const editor = props.context.editor4Page(page);
    editor.shapesDelStyleBlur(actions);
}

const showBlurPanel = (event: MouseEvent) => {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('blur-left')) {
            e && blurPanelStatusMgr.showBy(e, {once: {offsetLeft: -264}});
            break;
        }
        if (e.classList.contains('blur-panel')) {
            e && blurPanelStatusMgr.showBy(e, {once: {offsetLeft: -256}});
            break;
        }
        e = e.parentElement;
    }
}

const closePanel = () => {
    blurPanelStatusMgr.close();
}

const stop1 = watch(() => props.trigger, v => v?.includes('style') && updateData());
const stop2 = watch(() => props.selectionChange, updateData);
onMounted(updateData);
onUnmounted(() => {
    stop1();
    stop2();
    blurPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="blur-panel" ref="blurPanelTrigger">
        <TypeHeader :title="t('blur.blur')" @click="first" :active="!!blurInfo">
            <template v-if="!mask" #tool>
                <div v-if="!mixed" class="blur-style" @click="showBlurPanel($event)">
                    <SvgIcon :icon="style_icon"/>
                </div>
                <div v-if="!blurInfo || mixed" class="add" @click.stop="addBlur">
                    <SvgIcon :icon="add_icon"/>
                </div>
            </template>
        </TypeHeader>
        <div v-if="mixed && !mask" class="tips-wrap">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div v-if="!mixed && blurInfo && !mask" class="blur-container">
            <div class="blur">
                <div :class="blurInfo.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible()">
                    <SvgIcon v-if="blurInfo.isEnabled" :icon="select_icon" />
                </div>
                <div class="blur-type">
                    <BlurTypeSelect :context="context" :blur="blurInfo" :shapes="shapes" :reflush="reflush" />
                </div>
                <div class="detail">
                    <BlurDetail :context="context" :blur="blurInfo" :shapes="shapes" :reflush="reflush" />
                </div>
                <div class="delete" @click="deleteBlur">
                    <SvgIcon :icon="delete_icon" />
                </div>
            </div>
        </div>
        <div v-if="mask" class="blur-mask">
            <div class="info">
                <div class="blur-left" @click="showBlurPanel($event)">
                    <div class="effect"/>
                    <div class="name">{{ blurMask!.name }}</div>
                </div>
                <div class="unbind" @click="delBlurMask">
                    <SvgIcon :icon="unbind_icon" />
                </div>
            </div>
            <div class="delete-style" @click="delStyleBlur">
                <SvgIcon :icon="delete_icon" />
            </div>
        </div>
        <BlurStyle v-if="blurLibStatus.visible" :context="props.context" :shapes="props.shapes" @close="closePanel"
                   :id="blurMask?.id"/>
    </div>
</template>
<style scoped lang="scss">
.blur-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .add,
    .blur-style {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        >img {
            width: 16px;
            height: 16px;
        }
    }

    .blur-style img {
        padding: 2px;
        box-sizing: border-box;
    }

    .blur-style:hover {
        background-color: #F5F5F5;
    }

    .add:hover {
        background-color: #F5F5F5;
    }

    .blur-container {
        padding: 6px 0;

        .blur {
            height: 30px;
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;
            margin-top: 4px;

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
                margin-right: 5px;

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
                margin-right: 5px
            }

            .blur-type {
                flex: 1;
                height: 100%;
                margin-right: 5px;
                box-sizing: border-box;
            }

            .delete {
                flex: 0 0 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 28px;
                height: 28px;
                border-radius: var(--default-radius);
                transition: .2s;

                >img {
                    width: 16px;
                    height: 16px;
                }
            }

            .detail {
                flex: 0 0 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 28px;
                height: 28px;
            }

            .delete:hover {
                background-color: #F5F5F5;
            }
        }
    }

    .blur-mask {
        display: flex;
        height: 32px;
        border-radius: 6px;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        gap: 8px;

        .info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px;
            overflow: hidden;
            background-color: #f4f5f5;
            height: 100%;

            .blur-left {
                flex: 1;
                display: flex;
                align-items: center;
                background-color: #F5F5F5;
                height: 100%;

                &:hover {
                    background-color: #e5e5e5;
                }

                .effect {
                    width: 16px;
                    height: 16px;
                    background-color: #fff;
                    border: 1px solid #000000e5;
                    border-radius: 3px;
                    overflow: hidden;
                    margin: 0 8px;
                }
            }

            .unbind {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 32px;

                >img {
                    width: 16px;
                    height: 16px;
                }
            }

            .unbind:hover {
                background-color: #e5e5e5;
            }
        }

        .delete-style {
            flex: 0 0 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 28px;
            border-radius: var(--default-radius);
            overflow: hidden;

            >img {
                width: 16px;
                height: 16px;
            }
        }

        .delete-style:hover {
            background-color: #F5F5F5;
        }
    }

    .tips-wrap {
        padding: 12px 0;

        .mixed-tips {
            display: block;
            width: 218px;
            height: 14px;
            text-align: center;
            font-size: var(--font-default-fontsize);
            color: #737373;
        }
    }
}
</style>