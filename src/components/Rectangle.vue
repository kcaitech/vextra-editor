
<script lang="ts">
import { Shape } from '@/data/shape';
import { h, defineComponent } from 'vue';
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import { transform } from '@/render/basic';

export default defineComponent({
    name: 'RectangleView',
    props: {
        data: {
            type: Shape,
            required: true,
        },
        boolop: {
            type: Number,
            required: true,
        },
    },

    render() {

        // if (this.data.booleanOperation != BooleanOperation.None) {
        //     // todo 只画selection
        //     return;
        // }

        let frame = this.data.frame;
        let childs = [];
        let path = this.data.getPath(true);
        // fill
        childs.push(...fillR(this.data, path));
        // border
        childs.push(...borderR(this.data, path));
        
        if (childs.length == 0) {
            // todo
            return h('rect', { "fill-opacity": 1, stroke: 'none', 'stroke-width': 0, x: frame.x, y: frame.y, width: frame.width, height: frame.height });
        }
        else if (childs.length == 1) {
            return transform(childs[0], h);
        }
        else {
            return h("g", transform(childs, h));
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