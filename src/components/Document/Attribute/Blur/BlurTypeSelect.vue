<script setup lang="ts">
import { Context } from '@/context';
import { hidden_selection } from '@/utils/content';
import { get_actions_blur_modify } from '@/utils/shape_style';
import { Blur, BlurType, ShapeView } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
    context: Context
    blur: Blur
    shapes: ShapeView[]
}>();
const isMenu = ref(false);
const menu = ref<HTMLDivElement>();
const blurOptions = [
    BlurType.Gaussian,
    BlurType.Background,
];
const items = ref<HTMLDivElement[]>();
const activeItem = ref(props.blur.type);
const showMenu = () => {
    if (isMenu.value) return isMenu.value = false;
    activeItem.value = props.blur.type;
    isMenu.value = true;
    nextTick(() => {
        if (menu.value && items.value) {
            const index = blurOptions.findIndex(item => item === activeItem.value);
            menu.value.style.top = `${-items.value[index].offsetTop}px`;
        }
    })
    document.addEventListener('click', handleClick);
}

const close = () => {
    isMenu.value = false;
    document.removeEventListener('click', handleClick);
}

const toggleType = (type: BlurType) => {
    // if (type === BlurType.Background) return;
    const actions = get_actions_blur_modify(props.shapes, type);
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapeBlurType(actions);
    }
    hidden_selection(props.context);
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
        <svg-icon icon-class="down"/>
    </div>
    <div class="select_menu" ref="menu" v-if="isMenu">
        <div ref="items" v-for="(item, index) in blurOptions" :key="index" class="item" @click="toggleType(item)"
             :class="{ 'active-item': activeItem === item }">
            <div class="text">{{ t(`blur.${item}`) }}</div>
            <div class="icon">
                <svg-icon v-if="blur.type === item"
                          :icon-class="activeItem === item ? 'white-select' : 'page-select'" />
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
    color: #000000;

    &:hover {
        .down {
            background-color: rgba(0, 0, 0, 0.09);
        }
    }

    .context {
        flex: 1;
        height: 100%;
        padding-left: 8px;
        display: flex;
        align-items: center;
    }

    .down {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        > svg {
            width: 12px;
            height: 12px;
        }
    }

    .select_menu {
        position: absolute;
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

                > svg {
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

    > .icon {
        > .choose {
            border-color: #fff;
        }
    }

    .text {
        color: #fff;
    }
}
</style>