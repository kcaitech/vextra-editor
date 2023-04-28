<template>
    <ul>
        <li v-for="(item, index) in items" :key="item.id">
            {{ index }}---{{ item.id }}----{{ item.name }}---{{ item.created_at }}---{{ item.updated_at }}<br/>
            {{ index }}---{{ item.id }}----{{ item.name }}---{{ item.created_at }}---{{ item.updated_at }}
        </li>
    </ul>
    <button @click="getUser">test</button>
    <p>Message is: {{ message }}</p>
    <input v-model="message" placeholder="edit me" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios';
import { apiGetUserInfo, apiGetUserItems } from '@/apis/users'
const message = ref('')

var items: any
var index: any

async function getUser() {
    const response = await axios.get('https://api.github.com/search/repositories?q=language:python&sort=stars');
    const x = response.data.items;
    items = x;
    console.log(items.id)
    

}

</script>
<style lang="scss" scoped>
ul {
    overflow-y: scroll;
    width: 800px;
    height: 800px;
    list-style-type: none;
}
</style>
