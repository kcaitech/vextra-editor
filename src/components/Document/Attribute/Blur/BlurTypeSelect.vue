<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { Blur, BlurType, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
    context: Context
    blur: Blur
    shapes: ShapeView[]
}>();
const isMenu = ref(false);
const activeItem = ref(props.blur.type);
const showMenu = () => {
    if (isMenu.value) return isMenu.value = false;
    activeItem.value = props.blur.type;
    isMenu.value = true;
    document.addEventListener('click', handleClick);
}

const close = () => {
    isMenu.value = false;
    document.removeEventListener('click', handleClick);
}

const toggleType = (type: BlurType) => {

}

const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.target instanceof Element && !e.target.closest('.shadow-position') && close();
}

const menu_watcher = (t: number) => {

}

onMounted(() => {
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    props.context.menu.unwatch(menu_watcher);
})
</script>

<template>
    <div class="blur-position">
        <div class="context" @click.stop="showMenu">{{ t(`blur.${blur.type}`) }}</div>
        <div class="down" @click.stop="showMenu" :class="{ 'active-down': isMenu }">
            <svg-icon icon-class="down" />
        </div>
        <div class="select_menu" v-if="isMenu" >
            <div class="item" @click="toggleType(BlurType.Gaussian)" @mouseenter="activeItem = BlurType.Gaussian"
                :class="{ 'active-item': activeItem === BlurType.Gaussian }">
                <div class="text">{{ t(`blur.${BlurType.Gaussian}`) }}</div>
                <div class="icon">
                    <svg-icon v-if="blur.type === BlurType.Gaussian"
                        :icon-class="activeItem === BlurType.Gaussian ? 'white-select' : 'page-select'"></svg-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.blur-position {
    font-size: 12px;
    position: relative;
    background-color: #F4F5F5;
    height: 32px;
    border-radius: var(--default-radius);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 9px 8px;
    color: #000000;

    &:hover {
        .down {
            background-color: rgba(0, 0, 0, 0.09);
        }
    }

    .context {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
    }

    .down {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        // margin-right: 3px;
        display: flex;
        align-items: center;
        justify-content: center;

        >svg {
            width: 12px;
            height: 12px;
        }
    }

    .select_menu {
        position: absolute;
        top: -4px;
        left: 0px;
        width: 100%;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        z-index: 100;
        padding: 6px 0;

        .item {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 32px;
            padding-left: 10px;

            .icon {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;

                >svg {
                    width: 12px;
                    height: 12px;
                }
            }
        }

    }
}

.active-down {
    background-color: rgba(0, 0, 0, 0.09);
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