<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import ArgsSelect from './ArgsSelect.vue';
import { Context } from '@/context';
import { ExportFormatNameingScheme, ShapeView } from '@kcdesign/data';
import { Menu } from '@/context/menu';
import { FormatItems } from './index.vue';
import { useI18n } from 'vue-i18n';
import { get_actions_export_format_name, get_actions_export_format_scale } from '@/utils/shape_style';
import { compareArrays } from '@/utils/cutout'
import SvgIcon from '@/components/common/SvgIcon.vue';

const { t } = useI18n();

interface Props {
    context: Context
    shapes: ShapeView[]
    argus: FormatItems
    sizeItems: string[]
    perfixItems: ExportFormatNameingScheme[]
    formatItems: string[]
    index: number
    length: number
}

const props = defineProps<Props>();
const emits = defineEmits<{
    (e: 'changePerfix', index: number, argsi: number): void;
    (e: 'changeFormat', index: number, argsi: number): void;
    (e: 'delete', index: number): void;
}>();
const showCutoutSize = ref(false);
const showCutoutPerfix = ref(false);
const showCutoutFormat = ref(false);
const cutout_size_input = ref<HTMLDivElement>();
const cutout_perfix_input = ref<HTMLDivElement>();
const cutout_format_input = ref<HTMLDivElement>();
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
    sizeMenuItems = props.sizeItems;
    showCutoutSize.value = true;

    props.context.escstack.save('showCutoutSizeMenu', () => {
        const achieve = showCutoutSize.value;
        showCutoutSize.value = false;
        return achieve;
    })
};
const showCutoutPerfixMenu = () => {
    if (showCutoutPerfix.value) return showCutoutPerfix.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    perMenuItems = props.perfixItems;
    showCutoutPerfix.value = true;

    props.context.escstack.save('showCutoutPerfixMenu', () => {
        const achieve = showCutoutPerfix.value;
        showCutoutPerfix.value = false;
        return achieve;
    })
};
const showCutoutFormatMenu = () => {
    if (showCutoutFormat.value) return showCutoutFormat.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    formatMenuItems = props.formatItems;
    showCutoutFormat.value = true;

    props.context.escstack.save('showCutoutFormatMenu', () => {
        const achieve = showCutoutFormat.value;
        showCutoutFormat.value = false;
        return achieve;
    })
};
const selectSize = (i: number) => {
    sizeValue.value = props.sizeItems[i];
    const sleecteds = props.context.selection.selectedShapes;
    changeSize(props.sizeItems[i], props.index, sleecteds);
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
const nameValue = ref('');
const changeName = () => {
    const sleecteds = props.context.selection.selectedShapes;
    const is_same = compareArrays(sleecteds, shapes.value as ShapeView[]);
    const value = nameValue.value;
    changeExportName(value, props.index, shapes.value as ShapeView[]);
    if (nameInput.value && is_same) {
        sizeValue.value = props.argus.format.name;
        nameInput.value.value = sizeValue.value;
    }
}

const changeExportName = (value: string, idx: number, shapes: ShapeView[]) => {
    const _idx = props.length - idx - 1;
    const len = shapes.length;
    if (len === 1) {
        const shape = shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportFormatName(_idx, value);
    } else if (len > 1) {
        const actions = get_actions_export_format_name(shapes, _idx, value);
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatName(actions);
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setPageExportFormatName(_idx, value);
        }
    }
}
const scaleInput = ref<HTMLInputElement>();
const scaleValue = ref('');
const shapes = ref<ShapeView[]>([])
const changeScale = () => {
    const sleecteds = props.context.selection.selectedShapes;
    const is_same = compareArrays(sleecteds, shapes.value as ShapeView[]);
    const regex = /^(\d+|(\d+)x)$/;
    const value = scaleValue.value;
    if (regex.test(value)) {
        changeSize(value, props.index, shapes.value as ShapeView[]);
    }
    if (scaleInput.value && (is_same || !regex.test(value))) {
        sizeValue.value = props.argus.format.scale + 'x';
        scaleInput.value.value = sizeValue.value;
    }
}
const handleScaleInput = () => {
    const value = scaleInput.value!.value;
    scaleValue.value = value;
}
const changeSize = (value: string, idx: number, shapes: ShapeView[]) => {
    const _idx = props.length - idx - 1;
    const len = shapes.length;
    if (len === 1) {
        const shape = shapes[0];
        const editor = props.context.editor4Shape(shape);
        editor.setExportFormatScale(_idx, parseFloat(value));
    } else if (len > 1) {
        const actions = get_actions_export_format_scale(shapes, _idx, parseFloat(value));
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapesExportFormatScale(actions);
        }
    } else {
        const page = props.context.selection.selectedPage;
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setPageExportFormatScale(_idx, parseFloat(value));
        }
    }
}
const scaleInputBlur = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (scaleInput.value) {
            scaleInput.value.blur();
        }
    }
}
const nameInputBlur = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (nameInput.value) {
            nameInput.value.blur();
        }
    }
}
const handleNameInput = () => {
    const value = nameInput.value!.value;
    nameValue.value = value;
}

const selectScale = () => {
    if (scaleInput.value) {
        shapes.value = [...props.context.selection.selectedShapes];
    }
}

const selectName = () => {
    if (nameInput.value) {
        shapes.value = [...props.context.selection.selectedShapes];
    }
}

const is_size_select = ref(false);
function clickSize(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_size_select.value) return;
    el.select();
    is_size_select.value = true;
}

const is_presuffix_select = ref(false);
function clickPresuffix(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_presuffix_select.value) return;
    el.select();
    is_presuffix_select.value = true;
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
    if (props.argus.format.name || props.argus.format.name === '') {
        name.value = props.argus.format.name;
    }
})

import down_icon from '@/assets/icons/svg/down.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
</script>

<template>
    <div class="args_container">
        <div class="format">
            <div class="cutout_size_input cutout_export_input" ref="cutout_size_input">
                <input :value="sizeValue" ref="scaleInput" @change="changeScale" @focus="selectScale" @click="clickSize"
                    @input="handleScaleInput" @keyup="scaleInputBlur" @blur="is_size_select = false">
                <div class="export_down-icon size" @click.stop="showCutoutSizeMenu">
                    <SvgIcon :icon="down_icon"/>
                </div>
                <ArgsSelect v-if="showCutoutSize" :context="props.context" :menuItems="sizeMenuItems" :width="60"
                    :selectValue="sizeValue" @close="showCutoutSize = false" @select="selectSize">
                </ArgsSelect>
            </div>
            <div class="cutout_presuffix_input cutout_export_input" ref="cutout_perfix_input">
                <input class="presuffix_input" :placeholder="t(`cutoutExport.${perfixValue}`)" ref="nameInput"
                    @focus="selectName" :value="name" @change="changeName" @input="handleNameInput"
                    @click="clickPresuffix" @keyup="nameInputBlur" @blur="is_presuffix_select = false">
                <div class="export_down-icon presuffix" @click.stop="showCutoutPerfixMenu">
                    <SvgIcon :icon="down_icon"/>
                </div>
                <ArgsSelect v-if="showCutoutPerfix" :context="props.context" :menuItems="perMenuItems" :width="70"
                    :selectValue="perfixValue" :i18n="true" @close="showCutoutPerfix = false" @select="selectPerfix">
                </ArgsSelect>
            </div>
            <div class="cutout_format_input cutout_export_input" ref="cutout_format_input">
                <div class="span" @click.stop="showCutoutFormatMenu">{{ formatValue }}</div>
                <div class="export_down-icon format-i" @click.stop="showCutoutFormatMenu">
                    <SvgIcon :icon="down_icon"/>
                </div>
                <ArgsSelect v-if="showCutoutFormat" :context="props.context" :menuItems="formatMenuItems" :width="60"
                    :selectValue="formatValue" @close="showCutoutFormat = false" @select="selectFormat"></ArgsSelect>
            </div>
        </div>
        <div class="delete" @click="deleteItem">
            <!-- :class="{ opacity: props.shapes.length === 1 && props.shapes[0].type === ShapeType.Cutout }"> -->
            <SvgIcon :icon="delete_icon"/>
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
            background-color: #F5F5F5;
        }
    }
}

.opacity {
    opacity: 0.3;
}
</style>