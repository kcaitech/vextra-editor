<template>
    <div class="editor-style" :style="{ top: props.top + 'px', left: props.left + 'px' }">
        <div class="header">
            <div class="title">编辑边框样式</div>
            <div class="close" @click.stop="emits('close')">
                <SvgIcon :icon="close_icon"></SvgIcon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input v-focus type="text" id="name" v-model="stylename" @keydown.esc="props.context.escstack.execute()"
                    @change="setSheetName">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input type="text" id="des" v-model="description" @keydown.esc="props.context.escstack.execute()"
                    @change="setSheetDes">
            </div>
        </div>
        <div class="border">
            <div class="type">
                <div class="title">位置</div>
                <Select class="select" :context="props.context" :shapes="props.shapes" :source="positonOptionsSource"
                    :selected="positonOptionsSource.find(i => i.data.value === border?.position)?.data"
                    @select="positionSelect" :entry="'style'"></Select>
            </div>
            <div class="thickness">
                <div class="title">粗细</div>
                <input type="text" v-model="thickness" @change="setThickness">
            </div>
        </div>
    </div>

</template>
<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView, BorderPosition, Border, BorderMask, BorderMaskType, BorderSideSetting } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, genOptions } from '@/utils/common';
import { FillRenderer } from './fillRenderer';
import add_icon from '@/assets/icons/svg/add.svg';
import editor_icon from '@/assets/icons/svg/export-menu.svg';
import down_icon from '@/assets/icons/svg/triangle-down.svg';
import right_icon from '@/assets/icons/svg/triangle-right.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import style_icon from '@/assets/icons/svg/styles.svg';
import unbind_icon from '@/assets/icons/svg/unbind.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import arrow_icon from '@/assets/icons/svg/arrow-right.svg';
import close_icon from '@/assets/icons/svg/close.svg';
import choose_icon from '@/assets/icons/svg/choose.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    top: number;
    left: number
    maskid: string
    reder: FillRenderer
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const position = ref<SelectItem>({ value: 0, content: t('attr.center') });
const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);
const thickness = ref<string>('')
const oldvalue = ref<string>('')
const border = ref<BorderMaskType>()
const stylename = ref<string>('')
const description = ref<string>('')
const reflush = ref<number>(0)


function positionSelect(selected: SelectItem) {
    if (!props.maskid) return;
    if (border.value?.position === selected.value) return
    const mask = props.reder.currentTarget(props.maskid) as BorderMask
    const editor = props.context.editor4Doc()
    editor.modifyBorderMaskBorderPosition(mask.sheet, mask.id, selected.value as BorderPosition)
}

const setSheetName = () => {
    if (!props.maskid) return;
    const mask = props.reder.currentTarget(props.maskid) as BorderMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleName(mask.sheet, mask.id, stylename.value)
}

const setSheetDes = () => {
    if (!props.maskid) return;
    const mask = props.reder.currentTarget(props.maskid) as BorderMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleDescription(mask.sheet, mask.id, description.value)
}

const setThickness = () => {
    let arrs = thickness.value.replaceAll(/，/g, ',').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false)
    if (!b) return thickness.value = oldvalue.value;
    if (arrs.length === 1) {
        arrs = arrs.concat(...arrs, ...arrs, ...arrs)
    }
    if (arrs.length === 2) {
        arrs = arrs.concat(arrs[0], arrs[1])
    }
    if (arrs.length === 3) {
        arrs = arrs.concat(arrs[1])
    }
    thickness.value = arrs.join(', ')

    const num = thickness.value.split(', ').map(i => Number(i))
    if (!props.maskid) return;
    const mask = props.reder.currentTarget(props.maskid) as BorderMask
    const editor = props.context.editor4Doc()
    const { sideType } = border.value?.sideSetting as BorderSideSetting
    const side = new BorderSideSetting(sideType, num[0], num[3], num[2], num[1])
    editor.modifyBorderMaskBorderSideSetting(mask.sheet, mask.id, side)
}

const update = () => {
    border.value = undefined;
    if (props.reder && props.maskid) {
        const mask = props.reder.currentTarget(props.maskid) as BorderMask;
        stylename.value = mask.name ?? '模糊样式';
        description.value = mask.description ?? '';
        border.value = mask.border;
        const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = border.value.sideSetting;
        thickness.value = [thicknessTop, thicknessRight, thicknessBottom, thicknessLeft].join(', ');
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

    .border {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        margin-bottom: 8px;
        box-sizing: border-box;

        .type {
            display: flex;
            gap: 8px;
            align-items: center;

            .title {}

            .select {
                flex: 1;
            }
        }

        .thickness {

            display: flex;
            align-items: center;
            gap: 8px;
            box-sizing: border-box;

            .title {}

            input {
                flex: 1;
                width: 100%;
                outline: none;
                border: none;
                padding: 10px 8px;
                background-color: #F5F5F5;
                height: 32px;
                border-radius: 6px;
                box-sizing: border-box;
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
