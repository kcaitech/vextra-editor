<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { onMounted, ref, onUnmounted, watchEffect, watch } from 'vue';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign, Color, UnderlineType, StrikethroughType, Shape, TableCell } from "@kcdesign/data";
interface Props {
}
interface Props {
    menu: string
    context: Context,
    cells: TableCell[]
}
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'textAlginHor', svgicon: string): void;
    (e: 'textAlginVer', svgicon: string): void;
}>()
const { t } = useI18n()
const selectLevel = ref('')
const selectVertical = ref('')

const onSelectLevel = (icon: TextHorAlign, svg: string) => {
    if (props.cells.length === 1) {
        const editor = props.context.editor4TextShape(props.cells[0] as TableCell & { text: Text; })
        editor.setTextHorAlign(icon, 0, Infinity)
    } else {
        console.log('多个单元格');
    }
    emit('textAlginHor', svg)
}
const onSelectVertical = (icon: TextVerAlign, svg: string) => {
    if (props.cells.length === 1) {
        const editor = props.context.editor4TextShape(props.cells[0] as TableCell & { text: Text; })
        editor.setTextVerAlign(icon)
    } else {
        console.log('多个单元格');
    }
    emit('textAlginVer', svg)
}
</script>

<template>
    <div class="text-bottom-align">
        <div class="level-aligning jointly-text" v-if="menu === 'hor'">
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'left' }"
                @click="onSelectLevel(TextHorAlign.Left, 'text-left')">
                <Tooltip :content="t('attr.align_left')" :offset="15">
                    <svg-icon icon-class="text-left"></svg-icon>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'centered' }"
                @click="onSelectLevel(TextHorAlign.Centered, 'text-center')">
                <Tooltip :content="t('attr.align_center')" :offset="15">
                    <svg-icon icon-class="text-center"></svg-icon>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'right' }"
                @click="onSelectLevel(TextHorAlign.Right, 'text-right')">
                <Tooltip :content="t('attr.align_right')" :offset="15">
                    <svg-icon icon-class="text-right"></svg-icon>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'natural' }"
                @click="onSelectLevel(TextHorAlign.Natural, 'text-justify')">
                <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                    <svg-icon icon-class="text-justify"></svg-icon>
                </Tooltip>
            </i>
        </div>
        <div class="vertical-aligning jointly-text" v-if="menu === 'ver'">
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectVertical === 'top' }"
                @click="onSelectVertical(TextVerAlign.Top, 'align-top')">
                <Tooltip :content="t('attr.align_top')" :offset="15">
                    <svg-icon icon-class="align-top"></svg-icon>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectVertical === 'middle' }"
                @click="onSelectVertical(TextVerAlign.Middle, 'align-middle')">
                <Tooltip :content="t('attr.align_middle')" :offset="15">
                    <svg-icon icon-class="align-middle"></svg-icon>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectVertical === 'bottom' }"
                @click="onSelectVertical(TextVerAlign.Bottom, 'align-bottom')">
                <Tooltip :content="t('attr.align_bottom')" :offset="15">
                    <svg-icon icon-class="align-bottom"></svg-icon>
                </Tooltip>
            </i>
        </div>
    </div>
</template>

<style scoped lang="scss">
.text-bottom-align {
    position: absolute;
    bottom: -26px;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.jointly-text {
    height: 25px;
    border-radius: 4px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

    >svg {
        width: 14px;
        height: 14px;
        overflow: visible !important;
    }
}

.level-aligning {
    box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2);
    padding: 0 5px;
}

.font-posi {
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
}

.selected_bgc {
    background-color: var(--active-color) !important;
    color: #fff;
}

:deep(.el-tooltip__trigger:focus) {
    outline: none !important;
}</style>