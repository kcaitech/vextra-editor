<!-- <template>
<g transform="translate(100,231)">
</g>
</template> -->

<script lang="ts">
// import { Vue } from 'vue-class-component';
import { h, defineComponent, VNodeArrayChildren } from 'vue';
import { Shape } from "../data/shape";
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import { transform } from '@/render/basic';

export default defineComponent({
    name: "ShapeBool",
    props: {
        data: {
            type: Shape,
            required: true,
        },
        boolop: {
            type: Number,
            required: true,
        },
        path: {
            type: String,
            required: true,
        }
    },

    components: {
    },
    
    render() {
        
        // let frame = this.data.frame;
        let path = this.path;
        let childs = [];

        // fill
        childs.push(...fillR(this.data, path));

        // border
        childs.push(...borderR(this.data, path));
        
        // ----------------------------------------------------------
        // shadows todo

        if (childs.length == 0) {
            return h('path', {
                d: path,
                "fill-opacity": 1,
                fill: 'none',
                stroke: 'none',
                'stroke-width': 0,
                // transform: "translate(" + frame.x + " " + frame.y + ")",
            });
        }
        else if (childs.length == 1) {
            return transform(childs[0], h);
        }
        else {
            return h("g", transform(childs, h));
        }
    }
})
</script>

<style scoped>
</style>