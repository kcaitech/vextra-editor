<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
type commentListMenu = {
    text: string
    status_p: boolean
}
const props = defineProps<{
    Items: commentListMenu[]
}>()
const emit = defineEmits<{
    (e:'close'): void
    (e: 'commentMenuStatus', status: boolean, index: number): void
}>()
const i = ref(-1)

const hoverShape = (e: MouseEvent, index: number) => {
    e.stopPropagation()
    i.value = index
}

const unHoverShape = (e: MouseEvent, index: number) => {
    e.stopPropagation()
    i.value = -1
}
const handleClick = (e: Event) => {
  e.stopPropagation()
  e.target instanceof Element && !e.target.closest('.menu-container') && emit('close');
}

const onClick = (index: number, status: boolean) => {
    emit('commentMenuStatus', !status, index)
}

onMounted(() => {  
  document.addEventListener('click', handleClick);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick);
})
</script>

<template>
    <div class="menu-container">
        <template v-for="(item, index) in props.Items" :key="index">
            <div class="menu-item" :class="{active: i === index}" @mouseenter="(e: MouseEvent) => hoverShape(e, index)" @mouseleave="(e: MouseEvent) => unHoverShape(e, index)" @click="onClick(index,item.status_p)">
                <div class="choose" :style="{visibility: item.status_p ? 'visible' : 'hidden'}" :class="{choose_active: i === index}"></div>
                <div>{{ item.text }}</div>
            </div>
            <div class="line" v-if="index === 0"></div>
        </template>
    </div>
</template>

<style scoped lang="scss">
    .menu-container {
        position: absolute;
        top: 32px;
        right: 12px;
        width: 150px;
        font-size: var(--font-default-fontsize);
        padding: 4px 0;
        background-color: #fff;
        border: 1px solid #EBEBEB;
        border-radius: 6px;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    }
    .menu-item {
        display: flex;
        align-items: center;
        height: 32px;
        padding: 0 var(--default-padding-half);
        
    }
    .choose {
        box-sizing: border-box;
        width: 10px;
        height: 6px;
        margin-right: 10px;
        margin-left: 2px;
        border-width: 0 0 1px 1px;
        border-style: solid;
        border-color: rgb(0, 0, 0,.75);
        transform: rotate(-45deg) translateY(-30%);
    }
    .line {
        width: 100%;
        height: 11px;
        border-width: 5px 0 5px 0;
        border-style: solid;
        border-color: #fff;
        box-sizing: border-box;
        background-color:  rgb(0, 0, 0,.05);
    }
    .active {
        background-color: var(--active-color);
        color: #fff;
    }
    .choose_active {
        border-color:rgb(255,255,255,.8)
    }
</style>