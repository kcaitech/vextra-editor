<script setup lang="ts">
import {h, onUnmounted, ref, shallowRef, watch} from 'vue';
import comsMap from '../Content/comsmap'
import {DViewCtx, OverrideType, SymbolRefView, VariableType, adapt2Shape, findOverrideAndVar, isAdaptedShape, renderSymbolRefStatic as r} from "@kcdesign/data"
import {SymbolRefShape, SymbolShape} from '@kcdesign/data';
import { ArtboradView, ContactLineView, CutoutShapeView, GroupShapeView, ImageShapeView, LineView, PathShapeView, PathShapeView2, RectShapeView, ShapeType, SymbolView, TableCellView, TableView, TextShapeView, BoolShapeView } from "@kcdesign/data"

interface Props {
    data: SymbolRefShape
    varsContainer?: (SymbolRefShape | SymbolShape)[]
}

const props = defineProps<Props>();
const reflush = ref<number>(0);
// 需要自己加载symbol
let __data = shallowRef<SymbolShape>();
// let __union: SymbolShape | undefined;

let __startLoad: string = "";

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

function updater() {
    // const symMgr = props.data.getSymbolMgr();
    // if (!symMgr) return;

    const refId = getRefId2(props.data, props.varsContainer);
    if (__startLoad === refId) {
        return;
    }

    __startLoad = refId;

    __data.value = props.data.getSymbolSync(refId);
    reflush.value++;
    // symMgr.get(refId).then((val) => {
    //     if (__startLoad !== refId) return;
    //     __data.value = val;
    //     // union
    //     // const union = __data?.parent instanceof SymbolUnionShape ? __data.parent : undefined;
    //     // if (__union?.id !== union?.id) {
    //     //     __union = union;
    //     // }
    //     reflush.value++;
    // })
}

updater();


function initComsMap(comsMap: Map<ShapeType, any>) {
    
    comsMap.set(ShapeType.Artboard, ArtboradView);
    comsMap.set(ShapeType.Group, GroupShapeView);
    comsMap.set(ShapeType.Image, ImageShapeView);
    comsMap.set(ShapeType.BoolShape, BoolShapeView);
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
        const ret = r(h, props.data, __data.value, comsMap, undefined, reflush.value);
        return ret;
    }

    if (!adapt) {
        makeAdapt();
    }
    adaptCtx!.layoutAll();
    const ret = r(h, adapt!, __data.value, comsMap, undefined, reflush.value);
    return ret;
}

onUnmounted(() => {
    __startLoad = "";
    if (adaptView) adaptView.destory();
})
</script>

<template>
    <render/>
</template>