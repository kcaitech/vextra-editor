import { Shape, SymbolRefShape, SymbolShape } from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";

export class RenderCtx {


    started = false;
    remainTime = 40;

    reset() {
        this.started = false;
        this.remainTime = 40;
    }

    cousumeTime(time: number) {
        this.remainTime -= time;
    }

    isExpired() {
        return this.remainTime <= 0;
    }

    selectShapePath: Set<string> = new Set();

    resetSelectShapePath(shape: Shape | undefined) {
        this.selectShapePath.clear();
        while (shape) {
            this.selectShapePath.add(shape.id);
            shape = shape.parent;
        }
    }

    isInSelectShapePath(shape: Shape) {
        return this.selectShapePath.has(shape.id);
    }

    static maxNativeRenderCount = 5;
    nativeRenderShapes: { id: string, updater: () => void }[] = [];

    checkRenderAsSvg(shape: Shape, updater: () => void) {
        const needNative = this.isInSelectShapePath(shape);
        if (!needNative) return true;

        const idx = this.nativeRenderShapes.findIndex((v) => v.id === shape.id);
        if (idx >= 0) {
            if (idx !== this.nativeRenderShapes.length - 1) {
                this.nativeRenderShapes.splice(idx, 1);
                this.nativeRenderShapes.push({ id: shape.id, updater });
            }
        }
        else {
            if (this.nativeRenderShapes.length >= RenderCtx.maxNativeRenderCount) {
                const first = this.nativeRenderShapes.shift();
                if (first) first.updater();
            }
            this.nativeRenderShapes.push({ id: shape.id, updater });
        }
        return false;
    }
}

export function initCommonShape(props: { data: Shape, varsContainer?: (SymbolRefShape | SymbolShape)[] }, updater?: (...args: any[]) => void) {
    const _reflush = ref(0);

    const watcher = (...args: any[]) => {
        _reflush.value++;
        if (updater) updater(...args);
    }

    const ret = {
        get reflush() {
            return _reflush.value !== 0 ? _reflush.value : undefined;
        },
        set reflush(val: number | undefined) {
            _reflush.value = val ?? 0;
        },
        incReflush() {
            _reflush.value++;
        },
    };

    // watch varsContainer
    watch(() => props.varsContainer, (value, old) => {
        old?.forEach((v) => v.unwatch(watcher));
        value?.forEach((v) => v.watch(watcher));
        if (updater) updater();
    })

    watch(() => props.data, (value, old) => {
        old.unwatch(watcher);
        value.watch(watcher);
        if (updater) updater();
    })
    onMounted(() => {
        props.data.watch(watcher);
        if (props.varsContainer) props.varsContainer.forEach((v) => v.watch(watcher));
    })
    onUnmounted(() => {
        props.data.unwatch(watcher);
        if (props.varsContainer) props.varsContainer.forEach((v) => v.unwatch(watcher));
    })

    return ret;
}

export const IMAGE_DEFAULT = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aA0KICAgICAgICBkPSJNMTIuNSAxMGMxLjM4IDAgMi41LTEuMTIgMi41LTIuNUMxNSA2LjEyIDEzLjg4IDUgMTIuNSA1IDExLjEyIDUgMTAgNi4xMiAxMCA3LjVjMCAxLjM4IDEuMTIgMi41IDIuNSAyLjV6TTE0IDcuNWMwIC44MjgtLjY3MiAxLjUtMS41IDEuNS0uODI4IDAtMS41LS42NzItMS41LTEuNSAwLS44MjguNjcyLTEuNSAxLjUtMS41LjgyOCAwIDEuNS42NzIgMS41IDEuNXpNMTcgMUgxdjE2aDE2VjF6bS0xIDF2MTRoLTEuMjkzTDYgNy4yOTNsLTQgNFYyaDE0ek0yIDE2di0zLjI5M2w0LTRMMTMuMjkzIDE2SDJ6Ig0KICAgICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbD0iZ3JleSIgc3Ryb2tlPSJub25lIj4NCiAgICA8L3BhdGg+DQo8L3N2Zz4=';
