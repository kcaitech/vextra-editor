
<script lang="ts">
import { Gradient, GradientType, Stop } from '../data/style';
import { defineComponent, h, VNodeArrayChildren } from 'vue';
import comsMap from './comsmap'
import { Page } from '../data/page';
import { ShapeType } from "@/data/shape";
import Rectangle from "./Rectangle.vue";
import ShapeGroup from "./ShapeGroup.vue"
import ShapePath from "./ShapePath.vue"
import ImageView from "./ImageView.vue"
import TextView from "./TextView.vue";

export default defineComponent({
    name: 'PageView',
    props: {
        data: {
            type: Page,
            required:true,
        }
    },

    components: {
        Rectangle,
        ShapeGroup,
        ShapePath,
        ImageView,
        TextView,
    },

    methods: {
        
    },

    render() {
        const renderDefs = () => {
            let defsChilds: VNodeArrayChildren = [];
            return [h('defs', {}, defsChilds)];
        }

        let childs: VNodeArrayChildren = renderDefs();

        // var childsCache = this.m_childsCache// || (this._childsCache = new WeakMap());
        var cc = this.data.childsCount || 0;

        var frame = this.data.frame;
        var right = frame.width || 800;
        var bottom = frame.height || 600;
        var left = 0;
        var top = 0;

        // todo reuse childs
        for (var i = 0; i < cc; i++) {
            var child = this.data.getChildByIndex(i);

            var cf = child.frame;
            right = Math.max(right, cf.x + cf.width + 1);
            bottom = Math.max(bottom, cf.y + cf.height + 1);
            left = Math.min(left, cf.x);
            top = Math.min(top, cf.y);

            let com = comsMap.get(child.type) || comsMap.get(ShapeType.Rectangle);
            let node = h(com, { data: child, boolop: this.data.boolOp });
            childs.push(node);
        }

        return h('svg', {
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            "xmlns:xhtml":"http://www.w3.org/1999/xhtml",
            viewBox: "" + left + " " + top + " " + (right - left) + " " + (bottom - top),
            width: Math.min(1000, right - left),
            height: Math.min(800, bottom - top)
        },
            childs);
    }

})

</script>

<style scoped>
</style>