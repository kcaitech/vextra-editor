<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
const emits = defineEmits<{
    (e: 'close'): void;
    (e: 'preinstall', v: string): void;
}>();

const defaultItem = () => {
    emits('preinstall', 'default');
    emits('close')
}
const iosPreinstall = () => {
    emits('preinstall', 'ios');
    emits('close')
}
const androidPreinstall = () => {
    emits('preinstall', 'android');
    emits('close')
}
const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.per_select_menu') && !e.target.closest('.cutout-preinstall') &&  emits('close');
}
onMounted(() => {
    document.addEventListener('click', handleClick);
})
onUnmounted(() => {
    document.removeEventListener('click', handleClick);
})
</script>

<template>
    <div class="per_select_menu" @click.stop>
        <div class="item" @click="defaultItem">
            <div class="text">默认</div>
        </div>
        <div class="item" @click="iosPreinstall">
            <div class="text">iOS预设</div>
        </div>
        <div class="item" @click="androidPreinstall">
            <div class="text">Android预设</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.per_select_menu {
    font-size: var(--font-default-fontsize);
    position: absolute;
    top: 25px;
    left: -100px;
    width: 122px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    z-index: 100;
    padding: 10px 0;

    .item {
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;

        .icon {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 3px;
        }

        .text {
            padding: 0 16px;
        }

        &:hover {
            background-color: var(--active-color);
            .text {
                color: #fff;
            }
        }
    }

    .choose {
        box-sizing: border-box;
        width: 10px;
        height: 6px;
        margin-left: 2px;
        border-width: 0 0 1px 1px;
        border-style: solid;
        border-color: rgb(0, 0, 0, .75);
        transform: rotate(-45deg) translateY(-30%);
    }
}

.active-item {
    background-color: var(--active-color);

    >.icon {
        >.choose {
            border-color: #fff;
        }
    }

    .text {
        color: #fff;
    }
}</style>