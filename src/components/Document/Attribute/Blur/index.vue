<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import { ShapeView, ShapeType, Blur, Point2D, BlurType, BasicArray, BlurMask } from "@kcdesign/data";
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
import BlurStyle from '@/components/Document/Attribute/StyleLibrary/BlurStyle.vue';
import { v4 } from 'uuid';
import { getShapesForStyle } from '@/utils/style';
import SvgIcon from '@/components/common/SvgIcon.vue';

type Props = {
    context: Context
    shapes: ShapeView[]
    selectionChange: number;
    trigger: any[];
}

const props = defineProps<Props>();
const { t } = useI18n();
const watchedShapes = new Map();
const blurInfo = ref<Blur>();
const mixed = ref<boolean>(false);
const reflush = ref<number>(0);
const mask = ref<boolean>(false)
const Top = ref<number>(0)
const Left = ref<number>(0)
const showblur = ref<boolean>(false)
const blurMask = ref<BlurMask>()

function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }

    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        for (let i = 0, l = selectedShapes.length; i < l; i++) {
            const v = selectedShapes[i];
            if (v.isVirtualShape) {
                let p = v.parent;
                while (p) {
                    if (p.type === ShapeType.SymbolRef) {
                        needWatchShapes.set(p.id, p);
                        break;
                    }
                    p = p.parent;
                }
            }
            needWatchShapes.set(v.id, v);
        }
    }

    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

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
            return mask.value = true
        }
        blurInfo.value = shape.blur;
    } else if (len > 1) {
        const blur = get_blur(props.shapes);
        if (blur === 'mixed') {
            mixed.value = true;
        } else if (blur === 'mask') {
            const id = props.shapes[0].style.blursMask
            if (!id) return
            const libs = props.shapes[0].style.getStylesMgr();
            const blur = libs?.getSync(id) as BlurMask;
            blurMask.value = blur;
            blurInfo.value = blur.blur;
            mask.value = true
        } else {
            blurInfo.value = blur;
        }
    }
    reflush.value++;
}

function watcher(...args: any[]) {
    if (args.length > 0 && (args.includes('layout'))) updateData();
}

function addBlur(): void {
    const len = props.shapes.length;
    if (len < 1) return;
    const blur = new Blur(new BasicArray(), true, new Point2D(0, 0), 10, BlurType.Gaussian);
    const page = props.context.selection.selectedPage!;
    const mask = props.shapes.some(s => s.style.blursMask !== undefined)
    const editor = props.context.editor4Page(page);
    if (mixed.value) {
        if (mask) {
            const s = props.shapes.findLast(i => i.style.blursMask !== undefined)

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
    const isEnabled = !blurInfo.value!.isEnabled;
    if (len < 1) return;
    const actions = get_actions_blur_enabled(props.shapes, isEnabled);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapeBlurEnabled(actions);
    }
    hidden_selection(props.context);
}

const delblurmask = () => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_blur_mask(shapes)
    const editor = props.context.editor4Page(page);
    editor.shapesDelBlurMask(actions);

}

const delstyleblur = () => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_blur_mask(shapes)
    const editor = props.context.editor4Page(page);
    editor.shapesDelStyleBlur(actions);
}

const openBlurPanel = (e: MouseEvent, id?: string) => {
    let el = e.target as HTMLElement;
    while (el.className !== 'blur-panel') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    showblur.value = !showblur.value
    document.addEventListener('click', checktargetlist)
    props.context.escstack.save(v4(), close);
}

function close() {
    const is_achieve_expected_results = showblur.value;
    showblur.value = false;
    document.removeEventListener('click', checktargetlist)
    return is_achieve_expected_results;
}

function update_by_shapes() {
    watchShapes();
    updateData();
}

function checktargetlist(e: MouseEvent) {
    e.target instanceof Element &&
        !e.target.closest('.shadow-container') &&
        !e.target.closest('.blur-style') &&
        !e.target.closest('.blur-left') &&
        close();
}

const closepanel = () => {
    props.context.escstack.execute()
    showblur.value = false
    document.removeEventListener('click', checktargetlist)
}

// hooks
const stop = watch(() => props.shapes, update_by_shapes);
const stop2 = watch(() => props.selectionChange, updateData); // 监听选区变化
const stop3 = watch(() => props.trigger, v => {
    // 监听选区图层变化
    if (v.length > 0 && (v.includes('layout') || v.includes('blur'))) updateData();
});
onMounted(() => {
    update_by_shapes();
});
onUnmounted(() => {
    stop();
    stop2();
    stop3();
    watchedShapes.forEach(i => i.unwatch(watcher));
    watchedShapes.clear();
});

import add_icon from '@/assets/icons/svg/add.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import style_icon from '@/assets/icons/svg/styles.svg';
import unbind_icon from '@/assets/icons/svg/unbind.svg';
</script>

<template>
    <div class="blur-panel">
        <TypeHeader :title="t('blur.blur')" class="mt-24" @click="first" :active="!!blurInfo">
            <template v-if="!mask" #tool>
                <div v-if="!mixed" class="blur-style" @click="openBlurPanel($event)">
                    <SvgIcon :icon="style_icon" />
                </div>
                <div class="add" @click.stop="addBlur" v-if="!blurInfo || mixed">
                    <SvgIcon :icon="add_icon" />
                </div>
            </template>
        </TypeHeader>
        <div class="tips-wrap" v-if="mixed && !mask">
            <span class="mixed-tips">{{ t('attr.mixed_lang') }}</span>
        </div>
        <div class="blur-container" v-if="!mixed && blurInfo && !mask">
            <div class="blur">
                <div :class="blurInfo.isEnabled ? 'visibility' : 'hidden'" @click="toggleVisible()">
                    <SvgIcon v-if="blurInfo.isEnabled" :icon="select_icon" />
                </div>
                <div class="blur_posi">
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
        <div class="shadowmask" v-if="mask">
            <div class="info">
                <div class="blur-left" @click="openBlurPanel($event)">
                    <div class="effect">
                    </div>
                    <div class="name">{{ blurMask?.name }}</div>
                </div>
                <div class="unbind" @click="delblurmask">
                    <SvgIcon :icon="unbind_icon" />
                </div>
            </div>
            <div class="delete-style" @click="delstyleblur">
                <SvgIcon :icon="delete_icon" />
            </div>
        </div>
        <BlurStyle v-if="showblur" :context="props.context" :shapes="props.shapes" :top="Top" :left="Left"
            @close="closepanel" :id="blurMask?.id">
        </BlurStyle>
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

    //.add:hover {
    //  transform: scale(1.25);
    //}

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

            .blur_posi {
                flex: 1;
                height: 100%;
                margin-right: 5px;
                //padding: 0px 5px;
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

    .shadowmask {
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