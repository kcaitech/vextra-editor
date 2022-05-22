<script lang="ts">
import { TextShape } from '@/data/shape';
import { FillType } from '@/data/style';
import { Para } from '@/data/text';
import { h, defineComponent } from 'vue';
export default defineComponent({
    name: 'TextView',
    props: {
        data: {
            type: TextShape,
            required: true,
        }
    },

    render() {
        let text = this.data.text;
        let pc = text.paraCount;
        let childs = [];
        let y = 0;
        for (let i = 0; i < pc; i++) {
            let para = text.getParaByIndex(i);
            let paraText = para.text;
            let sc = para.spansCount;
            let maxSize = 0;
            
            for (let j = 0; j < sc; j ++) {
                let span = para.getSpanByIndex(j);
                let size: number = span.fontSize || 0;


                maxSize = Math.max(maxSize, size);
            }
            childs.push(h('text', {x: 0, y: y}, para.text));
            y = y + maxSize;
        }
        var frame = this.data.frame;
        return h('g', {transform:'translate('+frame.x+','+frame.y+')'}, childs);
    }
});
</script>