
<script lang="ts">
import { objectId } from '@/basic/objectid';
import { PathShape, Point } from '@/data/shape';
import { Border, BorderPosition, Fill, FillType, GradientType } from '@/data/style';
import { h, defineComponent } from 'vue';
import PathParser from './pathparser';

const parser = new PathParser();

export default defineComponent({
    name: 'ShapePathView',
    props: {
        data: {
            type: PathShape,
            required: true,
        }
    },

    render() {
        let frame = this.data.frame;
        let pc = this.data.pointsCount;

        // ----------------------------------------------------------
        // 拆出到render/layout
        parser.clear();
        if (pc > 0) {
            let p = this.data.getPointByIndex(0);
            let pt = p.point;
            parser.moveTo(pt.x * frame.width, pt.y * frame.height);
        }
        let curv2Point = (p: Point, nextP: Point, isClose?: boolean) => {
            if (p.hasCurveFrom && nextP.hasCurveTo) {
                let adjFrom = p.curveFrom;
                let adjTo = nextP.curveTo;
                let pt = nextP.point;
                parser.bezierCurveTo(adjFrom.x * frame.width, adjFrom.y * frame.height,
                    adjTo.x * frame.width, adjTo.y * frame.height,
                    pt.x * frame.width, pt.y * frame.height);
            }
            else if (p.hasCurveFrom && !nextP.hasCurveTo) {
                let adjFrom = p.curveFrom;
                let adjTo = nextP.point;
                let pt = nextP.point;
                parser.bezierCurveTo(adjFrom.x * frame.width, adjFrom.y * frame.height,
                    adjTo.x * frame.width, adjTo.y * frame.height,
                    pt.x * frame.width, pt.y * frame.height);
            }
            else if (!p.hasCurveFrom && nextP.hasCurveTo) {
                let adjFrom = p.point;
                let adjTo = nextP.curveTo;
                let pt = nextP.point;
                parser.bezierCurveTo(adjFrom.x * frame.width, adjFrom.y * frame.height,
                    adjTo.x * frame.width, adjTo.y * frame.height,
                    pt.x * frame.width, pt.y * frame.height);
            }
            else if (!isClose) {
                let pt = nextP.point;
                parser.lineTo(pt.x * frame.width, pt.y * frame.height);
            }
            else {
                parser.closePath();
            }
        }
        for (let i = 0; i < pc - 1; i++) {
            let p = this.data.getPointByIndex(i);
            let nextP = this.data.getPointByIndex(i + 1);
            curv2Point(p, nextP);
        }
        if (this.data.isClosed) {
            if (pc > 1) {
                let firstP = this.data.getPointByIndex(0);
                let lastP = this.data.getPointByIndex(pc - 1);
                curv2Point(lastP, firstP, true);
            } else {
                parser.closePath();
            }
        }
        const pathD = parser.getD();
        // ----------------------------------------------------------

        // return h('path', {d:pathD, fill:'none', stroke: 'rgb(0,0,0)', 'stroke-width':1});
        let style = this.data.style;
        let fillsCount = style.fillsCount;

        const parseFill = function (fill: Fill | Border) {
            let color = fill.color;
            let fillStr = "none";
            let _class = undefined;
            let fillType = fill.fillType;
            fillType == FillType.SolidColor &&
                (fillStr = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")") ||
            fillType == FillType.Gradient && (() => {
                let gid = fill.gradientId;
                let gType = fill.gradientType;
                gid && gid.length > 0 &&
                    (gType == GradientType.Angular && (_class = "" + gid) ||
                        (fillStr = "url(#" + gid + ")"))
                return true;
            })() ||
            fillType == FillType.Pattern && (() => {
                return true;
            });
            return { fill: fillStr, "class": _class };
        }

        let childs = [];
        for (let i = 0; i < fillsCount; i++) {
            let fill = style.getFillByIndex(i);
            if (!fill.isEnabled) {
                continue;
            }
            let color = fill.color;
            let fillR = parseFill(fill);

            if (fillR["class"]) {
                let id = "fill" + objectId(fill) + "-clippath-" + i;
                childs.push(h("clipPath", { id }, h("path", {
                    d: pathD
                })));
                childs.push(h("foreignObject", { width: frame.width, height: frame.height, x: frame.x, y: frame.y,
                    "clip-path": "url(#" + id + ")" },
                    h("div", { width: "100%", height: "100%", "class": fillR["class"] })));
            }
            else {
                childs.push(h('path', { d: pathD, fill: fillR.fill, "fill-opacity": color ? color.alpha : 1, stroke: 'none', 'stroke-width': 0, transform:"translate(" + frame.x + " " +  frame.y + ")", width: frame.width, height: frame.height }));
            }
        }

        // border
        let bc = style.bordersCount;
        for (let i = 0; i < bc; i++) {
            const border: Border = style.getBorderByIndex(i);
            if (!border.isEnabled) {
                continue;
            }
            // const color = border.color;
            const thickness = border.thickness;
            const position = border.position;
            // todo

            // const stroke = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
            let fillR = parseFill(border);

            // border svg支持的效果
            // outer 双倍+mask
            // center 正常
            // inner 双倍+<clip-path></clip-path>
            // 需要css支持的效果
            // 上面的线条纯黑做mask

            fillR["class"] && (

                // 先双倍
                position == BorderPosition.Inner && (() => {
                    let clipId = "border" + objectId(border) + "-clippath-" + i;
                    let id = "border" + objectId(border) + "-mask-" + i;

                    childs.push(h("mask", {id}, [
                        h("rect", {x:frame.x, y: frame.y, width:frame.width, height:frame.height, fill:"black"}),
                        h("clipPath", { id:clipId }, h("path", {
                            d: pathD
                        })),
                        h('path', { d:pathD, 
                            stroke: "white", 
                            'stroke-width': 2 * thickness, 
                            "clip-path":"url(#" + clipId + ")",
                            transform:"translate(" + frame.x + " " +  frame.y + ")"})
                        ]));

                    childs.push(h("foreignObject", {
                        width: frame.width,
                        height: frame.height,
                        x: frame.x,
                        y: frame.y,
                        mask: "url(#" + id + ")"
                    },
                        h("div", { width: "100%", height: "100%", "class": fillR["class"] })));
                    return true;
                })() ||
                position == BorderPosition.Center && (() => {
                    let width = frame.width;
                    let height = frame.height;
                    let id = "border" + objectId(border) + "-mask-" + i;
                    childs.push(h("mask", {id}, [
                            h("rect", {x:frame.x, y: frame.y, width, height, fill:"black"}),
                            h("path", {d:pathD, 
                                stroke:"white", 
                                'stroke-width': thickness, 
                                transform:"translate(" + frame.x + " " +  frame.y + ")"})
                            ]));

                    childs.push(h("foreignObject", {
                        width: frame.width,
                        height: frame.height,
                        x: frame.x,
                        y: frame.y,
                        mask: "url(#" + id + ")"
                    },
                        h("div", { width: "100%", height: "100%", "class": fillR["class"] })));
                    return true;
                })() ||
                position == BorderPosition.Outer && (() => {
                    let width = frame.width + 2 * thickness;
                    let height = frame.height + 2 * thickness;
                    // let clipId = "border" + objectId(border) + "-clippath-" + i;
                    let mask1Id = "border" + objectId(border) + "-mask1-" + i;

                    childs.push(h("mask", {id:mask1Id}, [
                        h("rect", {x:0, y: 0, width, height, fill:"white"}),
                        h("path", {d:pathD, fill:"black"})
                        ]));

                    let mask2Id = "border" + objectId(border) + "-mask2-" + i;
                    childs.push(h("mask", {id:mask2Id}, [
                        h("rect", {x:frame.x, y: frame.y, width, height, fill:"black"}),
                        h('path', { d:pathD, 
                            stroke: "white", 
                            'stroke-width': 2 * thickness, 
                            mask:"url(#" + mask1Id + ")",
                            transform:"translate(" + frame.x + " " +  frame.y + ")"}
                            )
                        ]));

                    childs.push(h("foreignObject", {
                        width: frame.width,
                        height: frame.height,
                        x: frame.x,
                        y: frame.y,
                        mask: "url(#" + mask2Id + ")"
                    },
                        h("div", { width: "100%", height: "100%", "class": fillR["class"] })));
                    return true;
                })()) ||

                ( //
                    position == BorderPosition.Inner && (() => {
                        let x = frame.x;
                        let y = frame.y;
                        let id = "border" + objectId(border) + "-clippath-" + i;
                        let n = h("clipPath", { id }, h("path", {
                            d: pathD
                        }));
                        childs.push(n);

                        childs.push(h('path', { d:pathD, 
                            fill: "none", 
                            stroke: fillR.fill, 
                            'stroke-width': 2 * thickness, 
                            transform:"translate(" + x + " " +  y + ")", 
                            "clip-path":"url(#" + id + ")"}));

                        return true;
                    })() ||
                    position == BorderPosition.Center && (() => {
                        let x = frame.x;
                        let y = frame.y;
                        childs.push(h('path', { d:pathD, 
                            fill: "none", 
                            stroke: fillR.fill, 
                            'stroke-width': thickness, 
                            transform:"translate(" + x + " " +  y + ")"
                            }));
                        return true;
                    })() ||
                    position == BorderPosition.Outer && (() => {
                        let width = frame.width + 2 * thickness;
                        let height = frame.height + 2 * thickness;
                        let id = "border" + objectId(border) + "-mask-" + i;

                        childs.push(h("mask", {id}, [
                            h("rect", {x:0, y: 0, width, height, fill:"white"}),
                            h("path", {d:pathD, fill:"black"})
                            ]));

                        childs.push(h('path', {d:pathD, 
                            fill: "none", 
                            stroke: fillR.fill, 
                            'stroke-width': 2 * thickness, 
                            transform:"translate(" + frame.x + " " +  frame.y + ")", 
                            mask: "url(#" + id + ")"
                            }));
                        return true;
                    })())
        }

        if (childs.length == 0) {
            // todo
            return h('path', {d:pathD, "fill-opacity": 1, stroke: 'none', 'stroke-width': 0, transform:"translate(" + frame.x + " " +  frame.y + ")", width: frame.width, height: frame.height });
        }
        else if (childs.length == 1) {
            return childs[0];
        }
        else {
            return h("g", childs);
        }
    },

    data() {
        return {
            //   componentKey: 0,
        };
    },

    methods: {
        // forceRerender() {
        //   this.componentKey += 1;  
        // },
        // bubbleEvent(event, args, forceAsync) {
        // 	return this.$parent && this.$parent.bubbleEvent(event, args, forceAsync);
        // }
    },

    created() {
        // this.data.onChange(this.forceRerender.bind(this));
    },
})
</script>
