<script setup lang="ts">
import { ref } from 'vue';
import ArgsSelect from './ArgsSelect.vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data';
import { Menu } from '@/context/menu';
type Argus = {
    size: string,
    value: string,
    prefix: string,
    format: string
}
interface Props {
    context: Context
    shapes: Shape[]
    argus: Argus
    sizeItems: string[]
    perfixItems: string[]
    formatItems: string[]
    index: number
}
const props = defineProps<Props>();
const emits = defineEmits<{
    (e: 'changeSize', index: number, argsi: number): void;
    (e: 'changePerfix', index: number, argsi: number): void;
    (e: 'changeFormat', index: number, argsi: number): void;
    (e: 'delete', index: number): void;
}>();
const showCutoutSize = ref(false);
const showCutoutPerfix = ref(false);
const showCutoutFormat = ref(false);
let menuItems: string[] = [];

const sizeValue = ref(props.argus.size);
const perfixValue = ref(props.argus.prefix);
const formatValue = ref(props.argus.format);
const showCutoutSizeMenu = () => {
    if(showCutoutSize.value) return showCutoutSize.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    menuItems = props.sizeItems;
    showCutoutSize.value = true;
};
const showCutoutPerfixMenu = () => {
    if(showCutoutPerfix.value) return showCutoutPerfix.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    menuItems = props.perfixItems;
    showCutoutPerfix.value = true;
};
const showCutoutFormatMenu = () => {
    if(showCutoutFormat.value) return showCutoutFormat.value = false;
    props.context.menu.notify(Menu.SHADOW_CUTOUT_ARGS_MENU);
    menuItems = props.formatItems;
    showCutoutFormat.value = true;
};
const selectSize = (i: number) => {
    sizeValue.value = props.sizeItems[i];
    emits('changeSize', i, props.index);
}
const selectPerfix = (i: number) => {
    perfixValue.value = props.perfixItems[i];
    emits('changePerfix', i, props.index);
}
const selectFormat = (i: number) => {
    formatValue.value = props.formatItems[i];
    emits('changeFormat', i, props.index);
}
const deleteItem= () => {
    emits('delete', props.index);
}
</script>

<template>
    <div class="args_container">
        <div class="format">
            <div class="cutout_size_input cutout_export_input">
                <input :value="sizeValue">
                <div class="down-icon size" @click.stop="showCutoutSizeMenu">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <ArgsSelect v-if="showCutoutSize" :context="props.context" :menuItems="menuItems" :selectValue="sizeValue" @close="showCutoutSize = false" @select="selectSize"></ArgsSelect>
            </div>
            <div class="cutout_presuffix_input cutout_export_input">
                <input :placeholder="perfixValue">
                <div class="down-icon presuffix" @click.stop="showCutoutPerfixMenu">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <ArgsSelect v-if="showCutoutPerfix" :context="props.context" :menuItems="menuItems" :selectValue="perfixValue" @close="showCutoutPerfix = false" @select="selectPerfix"></ArgsSelect>
            </div>
            <div class="cutout_format_input cutout_export_input">
                <div class="span" @click.stop="showCutoutFormatMenu">{{ formatValue }}</div>
                <div class="down-icon format-i"  @click.stop="showCutoutFormatMenu">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <ArgsSelect v-if="showCutoutFormat" :context="props.context" :menuItems="menuItems" :selectValue="formatValue" @close="showCutoutFormat = false" @select="selectFormat"></ArgsSelect>
            </div>
        </div>
        <div class="delete" @click="deleteItem">
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
    margin-top: 5px;

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
            width: 62px;
            height: 30px;
            padding: 1px;
            align-items: center;
            padding-left: 5px;
            padding-right: 2px;
            box-sizing: border-box;
            background-color: rgba(#000, 0.04);
            border-radius: 4px;

            &:hover {
                .size {
                    background-color: rgba(0, 0, 0, 0.08);
                }
            }

        }

        .cutout_presuffix_input {
            position: relative;
            display: flex;
            width: 75px;
            height: 30px;
            padding: 1px;
            align-items: center;
            padding-left: 5px;
            padding-right: 2px;
            box-sizing: border-box;
            background-color: rgba(#000, 0.04);
            border-radius: 4px;

            &:hover {
                .presuffix {
                    background-color: rgba(0, 0, 0, 0.08);
                }
            }
        }

        .cutout_format_input {
            position: relative;
            display: flex;
            width: 65px;
            height: 30px;
            padding: 1px;
            align-items: center;
            padding-left: 5px;
            padding-right: 3px;
            box-sizing: border-box;
            background-color: rgba(#000, 0.04);
            border-radius: 4px;

            &:hover {
                .format-i {
                    background-color: rgba(0, 0, 0, 0.08);
                }
            }

            .span {
                width: 100%;
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
            width: 52%;
            height: 12px;
            flex: 1 1 auto;
            align-content: center;
            margin-left: 2px;
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

        .down-icon {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;

            >svg {
                width: 10px;
                height: 10px;
                color: grey;
            }
        }
    }

    .delete {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 22px;
        height: 22px;
        border-radius: 4px;

        >svg {
            width: 11px;
            height: 11px;
        }

        &:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    }
}
</style>