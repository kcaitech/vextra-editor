/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { SymbolShape } from "@kcaitech/vextra-core";
import ShapeCard from "@/components/common/ShapeCard.vue";

interface Props {
    data: SymbolShape
}
const props = defineProps<Props>();
</script>
<template>
    <div class="compo-preview-container">
        <ShapeCard :shape="props.data" class="render-wrap" :size="96"></ShapeCard>
    </div>
</template>
<style scoped lang="scss">
.compo-preview-container {
    width: 100px;
    height: 100px;

    .render-wrap {
        margin-top: 2px;
        margin-left: 2px;
    }
}
</style>