/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ComponentCollapseItem from './ComponentCollapseItem.vue';
import { Context } from '@/context';
import { SymbolListItem } from '@/utils/symbol';
import SvgIcon from '@/components/common/SvgIcon.vue';

interface Props {
    context: Context
    title: string
    data: SymbolListItem[]
    extend: boolean
    container: Element | null
    status_set: Set<string>
    isAttri: boolean
    cardType: 'alpha' | 'beta'
}

interface Emits {
    (e: 'change-status', id: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const fold = ref<boolean>(true);

function toggle() {    
    fold.value = !fold.value;
}

function change_status(id: string) {
    emits("change-status", id)
}

onMounted(() => {
    if (props.extend) toggle();
})
import down_icon from '@/assets/icons/svg/down.svg';
</script>
<template>
    <div class="component-lib-collapse" @click="toggle">
        <div class="component-lib-collapse-title">
            <span>{{ props.title }}</span>
            <div class="shrink">
                <SvgIcon :icon="down_icon" :style="{ transform: fold ? 'rotate(-90deg)' : 'rotate(0deg)' }"/>
            </div>
        </div>
        <div class="component-lib-collapse-content" v-show="!fold" @click.stop>
            <component :is="ComponentCollapseItem" v-for="item in props.data" :title="item.title" :data="item"
                :container="props.container" :key="item.id + item.title" :context="props.context"
                :status_set="props.status_set" :is-attri="props.isAttri" :card-type="props.cardType"
                @change-status="change_status">
            </component>
        </div>
    </div>
</template>
<style scoped lang="scss">
.component-lib-collapse {
    .component-lib-collapse-title {
        width: 100%;
        height: 32px;
        // transition: 0.1s;
        // border-radius: 4px;
        display: flex;
        align-items: center;
        // padding: 0 4px;
        box-sizing: border-box;
        justify-content: space-between;
        // position: relative;
        padding: 0 12px;

        >span {
            font-weight: 500;
        }

        .shrink {
            // position: absolute;
            // right: 0px;
            display: flex;
            padding: 1px;
            height: 14px;
            width: 14px;
            box-sizing: border-box;

            svg {
                width: 100%;
                height: 100%;
            }
        }

        &:hover{
            background-color:#F5F5F5;
        }
    }


    .component-lib-collapse-content {
        padding: 0 12px;
    }
}
</style>