<script lang="ts" setup>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { Context } from '@/context';
import { Close } from '@element-plus/icons-vue'
interface Props {
    context: Context,
    addOrDivision: string
}
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'close'): void;
}>();
const dialogVisible = ref(true);
const rowNum = ref(2);
const radioRanks = ref('top');
const colNum = ref(2);
const rowBotom = ref(2);
const colRight = ref(2);

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
onMounted(() => {
    document.addEventListener('keydown', escClose);
})
onUnmounted(() => {
    document.removeEventListener('keydown', escClose);
})
</script>

<template>
    <div class="container" @mousedown.stop>
        <el-dialog v-model="dialogVisible" title="拆分单元格" width="180px" draggable align-center :modal="false" v-if="addOrDivision === 'split'"
        :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
            <div class="close" @click="emit('close')"><el-icon><Close /></el-icon></div>
            <div class="body">
                <div class="row">
                    <span>行数</span>
                    <el-input-number
                        v-model="rowNum"
                        :min="1"
                        :max="50"
                        size="small"
                        :controls="true"
                        controls-position="right"
                        @change="handleChangeRow"
                    />
                </div>
                <div class="col">
                    <span>列数</span>
                    <el-input-number
                        v-model="colNum"
                        :min="1"
                        :max="50"
                        size="small"
                        :controls="true"
                        controls-position="right"
                        @change="handleChangeCol"
                    />
                </div>
            </div>
            <div class="save">
                <div>确定</div>
            </div>
        </el-dialog>
        <el-dialog v-model="dialogVisible" title="插入行列" width="200px" draggable align-center :modal="false" v-if="addOrDivision === 'insert'"
        :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
            <div class="close" @click="emit('close')"><el-icon><Close /></el-icon></div>
            <div class="body">
                <div class="addcol">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="top"></el-radio>
                    </el-radio-group>
                    <span>上方插入行</span>
                    <el-input-number
                        v-model="rowNum"
                        :min="1"
                        :max="50"
                        size="small"
                        :controls="true"
                        controls-position="right"
                        @change="handleChangeRow"
                    />
                </div>
                <div class="addcol">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="bottom"></el-radio>
                    </el-radio-group>
                    <span>下方插入行</span>
                    <el-input-number
                        v-model="rowBotom"
                        :min="1"
                        :max="50"
                        size="small"
                        :controls="true"
                        controls-position="right"
                        @change="handleChangeBottom"
                    />
                </div>
                <div class="addcol">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="left"></el-radio>
                    </el-radio-group>
                    <span>左侧插入列</span>
                    <el-input-number
                        v-model="colNum"
                        :min="1"
                        :max="50"
                        size="small"
                        :controls="true"
                        controls-position="right"
                        @change="handleChangeCol"
                    />
                </div>
                <div class="addcol">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="right"></el-radio>
                    </el-radio-group>
                    <span>右侧插入列</span>
                    <el-input-number
                        v-model="colRight"
                        :min="1"
                        :max="50"
                        size="small"
                        :controls="true"
                        controls-position="right"
                        @change="handleChangeRight"
                    />
                </div>
            </div>
            <div class="save">
                <div>确定</div>
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
:deep(.el-input-number__increase.is-disabled ) {
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