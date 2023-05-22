<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape } from '@kcdesign/data';
import { ShapeType } from "@kcdesign/data"
import { defineProps, onMounted, onUnmounted, shallowRef, ref } from 'vue';
import ColorPicker from '../../common/ColorPicker.vue';
import { Color } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import ShapeBaseAttr from './BaseAttr.vue';
import Fill from './Fill/Fill.vue';
import Border from './Border/Border.vue';
import Text from './Text/Text.vue';
const { t } = useI18n();
const props = defineProps<{ context: Context }>();

const shape = shallowRef<Shape>();

const WITH_FILL = [ShapeType.Rectangle, ShapeType.Oval, ShapeType.Star, ShapeType.Polygon, ShapeType.Text, ShapeType.Path, ShapeType.Artboard];
const shapeType = ref();

function selectionChange(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shape.value = undefined;
    }
    else if (t === Selection.CHANGE_SHAPE) {
        if (props.context.selection.selectedShapes.length === 1) {
            shape.value = props.context.selection.selectedShapes[0];
            shapeType.value = shape.value.type
        }
        else {
            shape.value = undefined;
        }
    }
}
const backgroundColor = new Color(1, 239, 239, 239);
onMounted(() => {
    props.context.selection.watch(selectionChange);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
})

</script>

<template>
    <section>
        <div v-if="shape">
            <ShapeBaseAttr :shape="shape" :context="props.context"></ShapeBaseAttr>
            <Text :shape="shape" :context="props.context"></Text>
            <Fill v-if="WITH_FILL.includes(shapeType)" :shape="shape" :context="props.context"></Fill>
            <Border :shape="shape" :context="props.context"></Border>
        </div>
        <div v-else class="back-setting-container">
            <span>{{ t('attr.background') }}</span>
            <div class="setting">
                <ColorPicker class="color" :color="backgroundColor"></ColorPicker>
                <input type="text" :value="'#EFEFEF'" :spellcheck="false">
                <input type="text" :value="1">
            </div>

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
}</style>