<!-- <template>
    <rect fill={{fill}} stroke={{stroke}} x={{x}} y={{y}} width={{width}} height={{height}}></rect>
</template> -->

<script lang="ts">
import { Shape } from '@/data/shape';
import { FillType, GradientType } from '@/data/style';
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
        let fills = style.fills;
        let fill = fills.length > 0 && fills[0];
        let color = fill && fill.color;
        let fillStr = "none";
        let _class = undefined;
        switch (fill && fill.fillType || FillType.SolidColor) {
            case FillType.SolidColor:
                if (color) {
                    fillStr = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
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
            case FillType.Pattern:
                break;
        }

if (_class) {
    return h("foreignObject", {width: frame.width, height: frame.height, x:frame.x, y: frame.y},
        h("div", {width:"100%", height:"100%", "class": _class}));
}
else {
        //console.log("receive", url);
        return h('rect', { "class": _class, fill: fillStr, "fill-opacity": color ? color.alpha : 1, stroke: 'rgb(0,0,0)', 'stroke-width': 1, x: frame.x, y: frame.y, width: frame.width, height: frame.height });
}
    },

    // data() {
    //     // return {
    //     //     componentKey: 0,
    //     // };
    // },

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
</style>