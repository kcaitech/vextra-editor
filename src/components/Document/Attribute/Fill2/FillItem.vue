<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import select_icon from "@/assets/icons/svg/select.svg";
import delete_icon from "@/assets/icons/svg/delete.svg";

import { Context } from "@/context";
import { FillCatch, FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { onUpdated, ref } from "vue";
import { selectAllOnFocus } from "@/components/Document/Attribute/Fill2/basic";

type Props = {
    context: Context;
    manager: FillContextMgr;
    data: FillCatch;
}
const props = defineProps<Props>();

const colorHex = ref<string>(props.data.fill.color.toHex().slice(1));
const alpha = ref<string>(props.data.fill.color.alpha * 100 + '%');

function update() {
    colorHex.value = props.data.fill.color.toHex().slice(1);
    alpha.value = props.data.fill.color.alpha * 100 + '%';
}

onUpdated(update);
</script>
<template>
    <div class="fill-item-container">
        <div :class="`display ${data.fill.isEnabled ? 'visibility' : 'hidden'}`">
            <SvgIcon v-if="data.fill.isEnabled" :icon="select_icon"/>
        </div>
        <div class="value-panel-wrapper">
            <div class="color"/>
            <input type="text" :value="colorHex" :spellcheck="false"
                   @focus="selectAllOnFocus"
                   @change="(e) => manager.modifyFillHex(e, data.fill)"/>
            <input type="text" :value="alpha" @focus="selectAllOnFocus"
                   @change="(e) => manager.modifyFillAlpha(e, data.fill)"/>
        </div>
        <div class="delete" @click="manager.remove">
            <SvgIcon :icon="delete_icon"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.fill-item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 4px;

    .display {
        display: flex;
        justify-content: center;
        align-items: center;

        flex: 0 0 14px;
        width: 14px;
        height: 14px;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .visibility {
        background-color: var(--active-color);
        color: #ffffff;

        > img {
            width: 60%;
            height: 60%;
        }
    }

    .hidden {
        background: #FFFFFF;
        border: 1px solid #EBEBEB;
    }

    .value-panel-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        flex: 1;
        height: 32px;
        padding: 0 8px;
        box-sizing: border-box;
        background-color: var(--input-background);
        border-radius: var(--default-radius);

        .color {
            width: 16px;
            height: 16px;
            border: 1px solid grey;
        }

        input {
            flex: 1;
            width: 46px;
            outline: none;
            border: none;
            background-color: transparent;
            height: 14px;
            font-size: 12px;
            box-sizing: border-box;
        }

        input + input {
            flex: 0 0 46px;
            width: 46px;
        }
    }

    .delete {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);
        transition: .2s;

        > img {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background-color: #F5F5F5;
        }
    }
}
</style>