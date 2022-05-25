
<script lang="ts">
import { objectId } from '@/basic/objectid';
import { Shape } from '@/data/shape';
import { Border, Fill, FillType, GradientType, BorderPosition } from '@/data/style';
import { h, defineComponent } from 'vue';
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

        let parseFill = function(fill:Fill | Border) {
            let color = fill.color;
            let fillStr = "none";
            let _class = undefined;
            switch (fill && fill.fillType || FillType.SolidColor) {
                case FillType.SolidColor:
                    if (color) {
                        fillStr = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
                    }
                    break;
                case FillType.Gradient: {
                    let gid = fill && fill.gradientId;
                    let gType = fill && fill.gradientType;
                    if (gid && gid.length > 0) {
                        if (gType == GradientType.Angular) {
                            _class = "" + gid;
                        } else {
                            fillStr = "url(#" + gid + ")";
                        }
                    }
                    break;
                }
                case FillType.Pattern: // todo
                    break;
            }
            return {fill: fillStr, "class": _class};
        }
        // let mergeObject = function(lhs:any, rhs: any) {
        //     Object.keys(rhs).forEach((key) => {
        //         lhs[key] = rhs[key];
        //     })
        // }
        let childs = [];
        for (let i = 0; i < fillsCount; i++) {
            let fill = style.getFillByIndex(i);
            if (!fill.isEnabled) {
                continue;
            }
            let color = fill.color;
            let fillR = parseFill(fill);
            // if (childs.length == 0) {
            //     //parse border?
                
            //     if (fillR["class"]) {
            //         childs.push(h("foreignObject", {width: frame.width, height: frame.height, x:frame.x, y: frame.y},
            //             h("div", {width:"100%", height:"100%", "class": fillR["class"]})));
            //     }
            //     else {
            //         childs.push(h('rect', { fill: fillR.fill, "fill-opacity": color ? color.alpha : 1, stroke: 'rgb(0,0,0)', 'stroke-width': 1, x: frame.x, y: frame.y, width: frame.width, height: frame.height }));
            //     }
            // }
            // else {
                if (fillR["class"]) {
                    childs.push(h("foreignObject", {width: frame.width, height: frame.height, x:frame.x, y: frame.y},
                        h("div", {width:"100%", height:"100%", "class": fillR["class"]})));
                }
                else {
                    childs.push(h('rect', { fill: fillR.fill, "fill-opacity": color ? color.alpha : 1, stroke: 'none', 'stroke-width': 0, x: frame.x, y: frame.y, width: frame.width, height: frame.height }));
                }
            // }
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
            
            const stroke = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
            let fillR = parseFill(border);
            if (fillR["class"]) {
                let x = frame.x;
                let y = frame.y;
                let width = frame.width;
                let height = frame.height;
                switch(position) {
                    // 需要+0.25个像素左右，消去path间空白间隙

                    case BorderPosition.Inner:
                        childs.push(h("clipPath", {id: "border" + objectId(border) + "-clippath" + "-" + i}, h("path", {
                            d:"M " + 0 + " " + 0 + " h " + width + " v " + height + " h " + (-width) + " Z " +
                            " L " + (thickness) + " " + (thickness) + " v " + (height - 2*thickness) + " h " + (width - 2*thickness) +
                            " v " + (-height + 2*thickness) + " L " + (thickness) + " " + (thickness)
                        })));
                        childs.push(h("foreignObject", {width: frame.width, height: frame.height, x:frame.x, y: frame.y,
                            "clip-path": "url(#" + "border" + objectId(border) + "-clippath" + "-" + i + ")"},
                            h("div", {width:"100%", height:"100%", "class": fillR["class"]})));
                        break;
                    case BorderPosition.Center:
                        childs.push(h("clipPath", {id: "border" + objectId(border) + "-clippath" + "-" + i}, h("path", {
                            d:"M " + 0 + " " + 0 + " h " + (width + thickness) + " v " + (height + thickness) + " h " + (-width - thickness) + " Z " +
                            " L " + (thickness) + " " + (thickness) + " v " + (height - thickness) + " h " + (width - thickness) +
                            " v " + (-height + thickness) + " L " + (thickness) + " " + (thickness)
                        })));
                        childs.push(h("foreignObject", {width: frame.width + thickness, height: frame.height + thickness, x:frame.x - thickness / 2, y: frame.y - thickness / 2,
                            "clip-path": "url(#" + "border" + objectId(border) + "-clippath" + "-" + i + ")"},
                            h("div", {width:"100%", height:"100%", "class": fillR["class"]})));
                        break;
                    case BorderPosition.Outer:
                        childs.push(h("clipPath", {id: "border" + objectId(border) + "-clippath" + "-" + i}, h("path", {
                            d:"M " + 0 + " " + 0 + " h " + (width + 2*thickness) + " v " + (height + 2*thickness) + " h " + (-width-2*thickness) + " Z " +
                            " L " + (thickness) + " " + (thickness) + " v " + (height) + " h " + (width) +
                            " v " + (-height) + " L " + (thickness) + " " + (thickness)
                        })));
                        childs.push(h("foreignObject", {width: frame.width + 2*thickness, height: frame.height + 2 * thickness, x:frame.x - thickness, y: frame.y - thickness,
                            "clip-path": "url(#" + "border" + objectId(border) + "-clippath" + "-" + i + ")"},
                            h("div", {width:"100%", height:"100%", "class": fillR["class"]})));
                        break;
                }
            }
            else {
                // todo thickness 为奇数的情况
                let x = frame.x;
                let y = frame.y;
                let width = frame.width;
                let height = frame.height;
                switch(position) {
                    case BorderPosition.Inner:
                        // 双倍宽度+clipPath
                        x = x + thickness;
                        y = y + thickness;
                        width = width - 2 * thickness;
                        height = height - 2 * thickness;
                        break;
                    case BorderPosition.Center:
                        // clipPath
                        // 不处理

                        // x = x + thickness / 2;
                        // y = y + thickness / 2;
                        // width = width - thickness;
                        // height = height - thickness;
                        break;
                    case BorderPosition.Outer:
                        // 双倍宽度+mask
                        x = x - thickness;
                        y = y - thickness;
                        width = width + 2 * thickness;
                        height = height + 2 * thickness;
                        break;
                }
                childs.push(h('rect', { fill: "none", stroke, 'stroke-width': thickness, x, y, width, height }));
            }

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