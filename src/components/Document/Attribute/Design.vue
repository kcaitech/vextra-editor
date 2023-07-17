<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { onMounted, onUnmounted, shallowRef, ref, computed, watchEffect } from 'vue';
import { ShapeType, Color, Shape, TextShape } from "@kcdesign/data"
import ColorPicker from '../../common/ColorPicker/index.vue';
import { useI18n } from 'vue-i18n';
import Arrange from './Arrange.vue';
import ShapeBaseAttr from './BaseAttr.vue';
import Fill from './Fill/Fill.vue';
import Border from './Border/Border.vue';
import Text from './Text/Text.vue';
import { throttle } from 'lodash';
const { t } = useI18n();
const props = defineProps<{ context: Context }>();
const shapes = shallowRef<Shape[]>([]);
const len = computed<number>(() => shapes.value.length);
const WITH_FILL = [ShapeType.Rectangle, ShapeType.Oval, ShapeType.Star, ShapeType.Polygon, ShapeType.Path, ShapeType.Artboard];
const WITH_TEXT = [ShapeType.Text];
const WITH_BORDER = [ShapeType.Image, ShapeType.Rectangle, ShapeType.Oval, ShapeType.Star, ShapeType.Polygon, ShapeType.Path, ShapeType.Artboard];
const shapeType = ref();
const bgcInput = ref<HTMLInputElement>()
const bgcOpacity = ref<HTMLInputElement>()

function _change(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shapes.value = [];
    } else if (t === Selection.CHANGE_SHAPE) {
        if (props.context.selection.selectedShapes.length === 1) {
            shapes.value = [props.context.selection.selectedShapes[0]];
            shapeType.value = shapes.value[0].type;
        } else if (props.context.selection.selectedShapes.length > 1) {
            shapes.value = [...props.context.selection.selectedShapes];
        } else {
            shapes.value = [];
        }
    }
}
const change = throttle(_change, 200);
function selectionChange(t: number) {
    change(t);
}
const selecValueBgc = () => {
    if(bgcInput.value) {
        bgcInput.value?.select()
    }
}
const selecValue = () => {
    if(bgcOpacity.value) {
        bgcOpacity.value?.select()
    }
}
const backgroundColor = ref<Color>()
watchEffect(() => {
    if (props.context.selection.selectedShapes.length === 1) {
        shapes.value = [props.context.selection.selectedShapes[0]];
        shapeType.value = shapes.value[0].type;
    } else if (props.context.selection.selectedShapes.length > 1) {
        shapes.value = [...props.context.selection.selectedShapes];
    } else {
        shapes.value = [];
    }
})

const getBackgroundColor = (color: Color) => {
    backgroundColor.value = color
}
watchEffect(() => {
    backgroundColor.value = new Color(1, 239, 239, 239)
})
onMounted(() => {
    props.context.selection.watch(selectionChange);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
})
</script>

<template>
    <section>
        <div v-if="len === 0" class="back-setting-container">
            <span>{{ t('attr.background') }}</span>
            <div class="setting">
                <ColorPicker class="color" :color="backgroundColor!" :context="props.context" @change="c => getBackgroundColor(c)"></ColorPicker>
                <input ref="bgcInput" type="text" @focus="selecValueBgc" :value="'#EFEFEF'" :spellcheck="false">
                <input ref="bgcOpacity" type="text" @focus="selecValue" :value="1">
            </div>
        </div>
        <Arrange v-if="len > 1" :context="props.context" :shapes="shapes"></Arrange>
        <div v-if="len">
            <ShapeBaseAttr :shapes="shapes" :context="props.context"></ShapeBaseAttr>
            <Text v-if="WITH_TEXT.includes(shapeType)" :shape="(shapes[0] as TextShape)" :context="props.context"></Text>
            <Fill v-if="WITH_FILL.includes(shapeType)" :shapes="shapes" :context="props.context"></Fill>
            <Border v-if="WITH_BORDER.includes(shapeType)" :shapes="shapes" :context="props.context"></Border>
        </div>

    </section>
</template>

<style scoped lang="scss">
section {
    width: 100%;
    height: 100%;
    font-size: var(--font-default-fontsize);

    .back-setting-container {
        font-weight: var(--font-default-bold);
        padding: var(--default-padding);

        .setting {
            width: 100%;
            height: 32px;
            max-width: 336px;
            align-items: center;
            box-sizing: border-box;
            padding: 0 var(--default-padding);
            background-color: var(--input-background);
            border-radius: var(--default-radius);
            margin-top: var(--default-margin-half);
            display: flex;

            >.color {
                flex: 0 0 16px;
            }

            >input {
                display: block;
                outline: none;
                border: none;
                background: transparent;
                width: 120px;
                flex-shrink: 1;
                margin-left: var(--default-margin);
            }

            >input+input {
                width: 50px;
                flex-shrink: 0;
                margin-left: var(--default-margin);
            }
        }
    }
}
</style>