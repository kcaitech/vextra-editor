
<script lang="ts">
import { objectId } from '@/basic/objectid';
import { Shape } from '@/data/shape';
import { Border, Fill, FillType, GradientType, BorderPosition, Gradient } from '@/data/style';
import { h, defineComponent } from 'vue';
import parseGradient from './gradientparser';

export default defineComponent({
    name: 'RectangleView',
    props: {
        data: {
            type: Shape,
            required: true,
        }
    },

    render() {
        let frame = this.data.frame;
        let style = this.data.style;
        let fillsCount = style.fillsCount;

        // const parseFill = function(fill:Fill | Border) {
        //     let color = fill.color;
        //     let fillStr = "none";
        //     let _class = undefined;
        //     let fillType = fill.fillType;
        //     fillType == FillType.SolidColor && 
        //         (fillStr = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")") ||
        //     fillType == FillType.Gradient && (() => {
        //         let gid = fill.gradientId;
        //         let gType = fill.gradientType;
        //         gid && gid.length > 0 && 
        //             (gType == GradientType.Angular && (_class = "" + gid) ||
        //             (fillStr = "url(#" + gid + ")"))
        //         return true;
        //     })() ||
        //     fillType == FillType.Pattern && (() => {
        //         return true;
        //     });
        //     return {fill: fillStr, "class": _class};
        // }

        let childs = [];
        for (let i = 0; i < fillsCount; i++) {
            let fill = style.getFillByIndex(i);
            if (!fill.isEnabled) {
                continue;
            }
            let color = fill.color;
            let fillType = fill.fillType;
            fillType == FillType.SolidColor && (() => {
                childs.push(h('rect', { fill: "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")",
                    "fill-opacity": color ? color.alpha : 1, 
                    stroke: 'none', 
                    'stroke-width': 0, 
                    x: frame.x, 
                    y: frame.y, 
                    width: frame.width, 
                    height: frame.height }));
                return true;
            })() ||
            fillType == FillType.Gradient && (() => {
                let g_ = parseGradient(fill.gradient as Gradient, frame);
                if (g_.node) {
                    childs.push(g_.node);
                }
                if (g_.style) {
                    childs.push(h("foreignObject", {width: frame.width, 
                        height: frame.height,
                        x:frame.x, 
                        y: frame.y},
                        h("div", {width:"100%", height:"100%", style: g_.style})));
                } else {
                    childs.push(h('rect', { fill: "url(#" + g_.id + ")",
                        "fill-opacity": color ? color.alpha : 1, 
                        stroke: 'none', 
                        'stroke-width': 0, 
                        x: frame.x, 
                        y: frame.y, 
                        width: frame.width, 
                        height: frame.height }));
                }
                return true;
            })()
        }

        // border
        let bc = style.bordersCount;
        for (let i = 0; i < bc; i++) {
            const border:Border = style.getBorderByIndex(i);
            if (!border.isEnabled) {
                continue;
            }
            const color = border.color;
            const thickness = border.thickness;
            const position = border.position;
            // todo
            
            // const stroke = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
            // let fillR = parseFill(border);

            const getClipPath = (width: number, height: number, borderId: number) => {
                const id = "border" + borderId + "-clippath" + "-" + i;
                const path = "M " + 0 + " " + 0 + " h " + width + " v " + height + " h " + (-width) + " Z " +
                    " L " + (thickness) + " " + (thickness) + " v " + (height - 2*thickness) + " h " + (width - 2*thickness) +
                    " v " + (-height + 2*thickness) + " L " + (thickness) + " " + (thickness);
                let n = h("clipPath", {id}, h("path", {
                    d: path
                }));
                return {id, n};
            }

            let fillType = border.fillType;
            let gradientType = border.gradient && border.gradient.gradientType;

            fillType == FillType.Gradient && gradientType == GradientType.Angular && (() => {
                let g_ = parseGradient(border.gradient as Gradient, frame);
                if (g_.node) {
                    childs.push(g_.node);
                }

            position == BorderPosition.Inner && (() => {
                let {id, n} = getClipPath(frame.width, frame.height, objectId(border));
                childs.push(n);
                childs.push(h("foreignObject", {width: frame.width, 
                    height: frame.height, 
                    x:frame.x, 
                    y: frame.y,
                    "clip-path": "url(#" + id + ")"},
                    h("div", {width:"100%", height:"100%", style: g_.style})));
                return true;
            })() ||
            position == BorderPosition.Center && (() => {
                let width = frame.width + thickness;
                let height = frame.height + thickness;
                let {id, n} = getClipPath(width, height, objectId(border));
                childs.push(n);
                childs.push(h("foreignObject", {width, 
                    height, 
                    x:frame.x - thickness / 2, 
                    y: frame.y - thickness / 2,
                    "clip-path": "url(#" + id + ")"},
                    h("div", {width:"100%", height:"100%", style: g_.style})));
                return true;
            })() ||
            position == BorderPosition.Outer && (() => {
                let width = frame.width + 2*thickness;
                let height = frame.height + 2*thickness;
                let {id, n} = getClipPath(width, height, objectId(border));
                childs.push(n);
                childs.push(h("foreignObject", {width, 
                    height, 
                    x:frame.x - thickness, 
                    y: frame.y - thickness,
                    "clip-path": "url(#" + id + ")"},
                    h("div", {width:"100%", height:"100%", style: g_.style})));
                return true;
            })()
        })() ||
(fillType == FillType.SolidColor || fillType == FillType.Gradient) && (() => {
                 //
                    let stroke;
                    let color = border.color;
                    if (fillType == FillType.SolidColor) {
                        stroke = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
                    } else {
                        let g_ = parseGradient(border.gradient as Gradient, frame);
                        if (g_.node) {
                            childs.push(g_.node);
                        }
                        stroke = "url(#" + g_.id + ")";
                    }

            position == BorderPosition.Inner && (() => {
                let x = frame.x;
                let y = frame.y;
                let width = frame.width;
                let height = frame.height;
                x = x + thickness;
                y = y + thickness;
                width = width - 2 * thickness;
                height = height - 2 * thickness;
                childs.push(h('rect', { fill: "none", stroke, 'stroke-width': thickness, x, y, width, height }));
                return true;
            })() ||
            position == BorderPosition.Center && (() => {
                let x = frame.x;
                let y = frame.y;
                let width = frame.width;
                let height = frame.height;
                childs.push(h('rect', { fill: "none", stroke, 'stroke-width': thickness, x, y, width, height }));
                return true;
            })() ||
            position == BorderPosition.Outer && (() => {
                let x = frame.x;
                let y = frame.y;
                let width = frame.width;
                let height = frame.height;
                x = x - thickness;
                y = y - thickness;
                width = width + 2 * thickness;
                height = height + 2 * thickness;
                childs.push(h('rect', { fill: "none", stroke, 'stroke-width': thickness, x, y, width, height }));
                return true;
            })()
        })()
        }
        
        if (childs.length == 0) {
            // todo
            return h('rect', { "fill-opacity": 1, stroke: 'none', 'stroke-width': 0, x: frame.x, y: frame.y, width: frame.width, height: frame.height });
        }
        else if (childs.length == 1) {
            return childs[0];
        }
        else {
            return h("g", childs);
        }
    },

    methods: {
        // forceRerender() {
        //   this.componentKey += 1;  
        // },
        // bubbleEvent(event, args, forceAsync) {
        // 	  return this.$parent && this.$parent.bubbleEvent(event, args, forceAsync);
        //   }
    },

    created() {
        // this.data.onChange(this.forceRerender.bind(this));
    },
})
</script>

<style scoped>
/* rect {
    background-color: aqua;
} */
</style>