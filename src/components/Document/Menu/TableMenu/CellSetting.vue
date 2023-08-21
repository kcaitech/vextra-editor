<script lang="ts" setup>
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { Context } from '@/context';
import { Close } from '@element-plus/icons-vue'
import { TableShape } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {
    context: Context,
    addOrDivision: string
}
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'close'): void;
}>();
const dialogVisible = ref(true);
const rowNum = ref(1);
const radioRanks = ref('top');
const colNum = ref(1);
const rowBotom = ref(1);
const colRight = ref(1);
const handleChangeRow = (value: number) => {
    console.log(value);
}
const handleChangeCol = (value: number) => {
    console.log(value);
}
const handleChangeBottom = (value: number) => {
    console.log(value);
}
const handleChangeRight = (value: number) => {
    console.log(value);
}
const escClose = (e: KeyboardEvent) => {
    e.stopPropagation();
    emit('close');
}

const InsertCell = (state: string) => {
    const shape = props.context.selection.selectedShapes[0];
    const layout = (shape as TableShape).getLayout();
    const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
    if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const cell = (Array.from(table.getSelectedCells()))[0]
        const editor = props.context.editor4Table(shape as TableShape);
        if(state === 'top') {
            editor.insertRow(table.tableRowStart, layout.rowHeights[0]);
        }else  if(state === 'bottom') {
            editor.insertRow(table.tableRowEnd + 1, layout.rowHeights[0]);
        }
        else  if(state === 'left') {
            editor.insertCol(table.tableColStart, layout.colWidths[0]);
        }
        else  if(state === 'right') {
            editor.insertCol(table.tableColEnd + 1, layout.colWidths[0]);
        }
    }
    emit('close');
}

onMounted(() => {
    document.addEventListener('keydown', escClose);
})
onUnmounted(() => {
    document.removeEventListener('keydown', escClose);
})
</script>

<template>
    <div class="container" @mousedown.stop>
        <el-dialog v-model="dialogVisible" :title="t('table.insert_column')" width="200px" draggable align-center :modal="false"
            v-if="addOrDivision === 'insert'" :close-on-click-modal="false" :close-on-press-escape="false"
            :show-close="false" :lock-scroll="false">
            <div class="close" @click="emit('close')"><el-icon>
                    <Close />
                </el-icon></div>
            <div class="body">
                <div class="addcol" :style="{ opacity: radioRanks === 'top' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="top"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'top'">{{t('table.top_insert')}}</span>
                    <el-input-number v-model="rowNum" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" @change="handleChangeRow" />
                </div>
                <div class="addcol" :style="{ opacity: radioRanks === 'bottom' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="bottom"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'bottom'">{{t('table.bottom_insert')}}</span>
                    <el-input-number v-model="rowBotom" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" @change="handleChangeBottom" />
                </div>
                <div class="addcol" :style="{ opacity: radioRanks === 'left' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="left"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'left'">{{t('table.left_insert')}}</span>
                    <el-input-number v-model="colNum" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" @change="handleChangeCol" />
                </div>
                <div class="addcol" :style="{ opacity: radioRanks === 'right' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="right"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'right'">{{t('table.right_insert')}}</span>
                    <el-input-number v-model="colRight" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" @change="handleChangeRight" />
                </div>
            </div>
            <div class="save">
                <div @click="InsertCell(radioRanks)">{{t('table.confirm')}}</div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dialog__title) {
    font-size: 13px;
}

:deep(.el-dialog__body) {
    padding: 10px;
    padding-top: 0px;
}

:deep(.el-dialog__header) {
    padding: 10px;
}

:deep(.el-dialog__headerbtn) {
    height: 34px;
}

:deep(.el-input__wrapper) {
    padding-left: 10px;
    padding-right: 35px;
}

:deep(.el-radio__label) {
    display: none;
}

.container {
    .close {
        position: absolute;
        top: 14px;
        right: 16px;
    }

    .body {
        font-size: var(--font-default-fontsize);
        display: flex;
        flex-direction: column;

        .row {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            height: 25px;

            span {
                margin-right: 5px;
            }
        }

        .col {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            height: 25px;

            span {
                margin-right: 5px;
            }
        }

        .addcol {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            height: 25px;

            span {
                width: 90px;
                margin-left: 5px;
                margin-right: 5px;
            }
        }
    }
}

.save {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    div {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        width: 60px;
        height: 22px;
        background-color: var(--active-color-beta);
        color: #fff;
        font-size: var(--font-default-fontsize);
    }
}

:deep(.el-input-number__increase.is-disabled) {
    cursor: default;
}

:deep(.el-input-number__decrease.is-disabled) {
    cursor: default;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: var(--active-color-beta);
    background: var(--active-color-beta);
}
</style>