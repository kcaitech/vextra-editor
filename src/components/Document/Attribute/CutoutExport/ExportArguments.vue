<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import ArgsSelect from './ArgsSelect.vue';
import { Context } from '@/context';
import { ExportFileFormat, ExportFormat, ExportFormatNameingScheme, Shape, ShapeType } from '@kcdesign/data';
import { Menu } from '@/context/menu';
import { FormatItems } from './index.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {
    context: Context
    shapes: Shape[]
    argus: FormatItems
    sizeItems: string[]
    perfixItems: ExportFormatNameingScheme[]
    formatItems: string[]
    index: number
    length: number
}
const props = defineProps<Props>();
const emits = defineEmits<{
    (e: 'changeSize', value: string, argsi: number): void;
    (e: 'changePerfix', index: number, argsi: number): void;
    (e: 'changeFormat', index: number, argsi: number): void;
    (e: 'changeName', value: string, index: number): void;
    (e: 'delete', index: number): void;
}>();
const showCutoutSize = ref(false);
const showCutoutPerfix = ref(false);
const showCutoutFormat = ref(false);
const cutout_size_input = ref<HTMLDivElement>();
const cutout_perfix_input = ref<HTMLDivElement>();
const cutout_format_input = ref<HTMLDivElement>();
const top = ref(0);
const left = ref(0);
let sizeMenuItems: string[] = [];
let perMenuItems: ExportFormatNameingScheme[] = [];
let formatMenuItems: string[] = [];

const sizeValue = ref(props.argus.format.scale + 'x');
const perfixValue = ref(props.argus.format.namingScheme);
const formatValue = ref(props.argus.format.fileFormat.toUpperCase());
const name = ref(props.argus.format.name);
const showCutoutSizeMenu = () => {
    if (showCutoutSize.value) return showCutoutSize.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    const { y, x } = cutout_size_input.value!.getBoundingClientRect();
    top.value = y;
    left.value = x;
    sizeMenuItems = props.sizeItems;
    showCutoutSize.value = true;
};
const showCutoutPerfixMenu = () => {
    if (showCutoutPerfix.value) return showCutoutPerfix.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    const { y, x } = cutout_perfix_input.value!.getBoundingClientRect();
    top.value = y;
    left.value = x;
    perMenuItems = props.perfixItems;
    showCutoutPerfix.value = true;
};
const showCutoutFormatMenu = () => {
    if (showCutoutFormat.value) return showCutoutFormat.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    const { y, x } = cutout_format_input.value!.getBoundingClientRect();
    top.value = y;
    left.value = x;
    formatMenuItems = props.formatItems;
    showCutoutFormat.value = true;
};
const selectSize = (i: number) => {
    sizeValue.value = props.sizeItems[i];
    emits('changeSize', props.sizeItems[i], props.index);
}
const selectPerfix = (i: number) => {
    perfixValue.value = props.perfixItems[i];
    emits('changePerfix', i, props.index);
}
const selectFormat = (i: number) => {
    formatValue.value = props.formatItems[i];
    emits('changeFormat', i, props.index);
}
const nameInput = ref<HTMLInputElement>();
const changeName = () => {
    const value = nameInput.value!.value;
    name.value = value;
    emits('changeName', value, props.index);
}
const scaleInput = ref<HTMLInputElement>();
const changeScale = () => {
    const regex = /^(\d+|(\d+)x)$/;
    const value = scaleInput.value!.value;
    if (regex.test(value)) {
        sizeValue.value = value;
        emits('changeSize', value, props.index);
    } else {
        sizeValue.value = props.argus.format.scale + 'x';
        scaleInput.value!.value = sizeValue.value;
    }
}

const selectScale = () => {
    if (scaleInput.value) {
        scaleInput.value.select();
    }
}

const selectName = () => {
    if (nameInput.value) {
        nameInput.value.select();
    }
}

const deleteItem = () => {
    emits('delete', props.index);
}
watchEffect(() => {
    props.context.selection.selectedShapes
    if (props.argus.format.scale) {
        sizeValue.value = props.argus.format.scale + 'x';
    }
    if (props.argus.format.namingScheme) {
        perfixValue.value = props.argus.format.namingScheme;
    }
    if (props.argus.format.fileFormat) {
        formatValue.value = props.argus.format.fileFormat.toUpperCase();
    }
    if (props.argus.format.name) {
        name.value = props.argus.format.name;
    }
})
</script>

<template>
    <div class="args_container">
        <div class="format">
            <div class="cutout_size_input cutout_export_input" ref="cutout_size_input">
                <input :value="sizeValue" ref="scaleInput" @change="changeScale" @focus="selectScale">
                <div class="export_down-icon size" @click.stop="showCutoutSizeMenu">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <ArgsSelect v-if="showCutoutSize" :context="props.context" :menuItems="sizeMenuItems"
                    :selectValue="sizeValue" @close="showCutoutSize = false" :top="top" :left="left" @select="selectSize">
                </ArgsSelect>
            </div>
            <div class="cutout_presuffix_input cutout_export_input" ref="cutout_perfix_input">
                <input class="presuffix_input" :placeholder="t(`cutoutExport.${perfixValue}`)" ref="nameInput" @focus="selectName" :value="name"
                    @change="changeName">
                <div class="export_down-icon presuffix" @click.stop="showCutoutPerfixMenu">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <ArgsSelect v-if="showCutoutPerfix" :context="props.context" :menuItems="perMenuItems"
                    :selectValue="perfixValue" :i18n="true" @close="showCutoutPerfix = false" :top="top" :left="left"
                    @select="selectPerfix"></ArgsSelect>
            </div>
            <div class="cutout_format_input cutout_export_input" ref="cutout_format_input">
                <div class="span" @click.stop="showCutoutFormatMenu">{{ formatValue }}</div>
                <div class="export_down-icon format-i" @click.stop="showCutoutFormatMenu">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <ArgsSelect v-if="showCutoutFormat" :context="props.context" :menuItems="formatMenuItems"
                    :selectValue="formatValue" @close="showCutoutFormat = false" :top="top" :left="left"
                    @select="selectFormat"></ArgsSelect>
            </div>
        </div>
        <div class="delete" @click="deleteItem"
            :class="{ opacity: props.shapes.length === 1 && props.shapes[0].type === ShapeType.Cutout }">
            <svg-icon icon-class="delete"></svg-icon>
        </div>
    </div>
</template>

<style scoped lang="scss">
.args_container {
    height: 30px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;

    .format {
        width: calc(100% - 22px);
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        padding-right: 4px;

        .cutout_size_input {
            position: relative;
            display: flex;
            width: 28%;
            height: 32px;
            padding: 1px;
            align-items: center;
            padding-left: 5px;
            box-sizing: border-box;
            background-color: #F5F5F5;
            border-radius: var(--default-radius);

            &:hover {
                .size {
                    background-color: #EBEBEB;
                }
            }

        }

        .cutout_presuffix_input {
            position: relative;
            display: flex;
            width: 36%;
            height: 32px;
            padding: 1px;
            align-items: center;
            padding-left: 5px;
            box-sizing: border-box;
            background-color: #F5F5F5;
            border-radius: var(--default-radius);

            &:hover {
                .presuffix {
                    background-color: #EBEBEB;
                }
            }
        }

        .cutout_format_input {
            position: relative;
            display: flex;
            width: 30%;
            height: 32px;
            padding: 1px;
            align-items: center;
            padding-left: 5px;
            box-sizing: border-box;
            background-color: #F5F5F5;
            border-radius: var(--default-radius);

            &:hover {
                .format-i {
                    background-color: #EBEBEB;
                }
            }

            .span {
                width: 52%;
                height: 30px;
                flex: 1 1 auto;
                align-content: center;
                display: flex;
                align-items: center;
                margin-left: 2px;
                color: var(--theme-color);
                font-family: var(--font-family);
                text-overflow: ellipsis;
                background-color: transparent;
            }
        }

        input {
            width: 40%;
            height: 16px;
            flex: 1 1 auto;
            align-content: center;
            color: var(--theme-color);
            font-family: var(--font-family);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            background-color: transparent;
            border: none;
            font-size: var(--font-default-fontsize);
            outline: none;
        }

        .export_down-icon {
            width: 19px;
            height: 26px;
            border-radius: 4px;
            margin-right: 3px;
            display: flex;
            align-items: center;
            justify-content: center;

            >svg {
                width: 12px;
                height: 12px;
                color: #666666;
            }
        }
    }

    .delete {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);

        >svg {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background-color:  #F5F5F5;
        }
    }
}

.opacity {
    opacity: 0.3;
}</style>