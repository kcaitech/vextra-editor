<template>
    <div class="warrp">
        <!-- 头部 -->
        <div class="header">
            <h2>拾忆记事本</h2>
            <h6>记录生活点点滴滴,写下生活每一个美好</h6>
            <div class="flex input">
                <div>
                    <select class="sele" v-model="selected" @click="uptype">
                        <option  v-for="(item,index) in seleArr" :value="item.id" :key="index">{{item.title}}</option>
                    </select>
                </div>
                <div>
                    <input type="text" class="inp" v-model="todotext">
                </div>
                <div class="que" @click="addTodo">
                    确认
                </div>
            </div>
        </div>
        <!-- 内容 -->
        <div class="max red"  v-if="todoList.length > 0 && selected === 1">
        
            <div class="flex item" v-for="(item,index) in todoList" :key="index">
                <div class="flex"> 
                    <div class="index">{{index+1}}</div>
                    <div class="fu">|</div>
                    <div>
                        {{item.conset}}
                    </div>
                </div>
                <div @click="del(index)">❌</div>
            </div>
        </div>
        <!-- 内容 -->
        <div class="max" v-if="todoTile.length > 0 && selected === 2">
            <div class="flex item" v-for="(item,index) in todoTile" :key="index">
                <div class="flex"> 
                    <div class="index">{{index+1}}</div>
                    <div class="fu">|</div>
                    <div>
                        {{item.conset}}
                    </div>
                </div>
                <div @click="del(index)">❌</div>
            </div>
        </div>
        <!-- 底部 -->
        <div v-if="(selected === 1 && todoList.length > 0) || (selected === 2 && todoTile.length > 0)">
            <!-- 总数 -->
            <div class="flex footer">
                <div>总数:{{all}}</div>
                <div @click="delArr">清楚</div>
            </div>
            <!-- 没有更多数据 -->
        </div>
        <!-- 没有更多数据 -->
        <div v-else>
            <img src="" class="img">
        </div>
    </div>
</template>

<script setup lang="ts">
import {reactive, ref,watchEffect} from 'vue'
    let todotext=ref('')//拿到input框的值
    let id=ref(3)//声名id
    let selected=ref(1)//类型的值
    let all=ref(0)//显示总条数
    //类型数组
    const seleArr=reactive([
        {
            id:1,
            title:"内容"
        },{
            id:2,
            title:"标题"
        }
    ])
    //接口声名
    interface ITodo{
        id:number,
        conset:string
    }
    //内容的数组
    let todoList:ITodo[]=reactive([
        {
            id:1,
            conset:"内容"
        },{
            id:2,
            conset:"内容1"
        },{
            id:3,
            conset:"内容2"
        }
    ])
     //标题数组
    let todoTile:ITodo[]=reactive([
        {
            id:1,
            conset:"内容"
        },
    ])
    //添加
    const addTodo=()=>{
        if(!todotext.value){
            alert('请填写要做的事情')
            return false
        }
        let obj={
            id:++id.value,
            conset:todotext.value
        }
        // console.log(obj)
        //判断我们需要填写的类型
        if (selected.value === 1) {
            // 内容
            todoList.push(obj)
            console.log('todosTitle',)
        } else {
            // 标题
            todoTile.push(obj)
            console.log('todosTitle',)
        }
        todotext.value=""
    }
    //删除
    const del=(index:number)=>{
        selected.value === 1 && todoList.splice(index, 1)
        selected.value === 2 && todoTile.splice(index, 1)
    }
    //批量删除
    const delArr=()=>{
        selected.value === 1 && (todoList.length = 0)
        selected.value === 2 && (todoTile.length = 0)
    }
    //切换类型
    const uptype=(e:any)=>{
        todotext.value=""
        selected.value=parseInt(e.target.value)
    }
    // 监听数据变化
    watchEffect(() => {
        selected.value === 1 &&  (all.value = todoList.length)
        selected.value === 2 &&  (all.value = todoTile.length)
    })
</script>

<style lang="scss" scoped>

/* .warrp{
        border: 1px solid red;
    } */
    .img{
        width: 600px;
        height: 100%;
    }
    .flex{
        display: flex;
    }
    .header{
        background-color: skyblue;
        padding: 0 20px;
        box-sizing: border-box;
        height: 150px;
        width: 600px;
    }
    .max{
        padding:20px;
        background-color: #fff;
    }
    .item{
        height: 50px;
        line-height: 50px;
        border-bottom:1px dashed black ;
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .fu{
        margin: 0 10px;
    }
    .footer{
        padding: 0 20px;
        box-sizing: border-box;
        justify-content: space-between;
    }
    .input{
        width: 80%;
        height: 40px;
        border-radius: 8px;
        border: 1px solid red;
    }
    .sele{
        height: 100%;
        border:none;
        width: 70px;
        line-height: 100%;
        border-radius: 8px 0 0 8px;
        outline:none;
    }
    .inp{
        height: 38px;
        border:none;
        width: 300px;
        outline:none;
        line-height: 100%;
    }
    .que{
        width: 74px;
        height: 100%;
        text-align: center;
        line-height: 40px;
        border-radius: 0 8px 8px 0;
        background-color: #ccc;
    }
</style>
