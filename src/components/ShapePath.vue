
<script lang="ts">
import { BoolOp, PathShape } from '@/data/shape';
import { h, defineComponent, VNodeArrayChildren } from 'vue';
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"

export default defineComponent({
    name: 'ShapePathView',
    props: {
        data: {
            type: PathShape,
            required: true,
        },
        boolop: {
            type: Number,
            required: true,
        },
    },

    render() {
        // if (this.data.boolOp != BoolOp.None) {
        //     // todo 只画selection
        //     return;
        // }
        
        let frame = this.data.frame;
        let path = this.data.getPath(true);
        let childs:VNodeArrayChildren = [];

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
