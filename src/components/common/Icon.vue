/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { computed } from "@vue/reactivity";
const props = defineProps<{ valid: boolean, selected: boolean, onclick: Function, icon: string }>();
const maskcss = computed(() => {
    return "url(" + props.icon + ")";
})
</script>

<template>
    <div class="iconwrap" v-on:click="onclick()">
        <div v-if="selected" class="selected"></div>
        <div :class="{ icon: true, invalid: !valid, selected }"></div>
    </div>
</template>

<style scoped>
div.iconwrap {
    position: relative;
    width: 20px;
    height: 20px;
}

div.icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    mask: v-bind(maskcss) no-repeat center / 100%;
}

div.icon:hover {
    background-color: blue;
}

div.selected {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: yellow;
}

div.icon.invalid {
    background-color: gray;
}
</style>