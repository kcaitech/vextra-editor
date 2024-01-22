<script setup lang="ts">
import { GroupShape, Matrix, ShapeType, ShapeView, SymbolUnionShape } from '@kcdesign/data';
import { onUnmounted } from 'vue';
import { onMounted, ref, watch } from 'vue';
import { computed } from 'vue';

interface Props {
    view: number
    shape: ShapeView
    theme: string
}

const props = defineProps<Props>();
const path = ref<string>('');
const flex_abbr = computed<boolean>(() => {
    const s = props.shape;
    return [ShapeType.Oval, ShapeType.Rectangle, ShapeType.Line, ShapeType.Path].includes(s.type)
        || (s.type === ShapeType.Group && !!(s.data as GroupShape).isBoolOpShape);
})

function icon_class() {
    const shape = props.shape;
    if (shape.type === ShapeType.Symbol) {
        if (shape instanceof SymbolUnionShape) {
            return 'layer-symbol-union';
        } else {
            return 'layer-component';
        }
    } else {
        return `layer-${shape.type}`;
    }
}

function pather() {
    if (!flex_abbr.value) {
        return;
    }

    const f = props.shape.data.boundingBox2();

    let max_length = f.width;
    let max_side = 'w';

    if (f.height > f.width) {
        max_length = f.height;
        max_side = 'h';
    }

    const ratio = 100 / max_length;

    const o = { x: 0, y: 0 };

    if (max_side === 'h') {
        o.x = (100 - f.width * ratio) / 2;
    } else {
        o.y = (100 - f.height * ratio) / 2
    }

    const m = new Matrix();
    m.scale(ratio);
    m.trans(o.x, o.y);

    const _path = props.shape.getPath().clone();
    _path.transform(m);
    path.value = _path.toString();
}
const e = watch(() => props.view, pather);
onMounted(pather);
onUnmounted(e);
</script>
<template>
    <div class="abbr-container">
        <svg v-if="flex_abbr" viewBox="-12 -12 124 124">
            <path :d="path" stroke-width="10" fill="none" :stroke="theme"></path>
        </svg>
        <svg-icon v-else :icon-class="icon_class()" :fill="theme"></svg-icon>
    </div>
</template>
<style scoped lang="scss">
.abbr-container {
    width: 13px;
    height: 13px;
    display: flex;
    align-items: center;

    >svg {
        width: 13px;
        height: 13px;
    }
}
</style>