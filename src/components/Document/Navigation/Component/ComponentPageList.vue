<script setup lang="ts">
import { Context } from '@/context';
import { ref } from 'vue';

const props = defineProps<{
    context: Context
    samll?: string
}>();
const thumbnail_bgc = ref<any>('rgba(1, 239, 239, 239)');
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
    <div class="container">
        <div class="component" :style="{ height: samll === 'samll' ? '30px' : '50px' }">
            <div class="thumbnail"
                :style="{ 'background-color': thumbnail_bgc ? thumbnail_bgc : 'rgba(1, 239, 239, 239)', width: samll === 'samll' ? '30px' : '50px' }">
            </div>
            <span class="name">设置图标</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    padding-right: 5px;
    box-sizing: border-box;
}

.component {
    display: flex;
    align-items: center;
    padding: 2px 0 2px 2px;
    width: 100%;
    border-radius: 4px;

    &:hover {
        background-color: #e5dbff;

        .thumbnail {
            opacity: .5;
        }
    }

    .thumbnail {
        border-radius: 4px;
        height: 100%;
        margin-right: 10px;
    }

    .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.active {
    border: 2px solid var(--active-color);
}</style>