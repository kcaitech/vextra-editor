<script lang="ts">
import { h, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import comsMap from './comsmap'
import { BoolOp, SymbolRef } from "../data/shape";
import { renderGroupChilds as gR } from "@/render/group";
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import { transform } from '@/render/basic';

export default defineComponent({
    props: {
        data: {
            type: SymbolRef,
            required: true,
        },
        boolop: {
            type: Number,
            required: true,
        },
    },

    setup(props) {


        const reflush = ref(0);

        function updater() {
            reflush.value++;
        }

        onMounted(() => {
            props.data.loadSymbol();
            props.data.watch(updater);
        })

        onUnmounted(() => {
            props.data.unwatch(updater);
        })

        return () => {
            const sym = props.data.peekSymbol();
            if (!sym) {
                return;
            }
            let frame = props.data.frame;
            let childs = [];
            let path = props.data.getPath(true);
            // fill
            childs.push(...fillR(props.data, path));
            // border
            childs.push(...borderR(props.data, path));

            // symbol
            childs.push(...gR(sym, BoolOp.None, comsMap));

            if (childs.length == 0) {
                // todo
                return h('rect', {
                    "fill-opacity": 1,
                    stroke: 'none',
                    'stroke-width': 0,
                    x: frame.x,
                    y: frame.y,
                    width: frame.width,
                    height: frame.height
                });
            }
            // else if (childs.length == 1) {
            //     return transform(childs[0], h);
            // }
            else {
                return h("g", { transform: 'translate(' + frame.x + ',' + frame.y + ')' }, transform(childs, h));
            }
        }
    }
})
</script>

<style scoped>
</style>