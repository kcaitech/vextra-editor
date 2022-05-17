// Navigation

<!-- <template>

<div v-for="info in infos">
    <button @click="select(info)">{{info.name}}</button>
</div>

</template> -->

<script lang="ts">
import { Document } from '@/data/document';
import { Page } from '@/data/page';
import { defineComponent, h } from 'vue';

export default defineComponent({
    name: 'NavigationView',
    props: {
        data: {
            type: Document,
            required: true,
        },
        select: {
            type: Function,
            required: true
        },
    },

    // data() {
    // },

    methods: {
        // bubbleEvent(event, args, forceAsync) {
		//     return this.$parent && this.$parent.bubbleEvent(event, args, forceAsync);
	    // }
    },

    render() {
        var childs = [];
        var pc = this.data.pageCount;
        for (var i = 0; i < pc; i++) {
            var page:Page = this.data.peekPageByIndex(i);
            var name = page ? page.name : "" + i;
            var info = {name, index:i};
            var onclick = (function(info, _this) {
                return function() {
                    _this.select(info.index);
                }
            })(info, this);
            childs.push(h("button", {onclick}, name));
        }
        return h("div", {}, childs);
    }
})

</script>

<style scoped>
button {
    width: 100px;
    height: 30px;
}
</style>