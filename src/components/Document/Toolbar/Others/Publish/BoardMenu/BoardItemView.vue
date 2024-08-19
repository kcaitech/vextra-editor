<script setup lang="ts">
import { BoardLoader, BoardMenuItem } from "@/components/Document/Toolbar/Others/Publish/BoardMenu/boardLoader";
import ShapeCard from "@/components/common/ShapeCard.vue";

const props = defineProps<{
    data: BoardMenuItem;
    lister: BoardLoader;
}>();
</script>
<template>
<div style="width: 100%">
    <div
        style="width: 100%; height: 28px;
        font-size: 12px;color: #000; font-weight: 500;
        white-space: nowrap; cursor: pointer; display: flex; align-items: center;gap: 8px;"
        @click="() => lister.fold(data.page)"
    >
        <span>{{ data.page.name }}</span>
        <svg-icon v-if="data.fold && data.selected" style="width: 12px; height: 12px;"
                  icon-class="comment-solved"/>
        <div
            style="width: 16px; height: 16px; padding: 4px; display: flex; justify-content: center; align-items: center;margin-left: auto;">
            <svg-icon icon-class="down"
                      :style="{width: '12px', height: '12px',transition: '0.1s', transform: data.fold ? 'rotate(-90deg)': ''}"/>
        </div>

    </div>
    <div v-if="!data.fold"
         style="display: grid; column-gap: 8px; row-gap: 8px;grid-template-columns: repeat(auto-fill, 100px);">
        <div v-for="board in data.boards" :key="board.id"
             style="position: relative;width: 100px; height: 100px; background-color: #efefef;cursor: pointer; border: 1px solid #f0f0f0;
                border-radius: 4px;"
             @click="() => lister.selected(data.page, board)"
        >
            <ShapeCard :shape="board"/>
            <div v-if="data.selected?.id === board.id"
                 style="position: absolute;width: 100%; height: 100%;background-color: rgba(255, 255, 255, 0.3); top: 0;">
                <svg-icon style="position: absolute; top: 6px; right: 6px;width: 12px; height: 12px;"
                          icon-class="comment-solved"/>
            </div>
        </div>
    </div>
</div>
</template>
<style scoped lang="scss">

</style>