import { FillType, Shape } from "@kcdesign/data";
import { Ref } from "vue";

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
    const stopWatch = shape.watch((args) => {
        if (args.contains('fill') || args.contains('fills')) {
            load();
            reflush.value++;
        }
    })
    return stopWatch;
}