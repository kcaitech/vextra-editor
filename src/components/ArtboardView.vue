<script lang="ts">
import { h, defineComponent, VNodeArrayChildren } from 'vue';
import comsMap from './comsmap'
import { renderGroupChilds as gR } from "@/render/group";
import { transform } from '@/render/basic';
import { Artboard } from '@/data/artboard';

export default defineComponent({
    props: {
        data: {
            type: Artboard,
            required: true,
        },
        boolop: {
            type: Number,
            required: true,
        },
    },

    render() {
        // name
        // border
        // background

        const childs: VNodeArrayChildren = [];

        const frame = this.data.frame;

        // background
        if (this.data.hasBackgroundColor) {
            const color = this.data.backgroundColor;

            childs.push(h("rect", {
                x: 0, y: 0, width: frame.width, height: frame.height,
                fill: "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")",
                "fill-opacity": color ? color.alpha : 1
            }))
        } else {

            childs.push(h("rect", { x: 0, y: 0, width: frame.width, height: frame.height }))
        }

        childs.push(h("text", {y: -5}, this.data.name));
        childs.push(...transform(gR(this.data, this.boolop, comsMap), h) as VNodeArrayChildren);

        return h('g', { transform: 'translate(' + frame.x + ',' + frame.y + ')' }, childs);
    }
})
</script>
