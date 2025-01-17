<template>
    <div id="modify-radius-panel" class="editor-style">
        <div class="header">
            <div class="title">{{ t('stylelib.editor_radius') }}</div>
            <div class="close" @click.stop="emits('close')">
                <SvgIcon :icon="close_icon"></SvgIcon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">{{ t('stylelib.name') }}</label>
                <input v-focus type="text" id="name" v-model="stylename" @keydown.esc="props.context.escstack.execute()"
                    @change="setSheetName">
            </div>
            <div class="des">
                <label for="des">{{ t('stylelib.description') }}</label>
                <input type="text" id="des" v-model="styledes" @keydown.esc="props.context.escstack.execute()"
                    @change="setSheetDes">
            </div>
        </div>
        <div class="radius">
            <div class="title">{{ t('stylelib.round') }}</div>
            <input type="text" v-model="radius" @change="setRadius">
        </div>
    </div>

</template>
<script setup lang="ts">
import close_icon from '@/assets/icons/svg/close.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

import { Context } from '@/context';
import { RadiusMask, ShapeView, } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FillRenderer } from '../StyleLib/fillRenderer';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    maskid: string
    reder: FillRenderer
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const oldvalue = ref<string>('')
const radius = ref<string>('')
const stylename = ref<string>('')
const styledes = ref<string>('')

const setRadius = () => {
    let arrs = radius.value.replaceAll(/，/g, ',').replaceAll(/\s+/g, '').split(',').slice(0, 4).filter(Boolean);
    const b = arrs.every(i => isNaN(Number(i)) === false)
    if (!b) return radius.value = oldvalue.value;
    if (arrs.length === 1) {
        arrs = arrs.concat(...arrs, ...arrs, ...arrs)
    }
    if (arrs.length === 2) {
        arrs = arrs.concat('0', '0')
    }
    if (arrs.length === 3) {
        arrs = arrs.concat('0')
    }
    radius.value = arrs.join(', ')

    const num = radius.value.split(', ').map(i => Number(i))
    if (!props.maskid) return;
    const mask = props.reder.currentTarget(props.maskid) as RadiusMask
    const editor = props.context.editor4Doc()
    editor.modifyBorderMaskBorderSideSetting(mask.sheet, mask.id, side)
}

const setSheetName = () => {
    if (!props.maskid) return;
    const mask = props.reder.currentTarget(props.maskid) as RadiusMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleName(mask.sheet, mask.id, stylename.value)
}

const setSheetDes = () => {
    if (!props.maskid) return;
    const mask = props.reder.currentTarget(props.maskid) as RadiusMask
    const editor = props.context.editor4Doc()
    editor.modifyStyleDescription(mask.sheet, mask.id, styledes.value)
}

onMounted(() => {

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

    .radius {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;
        margin-bottom: 8px;

        .title {}

        input {
            flex: 1;
            width: 100%;
            outline: none;
            border: none;
            padding: 10px 8px;
            background-color: #F5F5F5;
            border: 1px solid transparent;
            height: 32px;
            border-radius: 6px;
            box-sizing: border-box;

            &:focus {
                border: 1px solid #1878f5;
            }
        }
    }

}
</style>
