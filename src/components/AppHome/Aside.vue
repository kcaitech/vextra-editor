<script setup lang="ts" >
import {
    Clock,
    Star,
    Delete,
    Share,
    BottomLeft,
    Menu as IconMenu,
} from '@element-plus/icons-vue'
import { router } from '@/router'
import { FilePicker } from '../common/filepicker';
import { Repository } from '@kcdesign/data/data/transact';
import { LzDataLocal } from '@/basic/lzdatalocal'; // todo
import { importSketch } from '@kcdesign/data/io';
import { Zip } from "@pal/zip";
import {defineProps} from 'vue';
import Main from '@/components/AppHome/Main.vue';



const picker = new FilePicker((file) => {
    if (!file) return;
    const lzdata = new LzDataLocal(new Zip(file));
    const repo = new Repository();
    importSketch(file.name, lzdata, repo).then((document) => {
        window.document.title = document.name;
        (window as any).skrepo = repo;
        (window as any).sketchDocument = document;
        router.push({ name: 'document' });
    })
});

function Setindex(a: any) {
    let x: any = a
    localStorage.setItem('index', x)
}
const x = localStorage.getItem('index')

</script>

<template>
    <el-row class="tac">
        <el-col :span="12">
            <div class="logo">
                <el-icon size="50">
                    <Clock />
                </el-icon>
                <h3 class="mb-2" style="font-size:24px">ProtoDesign</h3>
            </div>
            <div class="new">
                <button class="newfile">新建文件</button>
                <button class="openfile" @click="picker.invoke()">打开文件</button>
            </div>
            <el-menu :default-active="x" active-text-color="#ffd04b" class="el-menu-vertical-demo" text-color="#000000">
                <router-link to="/apphome/recently" title="最近打开"><el-menu-item index="1" @click="Setindex(1)">
                        <el-icon>
                            <Clock />
                        </el-icon>
                        <span>最近打开</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/starfile"><el-menu-item index="2" @click="Setindex(2)">
                        <el-icon>
                            <Star />
                        </el-icon>
                        <span>标星文件</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/meshare"><el-menu-item index="3" @click="Setindex(3)">
                        <el-icon>
                            <Share />
                        </el-icon>
                        <span>我的文件</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/shareme"><el-menu-item index="4" @click="Setindex(4)">
                        <el-icon>
                            <BottomLeft />
                        </el-icon>
                        <span>收到的共享文件</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/recyclebin" props=""><el-menu-item index="5" @click="Setindex(5)">
                        <el-icon>
                            <Delete />
                        </el-icon>
                        <span>回收站</span>
                    </el-menu-item></router-link>

            </el-menu>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
a {
    text-decoration: none;
}

.el-row {
    height: 100vh;
    background: rgba(216, 216, 216, 0.22);

    .el-col {
        max-width: 100%;
        flex: 1;

        .new {
            display: flex;
            flex-direction: column;
            margin: 40px 20px 40px 20px;

            button {
                height: 50px;
                margin: 20px 0 20px 0;
                background: white;
                border: none;
                font-size: 16px;
                letter-spacing: 2px;
                font-weight: bold;
                border-radius: 5px;


                &.newfile {
                    background: rgb(69, 69, 248);
                    color: #ffffff;
                }

                &:active {
                    background: rgb(203, 203, 203);
                }
            }

        }

        .logo {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            margin-left: 20px;

            .el-icon {
                margin-right: 10px;
            }
        }

        .el-menu {
            border: none;
            background: none;


            .el-menu-item {
                border-radius: 5px;
                margin: 20px;

                &:hover {
                    background: rgb(70, 76, 248);
                    color: white
                }

                &.is-active {
                    color: #ffffff;
                    background: blue;
                }
            }
        }
    }
}
</style>