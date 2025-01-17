<script setup lang="ts">
import SvgIcon from '@/components/common/SvgIcon.vue';
import { Context } from '@/context';
import { hidden_selection } from '@/utils/content';
import { get_actions_blur_modify } from '@/utils/shape_style';
import { Blur, BlurType, ShapeView } from '@kcdesign/data';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import down_icon from '@/assets/icons/svg/down.svg';

interface Emits {
    (e: "select", type: BlurType): void;
}

const { t } = useI18n();
const emits = defineEmits<Emits>();
const props = defineProps<{
    context: Context
    blur: Blur
    shapes: ShapeView[]
    entry?: string
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
    const actions = get_actions_blur_modify(props.shapes, type);
    if (props.entry === 'style') {
        emits('select', type);
    } else {
        const page = props.context.selection.selectedPage
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.setShapeBlurType(actions);
        }
    }
    close();
    hidden_selection(props.context);
}

const handleClick = (e: MouseEvent) => {
    e.target instanceof Element && !e.target.closest('.blur-position') && close();
}

</script>

<template>
    <div class="blur-position">
        <div class="context" @click="showMenu">{{ t(`blur.${blur.type}`) }}</div>
        <div class="down" @click="showMenu" :class="{ 'active-down': isMenu }">
            <SvgIcon :icon="down_icon"/>
        </div>
        <div class="select_menu" ref="menu" v-if="isMenu">
            <div ref="items" v-for="(item, index) in blurOptions" :key="index" class="item" @click.stop="toggleType(item)"
                :class="{ 'active-item': activeItem === item }">
                <div class="text">{{ t(`blur.${item}`) }}</div>
                <svg v-if="activeItem === item" class="check" xmlns="http://www.w3.org/2000/svg" width="8.8"
                    height="6.3" viewBox="0 0 15 10.833333969116211">
                    <path
                        d="M14.7559,0.244078C15.0813,0.569514,15.0813,1.09715,14.7559,1.42259C14.7559,1.42259,5.58926,10.5893,5.58926,10.5893C5.26382,10.9147,4.73618,10.9147,4.41074,10.5893C4.41074,10.5893,0.244077,6.42259,0.244077,6.42259C-0.0813592,6.09715,-0.0813592,5.56952,0.244077,5.24408C0.569514,4.91864,1.09715,4.91864,1.42259,5.24408C1.42259,5.24408,5,8.8215,5,8.8215C5,8.8215,13.5774,0.244078,13.5774,0.244078C13.9028,-0.0813593,14.4305,-0.0813593,14.7559,0.244078C14.7559,0.244078,14.7559,0.244078,14.7559,0.244078Z"
                        fill-rule="evenodd" fill="inherit" fill-opacity="1" />
                </svg>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.blur-position {
    flex: 1;
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

        >svg {
            width: 12px;
            height: 12px;
        }
    }

    .select_menu {
        position: absolute;
        left: 0;
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
            padding: 0 8px;
        }

        .item:hover {
            background-color: var(--active-color);

            svg {
                fill: #fff;
            }

            .text {
                color: #fff;
            }
        }

    }
}

.active-down {
    background-color: rgba(0, 0, 0, 0.09);
}
</style>