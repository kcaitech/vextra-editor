<template>
    <div class="editor-style" :style="{ top: props.top + 'px', left: props.left + 'px' }">
        <div class="header">
            <div class="title">编辑特效样式</div>
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
                <div class="add" @click.stop="addshadow">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
            </div>
            <div class="effect-list">
                <div class="item" v-for="(s, index) in shadows" :key="s.id">
                    <div class="show">
                        <div :class="s.shadow.isEnabled ? 'visibility' : 'hidden'" @click.stop="toggleVisible(index)">
                            <svg-icon v-if="s.shadow.isEnabled" icon-class="select"></svg-icon>
                        </div>
                    </div>
                    <Select class="select" :context="props.context" :shapes="props.shapes"
                        :source="positonOptionsSource"
                        :selected="positonOptionsSource.find(i => i.data.value === s.shadow.position)?.data"
                        @select="(value) => positionSelect(value, index)"></Select>
                    <ShadowDetail :context="props.context" :shadow="s.shadow" :idx="index" :id:="s.shadow.id"
                        :length="shadows.length" :shapes="props.shapes" :entry="'style'" :reflush="reflush"
                        @set-offset-x="(v) => setOffsetX(v, index)" @set-offset-y="(v) => setOffsetY(v, index)"
                        @set-blur-radius="(v) => setBlurRadius(v, index)" @set-spread="(v) => setSpread(v, index)"
                        @picker-color="(v) => setShadowColor(v, index)" @set-color="(v) => setShadowColor(v, index)"
                        @keydownoffset-x="(v) => keydownoffsetX(v, index)"
                        @keydownoffset-y="(v) => keydownoffsetY(v, index)"
                        @keydown-blur-radius="(v) => keydownblurRadius(v, index)"
                        @keydown-spread="(v) => keydownspread(v, index)" @keydown-color="(v) => keydowncolor(v, index)"
                        @dragoffset-x="(fn, value) => dragoffsetX(fn, value, index)"
                        @dragoffset-y="(fn, value) => dragoffsetY(fn, value, index)"
                        @drag-blur-radius="(fn, value) => dragblurRadius(fn, value, index)"
                        @drag-spread="(fn, value) => dragspread(fn, value, index)"
                        >
                    </ShadowDetail>
                    <div class="delete" :class="{ disable }" @click.stop="deleteShadow(index)">
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
import { ShapeView, BorderPosition, ShadowPosition, BlurType, Shadow, ShadowMask, Color, BasicArray, LinearApi } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, genOptions } from '@/utils/common';
import { computed } from 'vue';
import ShadowDetail from '../Shadow/ShadowDetail.vue'
import { FillRenderer } from './fillRenderer';
import { v4 } from 'uuid';
import { LockMouse } from '@/transform/lockMouse';

interface ShadowItem {
    id: number,
    shadow: Shadow
}

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
    [ShadowPosition.Inner, t(`shadow.inner`)],
    [ShadowPosition.Outer, t(`shadow.outer`)],
    [BlurType.Gaussian, t(`blur.gaussian`)],
    [BlurType.Background, t(`blur.background`)]
]);
const effectname = ref<HTMLInputElement>()
const effectdes = ref<HTMLInputElement>()
const name = ref<string>();
const des = ref<string>();
const reflush = ref<number>(0);
const shadows: ShadowItem[] = reactive([]);
const disable = computed(() => {
    return shadows.length <= 1
})

const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)

const dragspread = (fn: LockMouse, value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    fn.executeShadowMaskS(mask.sheet, mask.id, _idx, value)
}

const dragblurRadius = (fn: LockMouse, value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    fn.executeShadowMaskB(mask.sheet, mask.id, _idx, value)
}

const dragoffsetY = (fn: LockMouse, value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    fn.executeShadowMaskY(mask.sheet, mask.id, _idx, value)
}

const dragoffsetX = (fn: LockMouse, value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    fn.executeShadowMaskX(mask.sheet, mask.id, _idx, value)
}

const keydowncolor = (color: Color, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    linearApi.modifyShadowMaskShadowColor(mask.sheet, mask.id, _idx, color)
}

const keydownblurRadius = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    linearApi.modifyShadowMaskShadowBlur(mask.sheet, mask.id, _idx, value)
}

const keydownoffsetY = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    linearApi.modifyShadowMaskShadowOffsetY(mask.sheet, mask.id, _idx, value)
}

const keydownspread = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    linearApi.modifyShadowMaskShadowSpread(mask.sheet, mask.id, _idx, value)
}

const keydownoffsetX = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    linearApi.modifyShadowMaskShadowOffsetX(mask.sheet, mask.id, _idx, value)
}

const setShadowColor = (color: Color, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyShadowMaskShadowColor(mask.sheet, mask.id, _idx, color)
}

const setSpread = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyShadowMaskShadowSpread(mask.sheet, mask.id, _idx, value)
}

const setBlurRadius = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyShadowMaskShadowBlur(mask.sheet, mask.id, _idx, value)
}

const setOffsetY = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyShadowMaskShadowOffsetY(mask.sheet, mask.id, _idx, value)
}

const setOffsetX = (value: number, idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyShadowMaskShadowOffsetX(mask.sheet, mask.id, _idx, value)
}

function positionSelect(selected: SelectItem, idx: number) {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyShadowMaskShadowPosition(mask.sheet, mask.id, _idx, selected.value as ShadowPosition)
}

const addshadow = () => {
    const editor = props.context.editor4Doc()
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    if (!props.maskid) return
    const color = new Color(0.2, 0, 0, 0);
    const shadow = new Shadow(new BasicArray(), v4(), true, 10, color, 0, 4, 0, ShadowPosition.Outer);
    editor.modifyShadowMaskShadowAddShadow(mask.sheet, mask.id, shadow)
}

const deleteShadow = (idx: number) => {
    const _idx = shadows.length - idx - 1;
    if (!props.maskid) return
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyShadowMaskShadowRemoveShadow(mask.sheet, mask.id, _idx)
}

const toggleVisible = (idx: number) => {
    const _idx = shadows.length - idx - 1;
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    if (!props.maskid) return
    const value = !shadows[idx].shadow.isEnabled;
    editor.modifyShadowMaskShadowEnabled(mask.sheet, mask.id, _idx, value)

}

const setSheetName = () => {
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleName(mask.sheet, mask.id, name.value)
}

const setSheetDes = () => {
    const mask = props.reder.currentTarget(props.maskid) as ShadowMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleDescription(mask.sheet, mask.id, des.value)
}

const update = () => {
    shadows.length = 0
    if (props.reder && props.maskid) {
        const mask = props.reder.currentTarget(props.maskid) as ShadowMask;
        name.value = mask.name ?? '颜色样式';
        des.value = mask.description ?? '';
        const _shadows: ShadowItem[] = [];
        mask.shadows.forEach((shadow, index) => {
            _shadows.push({ id: index, shadow })
        })
        shadows.push(..._shadows.reverse())
    }
    reflush.value++;
}

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib') {
        update();
    }

}

watch(() => props.maskid, () => {
    update();
})

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
