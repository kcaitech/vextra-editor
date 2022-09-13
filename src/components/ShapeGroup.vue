<!-- <template>
<g transform="translate(100,231)">
</g>
</template> -->

<script lang="ts">
// import { Vue } from 'vue-class-component';
import { h, defineComponent } from 'vue';
import comsMap from './comsmap'
import { GroupShape } from "../data/shape";
import Rectangle from "./Rectangle.vue";
import ShapePath from "./ShapePath.vue"
import ImageView from "./ImageView.vue"
import TextView from "./TextView.vue";
import { render as gR } from "@/render/group";
import { transform } from '@/render/basic';

export default defineComponent({
    name: "ShapeGroup",
    props: {
        data: {
            type: GroupShape,
            required: true,
        },
        boolop: {
            type: Number,
            required: true,
        },
    },

    components: {
        Rectangle,
        // ShapeGroup,
        ShapePath,
        ImageView,
        TextView,
    },
    
    render() {
        return transform(gR(this.data, this.boolop, comsMap), h);
    }
})
</script>

<style scoped>
</style>