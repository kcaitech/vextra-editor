<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { Context } from '@/context';
import SelectLayer from "./SelectLayer.vue";
import { ArrowDown } from '@element-plus/icons-vue'
import { add } from 'lodash';
import { ShapeType, SymbolShape } from '@kcdesign/data';
const props = defineProps<{
    title?: string,
    top?: string,
    right?: string,
    width?: number,
    height?: string | number,
    context: Context;
    addType: 'Text' | 'Show' | 'toggle' | ''
}>();
const emit = defineEmits<{
    (e: 'closeDialog'): void;
    (e: 'saveLayerShow', data: any, type: 'Text' | 'Show' | 'toggle' | ''): void;
}>()

function popoverClose() {
    emit('closeDialog');
}

const selectLayer = ref('')
const attrName = ref('')
const isselectLayer = ref(false)
const options = [
    {
        value: '显示',
        label: '显示',
    },
    {
        value: '隐藏',
        label: '隐藏',
    }
]
const defaultValue = ref(options[0].value);
const textDefaultValue = ref('');
const selectList = ref<any[]>([])
function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') popoverClose();
    else e.stopPropagation();
}

const showSelectLayer = (e: MouseEvent) => {
    e.stopPropagation();
    if (isselectLayer.value && e.target instanceof Element && e.target.closest('.input')) return isselectLayer.value = false;
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1) {
        const symbol = shapes[0] as SymbolShape
        console.log(symbol, 'symbol');
        if (props.addType === 'Show') {
            selectList.value = symbol.childs;
        } else if (props.addType === 'Text' || props.addType === '') {
            selectList.value = symbol.childs.filter(item => item.type === ShapeType.Text)
        } else if (props.addType === 'toggle') {
            selectList.value = symbol.childs;
        }
        
    }
    isselectLayer.value = true;
}
const save = () => {
    let data
    if (props.addType === 'Show') {
        data = {
            name: attrName.value,
            visi: defaultValue.value
        }
    } else if (props.addType === 'Text') {
        data = {
            name: attrName.value,
            text: textDefaultValue.value
        }
    } else if (props.addType === 'toggle') {
        data = {
            name: attrName.value,
        }
    }
    emit('saveLayerShow', data, props.addType)
}
const comps = ref<HTMLDivElement>()
const cur_top = ref(0)
onMounted(() => {
    if (comps.value) {
        const body_h = document.body.clientHeight;
        const comps_y = comps.value.getBoundingClientRect().y;
        const comps_h = comps.value.clientHeight + 10;
        const surplus = body_h - comps_y;
        cur_top.value = surplus - comps_h;
    }
    document.addEventListener('keyup', esc);
})
onUnmounted(() => {
    document.removeEventListener('keyup', esc);
})
</script>

<template>
    <div class="dialog_box" ref="comps" :style="{
        width: `${props.width ? props.width : 360}px`,
        right: props.right,
        top: cur_top > 0 ? props.top : cur_top + 'px'
    }">
        <div class="header">
            <span class="title">{{ props.title }}</span>
            <div @click="popoverClose" class="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="body">
            <div>
                <span>{{ addType === 'toggle' ? '组件实例' : '选择图层' }}</span>
                <div class="select-layer" @mouseup="showSelectLayer" @click.stop>
                    <div class="input">
                        <span v-if="selectLayer"></span>
                        <span v-else style="opacity: 0.5">{{ addType === 'toggle' ? '请选择组件实例' : '请选择图层' }}</span>
                        <el-icon>
                            <ArrowDown />
                        </el-icon>
                    </div>
                    <!-- <el-input class="input" v-model="selectLayer" :placeholder="addType === 'toggle' ? '请选择组件实例' : '请选择图层'" disabled :suffix-icon="ArrowDown"/> -->
                    <SelectLayer v-if="isselectLayer" @close="isselectLayer = false" :type="props.addType"
                        :context="context" :selectList="selectList"></SelectLayer>
                </div>
            </div>
            <div>
                <span>属性名称</span>
                <div><el-input v-model="attrName" placeholder="请输入属性名称" /></div>
            </div>
            <p class="warn" v-if="false">名称重复，请重新输入</p>
            <div v-if="props.addType !== 'toggle' && props.addType">
                <span>默认值</span>
                <div v-if="props.addType === 'Show'">
                    <el-select v-model="defaultValue" class="m-2" placeholder="Select">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>
                <div v-if="props.addType === 'Text'"><el-input v-model="textDefaultValue" placeholder="请输入默认文本" /></div>
            </div>
        </div>
        <div class="footer">
            <el-button style="background-color: #9775fa;" @click="save">确认</el-button>
        </div>
    </div>
    <div class="overlay" @click.stop="isselectLayer = false" @mousedown.stop @wheel.stop></div>
</template>

<style scoped lang="scss">
.dialog_box {
    position: absolute;
    outline: none;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: #ffffff;
    border-radius: 4px;
    z-index: 10004;

    .header {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        font-size: var(--font-default-fontsize);
        padding: 0 var(--default-padding);
        box-sizing: border-box;
        align-items: center;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
        }

        .close {
            width: 24px;
            height: 24px;
            position: absolute;
            right: var(--default-padding);
            display: flex;
            align-items: center;
            justify-content: center;

            >svg {
                width: 65%;
                height: 65%;
            }
        }
    }

    .body {
        width: 100%;
        height: calc(100% - 32px);
        font-size: 10px;
        padding: 0 var(--default-padding);
        box-sizing: border-box;

        .select-layer {
            position: relative;
            z-index: 1;

            .input {
                width: 100%;
                height: 30px;
                border-radius: 4px;
                border: 1px solid #dcdfe6;
                padding-left: 10px;
                box-sizing: border-box;
                display: flex;
                align-items: center;

                span {
                    flex: 1;
                }

                .el-icon {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }

        .warn {
            padding: 0;
            color: red;
            transform: scale(.9);
            margin: 3px;
            margin-left: 60px;
        }

        >div {
            height: 30px;
            width: 100%;
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;

            span {
                width: 60px;
            }

            >div {
                flex: 1;
            }

            .el-input {
                width: 100%;
                height: 30px;
                font-size: 10px;
            }

            .el-select {
                width: 100%;
                height: 30px;
                font-size: 10px;

                >div {
                    height: 100%;
                }

                .el-option {
                    font-size: 10px
                }

                :deep(.el-input__wrapper) {
                    height: 30px;
                    font-size: 10px;
                }
            }
        }
    }

    .footer {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px 0;
    }
}

:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}

:deep(.el-button) {
    color: #fff;
}

:deep(.el-select-dropdown__item.selected) {
    color: #9775fa !important;
    font-size: 10px;
}

:deep(.el-select-dropdown__item>span) {
    font-size: 10px !important;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10003;
    background-color: rgba(0, 0, 0, 0.3);
}</style>