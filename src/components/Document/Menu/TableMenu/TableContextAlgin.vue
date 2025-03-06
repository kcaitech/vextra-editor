/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign, TableCell, TableShape, TableView } from "@kcdesign/data";
import { Selection } from '@/context/selection';

interface Props {
    menu: string
    context: Context
    cells: TableCell[]
    selectIcon: string
}
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'textAlginHor', svgicon: string): void;
    (e: 'textAlginVer', svgicon: string): void;
}>()
const { t } = useI18n()
const selectLevel = ref('')
const selectVertical = ref('')

const onSelectLevel = (icon: TextHorAlign, svg: string,) => {
    const shape = props.context.selection.selectedShapes[0] as TableView;
    const table_Selection = props.context.tableSelection;
    const editor = props.context.editor4Table(shape);
    editor.setTextHorAlign(icon, { rowStart: table_Selection.tableRowStart, rowEnd: table_Selection.tableRowEnd, colStart: table_Selection.tableColStart, colEnd: table_Selection.tableColEnd });
    props.context.selection.notify(Selection.CHANGE_TEXT);
    emit('textAlginHor', svg)
}
const onSelectVertical = (icon: TextVerAlign, svg: string) => {
    const shape = props.context.selection.selectedShapes[0] as TableView;
    const table_Selection = props.context.tableSelection;
    const editor = props.context.editor4Table(shape);
    editor.setTextVerAlign(icon, { rowStart: table_Selection.tableRowStart, rowEnd: table_Selection.tableRowEnd, colStart: table_Selection.tableColStart, colEnd: table_Selection.tableColEnd });
    props.context.selection.notify(Selection.CHANGE_TEXT);
    emit('textAlginVer', svg)
}

import text_left_icon from '@/assets/icons/svg/text-left.svg';
import text_center_icon from '@/assets/icons/svg/text-center.svg';
import text_right_icon from '@/assets/icons/svg/text-right.svg';
import text_justify_icon from '@/assets/icons/svg/text-justify.svg';
import align_top_icon from '@/assets/icons/svg/align-top.svg';
import align_bottom_icon from '@/assets/icons/svg/align-bottom.svg';
import align_middle_icon from '@/assets/icons/svg/align-middle.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
</script>

<template>
    <div class="text-bottom-align" style="height: 44px;">
        <div class="level-aligning jointly-text" v-if="menu === 'hor'">
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectIcon === 'text-left' }"
                @click.stop="onSelectLevel(TextHorAlign.Left, 'text-left')">
                <Tooltip :content="t('attr.align_left')" :offset="15">
                    <SvgIcon :icon="text_left_icon"/>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectIcon === 'text-center' }"
                @click.stop="onSelectLevel(TextHorAlign.Centered, 'text-center')">
                <Tooltip :content="t('attr.align_center')" :offset="15">
                    <SvgIcon :icon="text_center_icon"/>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectIcon === 'text-right' }"
                @click.stop="onSelectLevel(TextHorAlign.Right, 'text-right')">
                <Tooltip :content="t('attr.align_right')" :offset="15">
                    <SvgIcon :icon="text_right_icon"/>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectIcon === 'text-justify' }"
                @click.stop="onSelectLevel(TextHorAlign.Natural, 'text-justify')">
                <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                    <SvgIcon :icon="text_justify_icon"/>
                </Tooltip>
            </i>
        </div>
        <div class="vertical-aligning jointly-text" v-if="menu === 'ver'">
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectIcon === 'align-top' }"
                @click.stop="onSelectVertical(TextVerAlign.Top, 'align-top')">
                <Tooltip :content="t('attr.align_top')" :offset="15">
                    <SvgIcon :icon="align_top_icon"/>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectIcon === 'align-middle' }"
                @click.stop="onSelectVertical(TextVerAlign.Middle, 'align-middle')">
                <Tooltip :content="t('attr.align_middle')" :offset="15">
                    <SvgIcon :icon="align_middle_icon"/>
                </Tooltip>
            </i>
            <i class="jointly-text font-posi" :class="{ selected_bgc: selectIcon === 'align-bottom' }"
                @click.stop="onSelectVertical(TextVerAlign.Bottom, 'align-bottom')">
                <Tooltip :content="t('attr.align_bottom')" :offset="15">
                    <SvgIcon :icon="align_bottom_icon"/>
                </Tooltip>
            </i>
        </div>
    </div>
</template>

<style scoped lang="scss">
.text-bottom-align {
    position: absolute;
    top: 34px;
    left: -7px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: #ffffff;
    padding: 6px;
    border: 1px solid #F0F0F0;
    box-sizing: border-box;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.18);
}

.jointly-text {
    >svg {
        width: 16px;
        height: 16px;
        overflow: visible !important;
    }
}

.level-aligning {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    height: 32px;
    width: 124px;
    border-radius: 4px;
    padding: 2px;
    background-color: #F0F0F0;
}

.vertical-aligning {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    height: 32px;
    width: 94px;
    border-radius: 4px;
    padding: 2px;
    background-color: #F0F0F0;
}

.font-posi {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 28px;
    border-radius: 3px;
    

    >svg {
        fill: #000;
    }

}

.selected_bgc {
    border: 1px solid #F0F0F0;
    box-sizing: border-box;
    background-color: #ffffff !important;
}

:deep(.el-tooltip__trigger:focus) {
    outline: none !important;
}
</style>