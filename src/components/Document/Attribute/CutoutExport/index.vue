<script setup lang="ts">
import { Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { Context } from '@/context';
import PreinstallSelect from './PreinstallSelect.vue';
import Preview from './Preview.vue';
import ExportArguments from './ExportArguments.vue';
import { v4 } from 'uuid';
interface Props {
    context: Context
    shapes: Shape[]
}
const props = defineProps<Props>();
const isPreinstall = ref(false);
const lucency_bg = ref(false);
const canvas_bg = ref(false);
type Argus = {
    id: string,
    size: string,
    value: string,
    prefix: string,
    format: string
}
const sizeItems: string[] = ['0.5x', '1x', '2x', '3x', '4x', '5x'];
const perfixItems: string[] = ['前缀', '后缀'];
const formatItems: string[] = ['PNG', 'JPG', 'SVG', 'PDF'];
const preinstallArgus = ref<Argus[]>([]);
const defaultArgus = () => [{
    id: '',
    size: '1x',
    value: '-',
    prefix: '前缀',
    format: 'PNG'
}].map(i =>({...i, id: v4()}));
const iosArgus = () => [
    { id: '', size: '1x', value: '-', prefix: '前缀', format: 'PNG' },
    { id:  '', size: '2x', value: '@2x', prefix: '后缀', format: 'PNG' },
    { id:  '', size: '3x', value: '@3x', prefix: '后缀', format: 'PNG' },
].map(i =>({...i, id: v4()}));
const androidArgus =() => [
    { id: '', size: '1x', value: 'mdpi/', prefix: '前缀', format: 'PNG' },
    { id: '', size: '2x', value: 'xhdpi/', prefix: '前缀', format: 'PNG' },
    { id: '', size: '3x', value: 'xxhdpi/', prefix: '前缀', format: 'PNG' },
    { id: '', size: '4x', value: 'xxxhdpi/', prefix: '前缀', format: 'PNG' },
].map(i =>({...i, id: v4()}));
const showPreinstall = () => {
    if (isPreinstall.value) return isPreinstall.value = false;
    isPreinstall.value = true;
}

const preinstall = (v: string) => {
    switch (v) {
        case 'ios':
            preinstallArgus.value = [...iosArgus(), ...preinstallArgus.value];
            break;
        case 'android':
            preinstallArgus.value = [...androidArgus(), ...preinstallArgus.value];
            break;
        case 'default':
            preinstallArgus.value.unshift(...defaultArgus());
            break;
    }
}
const changeSize = (index: number, argsi: number) => {
    preinstallArgus.value[argsi].size = sizeItems[index];
}
const changePrefix = (index: number, argsi: number) => {
    preinstallArgus.value[argsi].prefix = perfixItems[index];
}
const changeFormat = (index: number, argsi: number) => {
    preinstallArgus.value[argsi].format = formatItems[index];
}
const deleteArgus = (index: number) => {
    preinstallArgus.value.splice(index, 1);
}
</script>

<template>
    <div class="cutout_export_box">
        <div class="title">
            <div class="name">创建切图与导出</div>
            <div class="cutout_add_icon">
                <div class="cutout-icon cutout-preinstall"
                    :style="{ backgroundColor: isPreinstall ? 'rgba(0, 0, 0, 0.2)' : '' }" @click="showPreinstall"><svg-icon
                        icon-class="text-justify"></svg-icon></div>
                <div class="cutout-icon" @click="preinstall('default')"><svg-icon icon-class="add"></svg-icon></div>
                <PreinstallSelect v-if="isPreinstall" @close="isPreinstall = false" @preinstall="preinstall">
                </PreinstallSelect>
            </div>
        </div>
        <div class="argus" v-if="preinstallArgus.length > 0" preinstallArgus.length>
            <ExportArguments v-for="(argus, index) in preinstallArgus" :key="argus.id" :index="index" :argus="argus"
                :context="context" :shapes="shapes" :sizeItems="sizeItems" :perfixItems="perfixItems"
                :formatItems="formatItems" @change-size="changeSize" @change-prefix="changePrefix"
                @change-format="changeFormat" @delete="deleteArgus">
            </ExportArguments>
        </div>
        <div class="canvas-bgc">
            <el-checkbox v-model="lucency_bg" label="修剪透明像素" />
        </div>
        <div class="canvas-bgc">
            <el-checkbox v-model="canvas_bg" label="画布背景色" />
        </div>
        <div class="export-box">
            <div><span>导出</span></div>
        </div>
        <Preview :context="context" :shapes="shapes"></Preview>
    </div>
</template>

<style scoped lang="scss">
.cutout_export_box {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 10px 12px 10px;
    box-sizing: border-box;

    .title {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        .name {
            font-weight: 600;
            flex-shrink: 0;
        }

        .cutout_add_icon {
            display: flex;
            align-items: center;
            position: relative;

            .cutout-icon {
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;

                &:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                >svg {
                    width: 50%;
                    height: 50%;
                }
            }
        }
    }

    .argus {
        width: 100%;
        margin: 3px 0;
    }

    .canvas-bgc {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;

        :deep(.el-checkbox__inner::after) {
            border: 1.5px solid #000;
            border-left: 0;
            border-top: 0;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
            background-color: #fff;
            border-color: #000;
        }

        :deep(.el-checkbox__input.is-checked+.el-checkbox__label) {
            color: #000;
        }

        :deep(.el-checkbox__inner:hover) {
            border-color: #dcdfe6;
        }
    }

    .export-box {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;
        margin: 5px 0;

        div {
            font-weight: bold;
            width: 100%;
            height: 30px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #dcdfe6;

            &:hover {
                border: 1px solid #000;
            }
        }
    }
}
</style>