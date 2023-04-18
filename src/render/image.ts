import { ImageShape } from "@kcdesign/data/data/shape";

export function render(h: Function, shape: ImageShape, url: string, reflush?: number) {
    // <image :xlink:href="url" :x="frame.x" :y="frame.y" :width="frame.width" :height="frame.height" :reflush="reflush" />)
    const frame = shape.frame;
    const props: any = {}
    props['xlink:href'] = url;

    props.width = frame.width;
    props.height = frame.height;

    if (shape.isFlippedHorizontal || shape.isFlippedVertical || shape.rotation) {
        const cx = frame.x + frame.width / 2;
        const cy = frame.y + frame.height / 2;
        const style: any = {}
        style.transform = "translate(" + cx + "px," + cy + "px) "
        if (shape.isFlippedHorizontal) style.transform += "rotateY(180deg) "
        if (shape.isFlippedVertical) style.transform += "rotateX(180deg) "
        if (shape.rotation) style.transform += "rotate(" + shape.rotation + "deg) "
        style.transform += "translate(" + (-cx + frame.x) + "px," + (-cy + frame.y) + "px)"
        props.style = style;
    }
    else {
        props.transform = `translate(${frame.x},${frame.y})`
    }

    if (reflush) props.reflush = reflush;
    return h("image", props);
}