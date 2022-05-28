
<script lang="ts">
import { objectId } from '@/basic/objectid';
import { PathShape, Point, ShapeFrame } from '@/data/shape';
import { Border, BorderPosition, Fill, FillType, Gradient, GradientType, Stop } from '@/data/style';
import { h, defineComponent, VNodeArrayChildren } from 'vue';
import parseGradient from './gradientparser';
import { parsePath } from './pathparser';

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
        // let pc = this.data.pointsCount;

        // ----------------------------------------------------------
        // 拆出到render/layout
        let pathD = parsePath(this.data, 0, 0, frame.width, frame.height);

        // ----------------------------------------------------------

        // return h('path', {d:pathD, fill:'none', stroke: 'rgb(0,0,0)', 'stroke-width':1});
        let style = this.data.style;
        let fillsCount = style.fillsCount;
        let childs:VNodeArrayChildren = [];

        // const parseFill = (fill: Fill | Border) => {
        //     let color = fill.color;
        //     let fillStr = "none";
        //     let _class = undefined;
        //     let fillType = fill.fillType;
        //     fillType == FillType.SolidColor &&
        //         (fillStr = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")") ||
        //         fillType == FillType.Gradient && (() => {
        //             let g_ = parseGradient(fill.gradient as Gradient, frame, childs);
        //             let gid = g_.id;
        //             let gStyle = g_.style;

        //             gid && gid.length > 0 &&
        //                 (gType == GradientType.Angular && (_class = "" + gid) ||
        //                     (fillStr = "url(#" + gid + ")"))
        //             return true;
        //         })() ||
        //         fillType == FillType.Pattern && (() => {
        //             return true;
        //         });
        //     return { fill: fillStr, "class": _class };
        // }


        for (let i = 0; i < fillsCount; i++) {
            let fill = style.getFillByIndex(i);
            if (!fill.isEnabled) {
                continue;
            }
            let color = fill.color;
            let fillType = fill.fillType;
            fillType == FillType.SolidColor && (() => {
                childs.push(h('path', { d: pathD, 
                    fill: "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")", 
                    "fill-opacity": color ? color.alpha : 1, 
                    stroke: 'none', 
                    'stroke-width': 0, 
                    transform: "translate(" + frame.x + " " + frame.y + ")", 
                    width: frame.width, 
                    height: frame.height 
                }));
                return true;
            })() ||
            fillType == FillType.Gradient && (() => {
                let g_ = parseGradient(fill.gradient as Gradient, frame);
                if (g_.node) {
                    childs.push(g_.node);
                }
                let gid = g_.id;
                let gStyle = g_.style;
                // let gType = fill.gradient?.gradientType;
                if (gStyle) {
                    let id = "fill" + objectId(fill) + "-clippath-" + i;
                    childs.push(h("clipPath", { id }, h("path", {
                        d: pathD
                    })));
                    childs.push(h("foreignObject", {
                        width: frame.width, height: frame.height, x: frame.x, y: frame.y,
                        "clip-path": "url(#" + id + ")"
                    },
                        h("div", { width: "100%", height: "100%", style: gStyle })));
                }
                else {
                    childs.push(h('path', { d: pathD, 
                        fill: "url(#" + gid + ")", 
                        "fill-opacity": color ? color.alpha : 1, 
                        stroke: 'none', 
                        'stroke-width': 0, 
                        transform: "translate(" + frame.x + " " + frame.y + ")", 
                        width: frame.width, 
                        height: frame.height 
                    }));
                }
                return true;
            })()
        }

        // ----------------------------------------------------------
        // border
        const bc = style.bordersCount;
        for (let i = 0; i < bc; i++) {
            const border: Border = style.getBorderByIndex(i);
            if (!border.isEnabled) {
                continue;
            }
            const thickness = border.thickness;
            const position = border.position;
            // const fillR = parseFill(border);

            // border svg支持的效果
            // outer 双倍+mask
            // center 正常
            // inner 双倍+<clip-path></clip-path>
            // 需要css支持的效果
            // 上面的线条纯黑做mask

            let fillType = border.fillType;
            let gradientType = border.gradient && border.gradient.gradientType;

            fillType == FillType.Gradient && gradientType == GradientType.Angular && (() => {
                let g_ = parseGradient(border.gradient as Gradient, frame);
                if (g_.node) {
                    childs.push(g_.node);
                }
                position == BorderPosition.Inner && (() => {
                    let clipId = "border" + objectId(border) + "-clippath-" + i;
                    let id = "border" + objectId(border) + "-mask1-" + i;
                    let x = frame.x;
                    let y = frame.y;
                    let width = frame.width;
                    let height = frame.height;

                    // 另外一个方法
                    // let id2 = "border" + objectId(border) + "-mask2-" + i;
                    // childs.push(h("mask", {id, width, height}, [
                    //     h("rect", {x : 0, y : 0, width, height, fill:"black"}),
                    //     h("path", {d: pathD, fill:"white"})
                    // ]))
                    // childs.push(h("mask", {id:id2, width, height}, [
                    //     h("rect", {x:0, y:0, width, height, fill:"black"}),
                    //     h("path", {d: pathD, 
                    //         fill:"black", 
                    //         stroke:"white", 
                    //         "stroke-width": 2*thickness, 
                    //         mask:"url(#" + id + ")"})
                    // ]))

                    childs.push(h("g", { transform: "translate(" + frame.x + " " + frame.y + ")" }, [

                        h("mask", {
                            id,
                            width,
                            height
                        }, [
                            h("rect", {
                                x: 0,
                                y: 0,
                                width,
                                height,
                                fill: "black"
                            }),
                            h("clipPath", { id: clipId }, h("path", {
                                d: pathD
                            })),
                            h('path', {
                                d: pathD,
                                stroke: "white",
                                'stroke-width': 2 * thickness,
                                "clip-path": "url(#" + clipId + ")"
                            })
                        ]),

                        h("foreignObject", {
                            x: 0,
                            y: 0,
                            width,
                            height,
                            mask: "url(#" + id + ")"
                        },
                            h("div", { width: "100%", height: "100%", style:g_.style }))
                    ]));

                    return true;
                })() ||
                position == BorderPosition.Center && (() => {
                    let x = frame.x - thickness / 2;
                    let y = frame.y - thickness / 2;
                    let width = frame.width + thickness;
                    let height = frame.height + thickness;

                    let id = "border" + objectId(border) + "-mask-" + i;
                    childs.push(h("mask", {
                        id,
                        maskContentUnits: "userSpaceOnUse",
                        width,
                        height
                    }, [
                        h("rect", { x, y, width, height, fill: "black" }),
                        h("path", {
                            d: pathD,
                            stroke: "white",
                            'stroke-width': thickness,
                            transform: "translate(" + frame.x + " " + frame.y + ")",
                        })
                    ]));

                    childs.push(h("foreignObject", {
                        width,
                        height,
                        x,
                        y,
                        mask: "url(#" + id + ")"
                    },
                        h("div", { width: "100%", height: "100%", style:g_.style })));
                    return true;
                })() ||
                position == BorderPosition.Outer && (() => {
                    let width = frame.width + 2 * thickness;
                    let height = frame.height + 2 * thickness;
                    let x = frame.x - thickness;
                    let y = frame.y - thickness;
                    let mask1Id = "border" + objectId(border) + "-mask1-" + i;
                    let mask2Id = "border" + objectId(border) + "-mask2-" + i;
                    childs.push(h("mask", {
                        id: mask2Id,
                        width,
                        height
                    }, [

                        h("mask", {
                            id: mask1Id,
                            width,
                            height
                        }, [
                            h("rect", { x: -thickness, y: -thickness, width, height, fill: "white" }),
                            h("path", { d: pathD, fill: "black" })
                        ]),
                        h("rect", { x, y, width, height, fill: "black" }),
                        h('path', {
                            d: pathD,
                            stroke: "white",
                            'stroke-width': 2 * thickness,
                            mask: "url(#" + mask1Id + ")",
                            transform: "translate(" + frame.x + " " + frame.y + ")"
                        })
                    ]));

                    childs.push(h("foreignObject", {
                        width,
                        height,
                        x,
                        y,
                        mask: "url(#" + mask2Id + ")"
                    },
                        h("div", { width: "100%", height: "100%", style:g_.style })));
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
                        let id = "border" + objectId(border) + "-clippath-" + i;
                        childs.push(h("g", {transform: "translate(" + x + " " + y + ")"}, [
                            h("clipPath", { id }, h("path", {
                                d: pathD
                            })),
                            h('path', {
                                d: pathD,
                                fill: "none",
                                stroke,
                                'stroke-width': 2 * thickness,
                                "clip-path": "url(#" + id + ")"
                            })
                        ]));
                        return true;
                    })() ||
                    position == BorderPosition.Center && (() => {
                        let x = frame.x;
                        let y = frame.y;
                        childs.push(h('path', {
                            d: pathD,
                            fill: "none",
                            stroke,
                            'stroke-width': thickness,
                            transform: "translate(" + x + " " + y + ")"
                        }));
                        return true;
                    })() ||
                    position == BorderPosition.Outer && (() => {
                        let width = frame.width + 2 * thickness;
                        let height = frame.height + 2 * thickness;
                        // let x = frame.x - thickness;
                        // let y = frame.y - thickness;
                        let id = "border" + objectId(border) + "-mask-" + i;
                        childs.push(h("g", {transform: "translate(" + frame.x + " " + frame.y + ")"}, [
                            h("mask", { id }, [
                                h("rect", { x: -thickness, y: -thickness, width, height, fill: "white" }),
                                h("path", { d: pathD, fill: "black" })
                            ]),
                            h('path', {
                                d: pathD,
                                fill: "none",
                                stroke,
                                'stroke-width': 2 * thickness,
                                mask: "url(#" + id + ")"
                            })
                        ]));
                        return true;
                    })()
                 })() ||
                    fillType == FillType.Pattern && (() => {
                        return true; // todo
                    })
        }
        // ----------------------------------------------------------
        // shadows todo

        if (childs.length == 0) {
            return h('path', {
                d: pathD,
                "fill-opacity": 1,
                fill: 'none',
                stroke: 'none',
                'stroke-width': 0,
                transform: "translate(" + frame.x + " " + frame.y + ")",
            });
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
