import { objectId } from "@/basic/objectid";
import { ShapeFrame } from "@/data/shape";
import { Gradient, GradientType, Stop } from "@/data/style";
import { h, VNodeArrayChildren } from "vue";

function renderStop(d: Stop) {
    const position = d.position;
    const color = d.color;
    const rgbColor = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
    const n = h("stop", {
        offset: "" + (position * 100) + "%",
        "stop-color": rgbColor,
        "stop-opacity": color.alpha
    });
    return n;
}

export default function parseGradient(value: Gradient, frame:ShapeFrame) {
    const id = "gradient" + objectId(value);
    let style;
    let node;
    if (value.gradientType == GradientType.Linear) {
        const stopSCount = value.stopsCount;
        const childs = [];
        for (let i = 0; i < stopSCount; i++) {
            const s = value.getStopByIndex(i);
            childs.push(renderStop(s));
        }
        const n = h("linearGradient", {
            id,
            x1: value.from.x,
            y1: value.from.y,
            x2: value.to.x,
            y2: value.to.y,
        }, childs);
        node = n;
    }
    else if (value.gradientType == GradientType.Radial) {
        const stopSCount = value.stopsCount;
        const childs = [];
        for (let i = 0; i < stopSCount; i++) {
            const s = value.getStopByIndex(i);
            childs.push(renderStop(s));
        }
        const scaleX = frame.width > frame.height ? frame.height / frame.width : 1.0;
        const scaleY = frame.width < frame.height ? frame.width / frame.height : 1.0;
        const n = h("radialGradient", {
            id,
            cx: value.from.x,
            cy: value.from.y,
            r: Math.sqrt((value.to.y - value.from.y) ** 2 + (value.to.x - value.from.x) ** 2),
            fx: value.from.x,
            fy: value.from.y,
            gradientTransform: "translate(" + value.from.x + "," + value.from.y + ")," +
                // "scale(0.955224, 1.0)," + // todo
                "rotate(" + Math.atan((value.to.y - value.from.y) / (value.to.x - value.from.x)) / Math.PI * 180 + ")," +
                "scale(" + scaleX + " " + scaleY +")," +
                "translate(" + (-value.from.x) + "," + (-value.from.y) + ")",
        },
            childs);
        node = n;
    }
    else if (value.gradientType == GradientType.Angular) {
        let gradient = "";
        const sc = value.stopsCount;
        const calcSmoothColor = () => {
            const firstStop = value.getStopByIndex(0);
            const lastStop = value.getStopByIndex(sc - 1);
            const lastDistance = 1 - lastStop.position;
            const firstDistance = firstStop.position;
            const fColor = firstStop.color;
            const lColor = lastStop.color;
            const ratio = 1 / (firstDistance + lastDistance);
            const fRatio = lastDistance * ratio;
            const lRatio = firstDistance * ratio;
            let r = (fColor.red * fRatio + lColor.red * lRatio);
            let g = (fColor.green * fRatio + lColor.green * lRatio);
            let b = (fColor.blue * fRatio + lColor.blue * lRatio);
            let a = (fColor.alpha * fRatio + lColor.alpha * lRatio);
            r = Math.min(Math.max(Math.round(r), 0), 255);
            g = Math.min(Math.max(Math.round(g), 0), 255);
            b = Math.min(Math.max(Math.round(b), 0), 255);
            a = Math.min(Math.max(a, 0), 1);
            return { r, g, b, a };
        }
        if (sc > 0 && value.getStopByIndex(0).position > 0) {
            const { r, g, b, a } = calcSmoothColor();
            gradient = "rgba(" + r + "," + g + "," + b + "," + a + ")" + " 0deg";
        }
        for (let i = 0; i < sc; i++) {
            const stop = value.getStopByIndex(i);
            const color = stop.color;
            const rgbColor = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
            const deg = Math.round(stop.position * 360)// % 360;
            gradient.length > 0 && (gradient = gradient + ",")
            gradient = gradient + rgbColor + " " + deg + "deg";
        }
        if (sc > 0 && value.getStopByIndex(sc - 1).position < 1) {
            const { r, g, b, a } = calcSmoothColor();
            gradient = gradient + "," + "rgba(" + r + "," + g + "," + b + "," + a + ")" + " 360deg";
        }
        // defsChilds.push(h("style", {}, "." + id + "{" +
        style =
            "background: conic-gradient(" + gradient + ");" +
            "height:-webkit-fill-available;" +
            "width:-webkit-fill-available;"
            // "transform: rotate(90deg);" +
            // "transform-origin: left top;" +
            // "rotation:90deg" +
            // "rotation-point:0% 0%;" +
            // "}"));
    }
    return {id, style, node};
}