<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
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
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { BlurContext, BlurContextMgr } from "@/components/Document/Attribute/Blur/ctx";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import CheckBox from "@/components/common/CheckBox.vue";
import SelectBanana from "@/components/common/Select/SelectBanana.vue";

type Props = {
    context: Context;
    shapes: ShapeView[];
    selectionChange: number;
    trigger: any[];
}

const props = defineProps<Props>();
const {t} = useI18n();
const blurInfo = ref<Blur>();
const mixed = ref<boolean>(false);
const blurMask = ref<BlurMask>();

const blurCtx = ref<BlurContext>({
    mixed: false,
    blur: undefined,
    mask: undefined,
    maskInfo: undefined
})
const blurCtxMgr = new BlurContextMgr(props.context, blurCtx.value as BlurContext);
const cloverVisible = computed<boolean>(() => !(blurCtx.value.mask || blurCtx.value.mixed));
const blurLibStatus = reactive<ElementStatus>({id: '#blur-lib-panel', visible: false});
const blurPanelStatusMgr = new ElementManager(
    props.context,
    blurLibStatus,
    {whiteList: ['.blur-container', '.blur-lib-panel', '.mask-port-wrapper']}
);
blurCtxMgr.catchPanel(blurPanelStatusMgr);

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
        if (e.classList.contains('mask-port-wrapper')) {
            e && blurPanelStatusMgr.showBy(e, {once: {offsetLeft: -4, offsetTop: 42}});
            break;
        }
        if (e.classList.contains('blur-panel')) {
            e && blurPanelStatusMgr.showBy(e, {once: {offsetLeft: 4, offsetTop: 42}});
            break;
        }
        e = e.parentElement;
    }
}

const closePanel = () => {
    blurPanelStatusMgr.close();
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => blurCtxMgr.update()),
    watch(() => props.trigger, v => v?.includes('style') && blurCtxMgr.update())
]
onMounted(() => {
    blurCtxMgr.update();
});
onUnmounted(() => {
    watchList.forEach(stop => stop());
    blurPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="blur-panel" ref="blurPanelTrigger">
        <TypeHeader :title="t('blur.blur')" @click="first" :active="!!blurInfo">
            <template v-if="!blurCtx.mask" #tool>
                <div v-if="cloverVisible" class="clover" @click="showBlurPanel($event)">
                    <SvgIcon :icon="style_icon"/>
                </div>
                <div v-if="!blurCtx.blur || blurCtx.mixed" class="add" @click.stop="addBlur">
                    <SvgIcon :icon="add_icon"/>
                </div>
            </template>
        </TypeHeader>
        <div v-if="blurCtx.mixed" class="tips-wrapper">{{ t('attr.mixed_lang') }}</div>
        <MaskPort v-else-if="blurCtx.maskInfo" @unbind="delBlurMask" @delete="delStyleBlur">
            <div class="desc" @click="showBlurPanel($event)">
                <div class="effect"/>
                <div>{{ blurCtx.maskInfo.name }}</div>
            </div>
        </MaskPort>
        <div v-else-if="blurCtx.blur" class="blur-container">
            <div class="blur">
                <CheckBox :check="blurCtx.blur.enable" style="flex: 0 0 14px;"
                          @change="toggleVisible"/>
                <div class="blur-type">
                    <!--                    <BlurTypeSelect :context="context" :blur="blurInfo" :shapes="shapes"/>-->
                    <SelectBanana context="" options="" value=""/>
                </div>
                <div class="detail">
                    <BlurDetail :context="context" :blur="blurInfo" :shapes="shapes"/>
                </div>
                <div class="delete" @click="deleteBlur">
                    <SvgIcon :icon="delete_icon"/>
                </div>
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

    .tips-wrapper {
        padding: 12px 0;
        color: #737373;
        text-align: center;
        font-size: var(--font-default-fontsize);
    }

    .add, .clover {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        > img {
            width: 16px;
            height: 16px;
        }
    }

    .clover img {
        padding: 2px;
        box-sizing: border-box;
    }

    .clover:hover {
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

                > img {
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

                > img {
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

    .desc {
        flex: 1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px;

        .effect {
            width: 16px;
            height: 16px;
            background-color: #fff;
            border: 1px solid #000000e5;
            border-radius: 3px;
            overflow: hidden;
        }

        .span {
            display: inline-block;
            flex: 1;
            width: 32px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>