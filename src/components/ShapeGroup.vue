<!-- <template>
<g transform="translate(100,231)">
</g>
</template> -->

<script lang="ts">
import { Vue } from 'vue-class-component';
import { h, defineComponent } from 'vue';
import comsMap from './comsmap'
import { Shape, ShapeType } from "../data/shape";

export default defineComponent({
    name: "ShapeGroup",
    props: {
        data: {
            type: Shape,
            required: true,
        }
    },
    
    render() {
        var childs = [];
        var cc = this.data.childsCount;
        for (var i = 0; i < cc; i++) {
            var child = this.data.getChildByIndex(i);
            let com = comsMap.get(child.type) || comsMap.get(ShapeType.Rectangle);
            let node = h(com, {data:child});
            childs.push(node);
        }
        var frame = this.data.frame;
        return h('g', {transform:'translate('+frame.x+','+frame.y+')'}, childs);
    }
})
</script>

<style scoped>
</style>