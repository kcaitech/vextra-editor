<script lang="ts">
import { h, defineComponent } from 'vue';
import comsMap from './comsmap'
import { render as gR } from "@/render/group";
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
        return transform(gR(this.data, this.boolop, comsMap), h);
    }
})
</script>
