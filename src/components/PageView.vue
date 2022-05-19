
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
                    let stops = value.stops;
                    childs = stops.map(renderStop);
                    let n = h("linearGradient", { id: key }, childs);
                    defsChilds.push(n);
                }
                else if (value.gradientType == GradientType.Radial) {
                    let stops = value.stops;
                    childs = stops.map(renderStop);
                    let n = h("radialGradient", { id: key }, childs);
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