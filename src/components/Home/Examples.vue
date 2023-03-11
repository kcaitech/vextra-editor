<template>
    <div class="examples">
        <h2>See some examples:</h2>
        <ul>
            <li v-for="file in examples" @click="onOpen(file.uri)" :key="file.uri">{{ file.name }}</li>
        </ul>
    </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const emit = defineEmits<{
    (e: 'selectExample', uri: string): void;
}>();
const props = defineProps<{
    examples: { name: string, uri: string }[]
}>();

// const fileList = ref([]);
// fetch(process.env.PWD + '/samples/manifest.json')
//   .then((res) => res.json())
//   .then((arr) => {
//     fileList.value = arr;
//   });

function onOpen(uri: string) {
    //   fetch(process.env.PWD + '/samples/' + filename)
    //     .then((res) => res.arrayBuffer())
    //     .then((buffer) => {
    //       emit('selectExample', { buffer, filename });
    //     });
    emit('selectExample', uri);
}
</script>
<style scoped>
.examples {
    display: flex;
    flex-direction: column;
    margin-left: 40px;
}

h2 {
    font-size: 18px;
}

li {
    cursor: pointer;
    padding: 4px 0;
}

li:hover {
    color: #1c7dff;
}

ul {
    padding-inline-start: 1em;
}</style>
