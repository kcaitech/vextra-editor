import { FillType, Shape } from "@kcdesign/data";
import { Ref, onMounted, onUnmounted, ref, watch } from "vue";

export function asyncLoadFillImages(shape: Shape, reflush: Ref<number>) {
    const load = () => {
        const fills = shape.style.fills;
        fills.forEach((fill) => {
            if (fill.fillType === FillType.Pattern && fill.imageRef) {
                if (fill.peekImage()) return;
                fill.loadImage().then((val) => {
                    reflush.value++;
                })
            }
        })
    }
    load();
    const stopWatch = shape.watch((...args: any[]) => {
        if (args.includes('fill') || args.includes('fills')) {
            load();
            reflush.value++;
        }
    })
    return stopWatch;
}

export function makeReflush(props: { data: Shape }) {
    const reflush = ref(0);

    const watcher = () => {
        reflush.value++;
    }
    const stopWatch = watch(() => props.data, (value, old) => {
        old.unwatch(watcher);
        value.watch(watcher);
    })
    onMounted(() => {
        props.data.watch(watcher);
    })
    onUnmounted(() => {
        props.data.unwatch(watcher);
        stopWatch();
    })

    return reflush;
}