<!-- <template>

<image v-bind:xlink:href="url" :x="x" :y="y" :height="height" width="width" />

</template> -->

<script lang="ts">
import { ImageShape } from '@/data/shape';
import {h, defineComponent} from 'vue';
export default defineComponent({

  name: 'ImageView',
  props: {
    data: {
        type: ImageShape,
        required: true,
    },
    boolop: {
            type: Number,
            required: true,
        },
    // url: {
    //     type: String,
    //     default: '',
    // },
    // x: {
    //     type: Number,
    //     default: 0,
    // },
    // y: {
    //     type: Number,
    //     default: 0,
    // },
    // width: {
    //     type: Number,
    //     default: 0,
    // },
    // height: {
    //     type: Number,
    //     default: 0,
    // },
  },

  data() {
    return {
    //   componentKey: 0,
      url: '',
    };
  },

  methods: {
    // forceRerender() {
    //   this.componentKey += 1;  
    // },
    // bubbleEvent(event, args, forceAsync) {
	// 	  return this.$parent && this.$parent.bubbleEvent(event, args, forceAsync);
	//   }
  },

  created() {
    //   var frame = this.data.getFrame();
    //   this.x = frame.x;
    //   this.y = frame.y;
    //   this.width = frame.width;
    //   this.height = frame.height;
  },

  mounted() {
      this.data.loadImage().then((val) => {
        this.url = val;
      })
  },

  render() {
      var frame = this.data.frame;
      return h("image", {"xlink:href": this.url, 
        x: frame.x, 
        y: frame.y, 
        width: frame.width, 
        height: frame.height});
  }
})

</script>