<script setup lang="ts">
import { h, onUnmounted, shallowRef, watch } from 'vue';
import comsMap from './comsmap'
import { ArtboradView, ContactLineView, CutoutShapeView, DViewCtx, GroupShapeView, ImageShapeView, LineView, OverrideType, PathShapeView, PathShapeView2, RectShapeView, ShapeType, SymbolRefView, SymbolUnionShape, SymbolView, TableCellView, TableView, TextShapeView, VariableType, adapt2Shape, findOverrideAndVar, isAdaptedShape, renderSymbolRef as r } from "@kcdesign/data"
import { SymbolRefShape, RenderTransform, SymbolShape, Document } from '@kcdesign/data';
import { initCommonShape } from './common';

const props = defineProps<{
    data: SymbolRefShape, transx?: RenderTransform,
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}>();

const watcher = () => {
    common.incReflush();
    updater();
}

function getRefId2(_this: SymbolRefShape, varsContainer: (SymbolRefShape | SymbolShape)[] | undefined) {
    if (_this.isVirtualShape) return _this.refId;
    if (!varsContainer) return _this.refId;
    const _vars = findOverrideAndVar(_this, OverrideType.SymbolID, varsContainer);
    if (!_vars) return _this.refId;
    const _var = _vars[_vars.length - 1];
    if (_var && _var.type === VariableType.SymbolRef) {
        return _var.value;
    }
    return _this.refId;
}

// 需要自己加载symbol
let __data = shallowRef<SymbolShape>();
let __union: SymbolShape | undefined;
let __startLoad: string = "";
function updater() {
    const symMgr = props.data.getSymbolMgr();
    if (!symMgr) return;
    const refId = getRefId2(props.data, props.varsContainer);
    if (__startLoad === refId) {
        return;
    }

    __startLoad = refId;
    symMgr.get(refId).then((val) => {
        if (__startLoad !== refId) return;
        if (__data.value) __data.value.unwatch(watcher);

        if (val) {
            const symbolregist = (symMgr.parent as Document).symbolregist.get(refId);
            let sym;
            if (symbolregist) {
                // todo val 有多个时，需要提示用户修改
                for (let i = 0; i < val.length; ++i) {
                    const v = val[i];
                    const p = v.getPage();
                    if (!p && symbolregist === 'freesymbols') {
                        sym = v;
                        break;
                    } else if (p && p.id === symbolregist) {
                        sym = v;
                    }
                }
            } else {
                sym = val[val.length - 1];
            }
            __data.value = sym;
        }
        if (__data.value) __data.value.watch(watcher);

        // union
        const union = __data.value?.parent instanceof SymbolUnionShape ? __data.value.parent : undefined;
        if (__union?.id !== union?.id) {
            if (__union) __union.unwatch(watcher);
            __union = union;
            if (__union) __union.watch(watcher);
        }

        common.incReflush();
    })
}

updater();

onUnmounted(() => {
    if (__data.value) __data.value.unwatch(watcher);
    if (__union) __union.unwatch(watcher);
    __startLoad = "";
    if (adaptView) adaptView.destory();
})

const common = initCommonShape(props, updater);


function initComsMap(comsMap: Map<ShapeType, any>) {
    
    comsMap.set(ShapeType.Artboard, ArtboradView);
    comsMap.set(ShapeType.Group, GroupShapeView);
    comsMap.set(ShapeType.Image, ImageShapeView);
    // comsMap.set(ShapeType.Page, ShapeGroup);
    comsMap.set(ShapeType.Path, PathShapeView);
    comsMap.set(ShapeType.Path2, PathShapeView2);
    // comsMap.set(ShapeType.Rectangle, PathShapeDom);
    comsMap.set(ShapeType.Oval, PathShapeView);
    comsMap.set(ShapeType.Text, TextShapeView);
    comsMap.set(ShapeType.Symbol, SymbolView);
    comsMap.set(ShapeType.SymbolUnion, SymbolView);
    comsMap.set(ShapeType.SymbolRef, SymbolRefView);
    comsMap.set(ShapeType.Line, LineView);
    comsMap.set(ShapeType.Table, TableView);
    comsMap.set(ShapeType.Contact, ContactLineView);
    comsMap.set(ShapeType.TableCell, TableCellView);
    comsMap.set(ShapeType.Cutout, CutoutShapeView);
    comsMap.set(ShapeType.Rectangle, RectShapeView);
}

let adapt: SymbolRefShape | undefined;
let adaptView: SymbolRefView | undefined;
let adaptCtx: DViewCtx | undefined;
function makeAdapt() {
    adaptCtx = new DViewCtx();
    initComsMap(adaptCtx.comsMap);
    adaptView = new SymbolRefView(adaptCtx, {
        data: props.data,
        varsContainer: props.varsContainer,
        isVirtual: false
    });
    adapt = adapt2Shape(adaptView) as SymbolRefShape;
}

watch(() => props.data, (val, old) => {
    if (val.id !== old.id) {
        adapt = undefined;
        adaptView?.destory;
        adaptView = undefined;
        adaptCtx = undefined;
    }
})

function render() {
    if (!__data.value) return;
    const shape = props.data;
    if (shape.isVirtualShape || isAdaptedShape(shape)) {
        const ret = r(h, props.data, __data.value, comsMap, undefined, common.reflush);
        return ret;
    }

    if (!adapt) {
        makeAdapt();
    }
    adaptCtx!.layoutAll();
    const ret = r(h, adapt!, __data.value, comsMap, undefined, common.reflush);
    return ret;
}

</script>

<template>
    <render />
</template>

<style scoped></style>