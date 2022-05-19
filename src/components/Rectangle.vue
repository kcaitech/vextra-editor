<!-- <template>
    <rect fill={{fill}} stroke={{stroke}} x={{x}} y={{y}} width={{width}} height={{height}}></rect>
</template> -->

<script lang="ts">
import { Shape } from '@/data/shape';
import { FillType } from '@/data/style';
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
        var frame = this.data.frame;
        var style = this.data.style;
        var fills = style.fills;
        var fill = fills.length > 0 && fills[0];
        var color = fill && fill.color;
        var fillStr = "none";
        switch (fill && fill.fillType || FillType.SolidColor) {
            case FillType.SolidColor:
                if (color) {
                    fillStr = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
                }
                break;
            case FillType.Gradient:
                var gid = fill && fill.gradientId;
                if (gid && gid.length > 0) {
                    fillStr = "url(#" + gid + ")";
                }
                break;
            case FillType.Pattern:
                break;
        }

        //console.log("receive", url);
        return h('rect', { fill: fillStr, "fill-opacity": color ? color.alpha : 1, stroke: 'rgb(0,0,0)', 'stroke-width': 1, x: frame.x, y: frame.y, width: frame.width, height: frame.height });
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