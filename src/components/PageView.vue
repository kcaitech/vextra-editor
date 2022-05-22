
<script lang="ts">
import { Gradient, GradientType, Stop } from '../data/style';
import { defineComponent, h, VNodeArrayChildren } from 'vue';
import comsMap from './comsmap'
import { Page } from '../data/page';
import { ShapeType } from "../data/shape";

export default defineComponent({
    name: 'PageView',
    props: {
        data: {
            type: Page,
            required:true,
        }
    },

    methods: {
        
    },

    render() {
        const renderDefs = () => {
            let defsChilds: VNodeArrayChildren = [];
            const gradients: Map<string, Gradient> = this.data.gradients || new Map();

            let renderStop = (d: Stop) => {
                var position = d.position;
                var color = d.color;
                var rgbColor = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
                let n = h("stop", {
                    offset: "" + (position * 100) + "%",
                    "stop-color": rgbColor,
                    "stop-opacity": color.alpha
                });
                return n;
            }

            gradients.forEach((value: Gradient, key: string, map: Map<string, Gradient>) => {

                let childs: VNodeArrayChildren = [];
                if (value.gradientType == GradientType.Linear) {
                    let stopSCount = value.stopsCount;
                    let childs = [];
                    for (let i = 0; i < stopSCount; i++) {
                        let s = value.getStopByIndex(i);
                        childs.push(renderStop(s));
                    }
                    let n = h("linearGradient", { id: key, 
                        x1: value.from.x, 
                        y1: value.from.y,
                        x2: value.to.x,
                        y2: value.to.y,
                    }, childs);
                    defsChilds.push(n);
                }
                else if (value.gradientType == GradientType.Radial) {
                    let stopSCount = value.stopsCount;
                    let childs = [];
                    for (let i = 0; i < stopSCount; i++) {
                        let s = value.getStopByIndex(i);
                        childs.push(renderStop(s));
                    }
                    let n = h("radialGradient", { id: key,
                        cx: value.from.x,
                        cy: value.from.y,
                        r: Math.sqrt((value.to.y - value.from.y)**2 + (value.to.x - value.from.x)**2),
                        fx: value.from.x,
                        fy: value.from.y,
                        gradientTransform:"translate(" + value.from.x + "," + value.from.y + ")," +
                            "scale(0.955224, 1.0)," +
                            "rotate(" + Math.atan((value.to.y - value.from.y) / (value.to.x - value.from.x)) / Math.PI * 180 + ")," +
                            "scale(1.0," + value.elipseLength +")," +
                            "translate(" + (-value.from.x) + "," + (-value.from.y) + ")",
                            }, 
                        childs);
                    defsChilds.push(n);
                }
                else if (value.gradientType == GradientType.Angular) {
                    let gradient = "";
                    let sc = value.stopsCount;
                    if (sc > 0) {
                        let firstStop = value.getStopByIndex(0);
                        let lastStop = value.getStopByIndex(sc - 1);
                        if (firstStop.position > 0) {
                            let lastDistance = 1 - lastStop.position;
                            let firstDistance = firstStop.position;
                            let fColor = firstStop.color;
                            let lColor = lastStop.color;
                            let ratio = 1 / (firstDistance + lastDistance);
                            let r = (fColor.red * lastDistance * ratio + lColor.red* firstDistance * ratio);
                            let g = (fColor.green * lastDistance * ratio + lColor.green* firstDistance * ratio);
                            let b = (fColor.blue * lastDistance * ratio + lColor.blue* firstDistance * ratio);
                            gradient = "rgb(" + r + "," + g + "," + b + ")" + " 0deg";
                        }
                    }

                    for (let i = 0; i < sc; i++) {
                        let stop = value.getStopByIndex(i);
                        let color = stop.color;
                        let rgbColor = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
                        let deg = Math.round(stop.position * 360)// % 360;
                        gradient.length > 0 && (gradient = gradient + ",")
                        gradient = gradient + rgbColor + " " + deg + "deg";
                    }

                    if (sc > 0) {
                        let firstStop = value.getStopByIndex(0);
                        let lastStop = value.getStopByIndex(sc - 1);
                        if (lastStop.position < 1) {
                            let lastDistance = 1 - lastStop.position;
                            let firstDistance = firstStop.position;
                            let fColor = firstStop.color;
                            let lColor = lastStop.color;
                            let ratio = 1 / (firstDistance + lastDistance);
                            let r = (fColor.red * lastDistance * ratio + lColor.red* firstDistance * ratio);
                            let g = (fColor.green * lastDistance * ratio + lColor.green* firstDistance * ratio);
                            let b = (fColor.blue * lastDistance * ratio + lColor.blue* firstDistance * ratio);
                            gradient = gradient + "," + "rgb(" + r + "," + g + "," + b + ")" + " 360deg";
                        }
                    }

                    let n = h("style", {}, "." + key + "{" + 
                        "background: conic-gradient("+gradient+");" + 
                        "height:-webkit-fill-available;" + 
                        "width:-webkit-fill-available;" + 
                        "transform: rotate(90deg);" +
                        "}");
                    defsChilds.push(n);
                }
            })

            return [h('defs', {}, defsChilds)];
        }

        let childs: VNodeArrayChildren = renderDefs();

        // var childsCache = this.m_childsCache// || (this._childsCache = new WeakMap());
        var cc = this.data.childsCount || 0;

        var frame = this.data.frame;
        var right = frame.width || 800;
        var bottom = frame.height || 600;
        var left = 0;
        var top = 0;

        // todo reuse childs
        for (var i = 0; i < cc; i++) {
            var child = this.data.getChildByIndex(i);

            var cf = child.frame;
            right = Math.max(right, cf.x + cf.width + 1);
            bottom = Math.max(bottom, cf.y + cf.height + 1);
            left = Math.min(left, cf.x);
            top = Math.min(top, cf.y);

            let com = comsMap.get(child.type) || comsMap.get(ShapeType.Rectangle);
            let node = h(com, { data: child });
            childs.push(node);
        }

        return h('svg', {
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            viewBox: "" + left + " " + top + " " + (right - left) + " " + (bottom - top),
            width: Math.min(1000, right - left),
            height: Math.min(800, bottom - top)
        },
            childs);
    }

})

</script>

<style scoped>
</style>