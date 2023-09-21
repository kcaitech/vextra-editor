<script setup lang="ts">
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
const props = defineProps<{ context: Context }>();
import { ref } from 'vue';
const thumbnail_bgc = ref<any>();
function getThumbnailBgc() {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const f = page.style.fills[0];
    if (!f) {
        thumbnail_bgc.value = 'rgba(1, 239, 239, 239)'
    } else {
        const r = f.color.red;
        const g = f.color.green;
        const b = f.color.blue;
        const a = f.color.alpha;
        thumbnail_bgc.value = `rgba(${r}, ${g}, ${b}, ${a})`
    }
}
getThumbnailBgc()
</script>
<template>
    <div class="component">
        <Tooltip :content="`组件1`">
            <div class="thumbnail"
                :style="{ 'background-color': thumbnail_bgc ? thumbnail_bgc : 'rgba(1, 239, 239, 239)' }"></div>
        </Tooltip>
    </div>
</template>

<style lang="scss" scoped>
.component {
    width: 100px;
    height: 100px;
    margin-right: 15px;
    margin-top: 10px;
    border-radius: 4px;
    box-sizing: border-box;

    .thumbnail {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        box-sizing: border-box;
        &:hover {
            border: 2px solid var(--active-color);
        }
    }
}

.active {
    border: 2px solid var(--active-color);
}
</style>