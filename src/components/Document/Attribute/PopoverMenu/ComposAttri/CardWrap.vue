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
import LevelName from "@/components/Document/Attribute/PopoverMenu/ComposAttri/LevelName.vue";
import {ShapeView} from "@kcdesign/data";
import {onMounted, onUnmounted, ref} from "vue";
import ShapeCard from "@/components/common/ShapeCard.vue";

interface Props {
    data: ShapeView
    container: Element | null
}

const props = defineProps<Props>();
const real = ref<boolean>(false);
const wrapper = ref<HTMLDivElement>();
const options = {
    root: props.container,
    rootMargin: '0px 0px 0px 0px',
    thresholds: 1,
}

function intersection(entries: any) {
    real.value = Boolean(entries[0]?.isIntersecting);
}

const io = new IntersectionObserver(intersection, options);
onMounted(() => {
    if (props.container && wrapper.value) {
        io.observe(wrapper.value);
    } else {
        real.value = true;
        console.log('No IntersectionObserver Api');
    }
})
onUnmounted(() => {
    io.disconnect();
})
</script>
<template>
    <div class="wrapper" ref="wrapper">
        <div class="component" v-if="real">
            <div class="thumbnail">
                <ShapeCard :shape="props.data" :size="28"></ShapeCard>
            </div>
            <LevelName :data="props.data" class="name"></LevelName>
        </div>
        <div v-else class="space"></div>
    </div>
</template>
<style scoped lang="scss">
.wrapper {
    width: 100%;
    height: 100%;

    .component {
        display: flex;
        align-items: center;
        padding: 2px 0 2px 2px;
        width: 100%;
        height: 32px;
        box-sizing: border-box;

        .svg {
            width: 10px;
            height: 10px;
            margin-right: 5px;
        }

        .thumbnail {
            border-radius: 2px;
            height: 30px;
            width: 30px;
            margin-right: 4px;
            box-sizing: border-box;
            border: 1px solid var(--grey-light);
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
            background-size: auto 25%;
            position: relative;
        }

        .name {
            max-width: calc(100% - 42px);
            overflow: hidden;
        }
    }

    .space {
        width: 100%;
        height: 30px;
    }
}

</style>