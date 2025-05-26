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
import ComponentListView from './ComponentListView.vue';
import { onMounted, ref } from 'vue';
import { Context } from '@/context';
import { SymbolListItem } from '@/utils/symbol';
import ComponentCollapseItemTitle from './ComponentCollapseItemTitle.vue';
import Position from "@/components/Document/Attribute/PopoverMenu/Position.vue";
import SvgIcon from "@/components/common/SvgIcon.vue";
import JionTeam from "@/components/TeamProject/jionTeam.vue";

interface Props {
    context: Context
    title: string
    data: SymbolListItem
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
    emits("change-status", props.data.id);
}
function init() {
    if (!props.data.isFolder) return;
    fold.value = !props.status_set.has(props.data.id);
}
onMounted(init);

import triangle_icon from '@/assets/icons/svg/triangle-icon.svg';
</script>
<template>
    <div v-if="props.data.isFolder" class="component-lib-collapse" @click.stop="toggle">
        <div class="component-lib-collapse-title">
            <div class="fold">
                <SvgIcon :icon="triangle_icon" :style="{ transform: `rotate(${fold ? '-90deg' : '0deg'})` }"/>
            </div>
            <!-- <div class="triangle">
                <div :class="fold ? 'triangle-right' : 'triangle-down'"></div>
            </div> -->
            <ComponentCollapseItemTitle :data="props.data"></ComponentCollapseItemTitle>
        </div>
    </div>
    <ComponentListView v-else :context="props.context" :data="props.data.symbols" :container="props.container"
        :is-attri="props.isAttri" :card-type="props.cardType">
    </ComponentListView>
</template>
<style scoped lang="scss">
.component-lib-collapse {
    .component-lib-collapse-title {
        width: 100%;
        height: 32px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        .fold {
            display: flex;
            width: 14px;
            align-items: center;
            justify-content: center;
            height: 14px;
            svg {
                width: 14px;
                height: 14px;
                transition: all 0.3s;
            }
        }

    }

}
</style>