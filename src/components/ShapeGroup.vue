<script lang="ts">
import { h, defineComponent } from 'vue';
import comsMap from './comsmap'
import { GroupShape } from "../data/shape";
import { render as gR } from "@/render/group";
import { transform } from '@/render/basic';

export default defineComponent({
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

    render() {
        return transform(gR(this.data, this.boolop, comsMap), h);
    }
})
</script>
