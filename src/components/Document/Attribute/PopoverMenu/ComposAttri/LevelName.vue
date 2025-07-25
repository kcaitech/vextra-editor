/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { ShapeView, ShapeType } from "@kcaitech/vextra-core";
import { onMounted, ref } from "vue";

interface Props {
    data: ShapeView
}

const props = defineProps<Props>();

const slices = ref<string[]>([]);

function montage() {
    slices.value.length = 0;
    let p = props.data.parent;
    while (p && p.type !== ShapeType.Symbol) {
        slices.value.unshift(p.name);
        p = p.parent;
    }

}

onMounted(montage);
</script>
<template>
<div class="wrapper">
    <div v-for="(s, i) in slices" :key="i" class="prefix">
        <div>{{ s }}</div>
        <div class="split"> /</div>
    </div>
    <div>{{ props.data.name }}</div>
</div>
</template>
<style scoped lang="scss">
.wrapper {
    display: flex;
    align-items: center;
    font-size: var(--font-default-fontsize);

    > .prefix {
        display: flex;
        align-items: center;
        color: var(--grey-dark);

        > div {
            white-space: pre;
        }

        > .split {
            font-weight: 900;
        }
    }

    div {
        color: #262626;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

}
</style>