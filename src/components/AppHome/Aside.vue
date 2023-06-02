<script setup lang="ts" >
import {
    Clock,
    Star,
    Delete,
    Share,
    BottomLeft,
    Plus,
    Folder,
    Menu as IconMenu,
} from '@element-plus/icons-vue'
import { router } from '@/router'
import { FilePicker } from '../common/filepicker';
import { Repository } from '@kcdesign/data';
import { LzDataLocal } from '@/basic/lzdatalocal'; // todo
import { importSketch } from '@kcdesign/data';
import { Zip } from "@pal/zip";
import { createDocument } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { DocEditor } from '@kcdesign/data';
import avatar from '@/assets/pd-logo-svg.svg';
import { defineEmits } from 'vue';
interface Emits {
    (e: 'settitle', title: string): void;
}
const emits = defineEmits<Emits>();
const { t } = useI18n();

const picker = new FilePicker((file) => {
    if (!file) return;
    const lzdata = new LzDataLocal(new Zip(file));
    const repo = new Repository();
    importSketch(file.name, lzdata, repo).then((document: any) => {
        window.document.title = document.name;
        (window as any).skrepo = repo;
        (window as any).sketchDocument = document;
        router.push({ name: 'document' });
    })
});

function newFile() {
    const repo = new Repository();
    const nd = createDocument(t('system.new_file'), repo);
    const editor = new DocEditor(nd, repo);
    const page = editor.create(t('system.page1'));
    editor.insert(0, page);
    window.document.title = nd.name;
    (window as any).skrepo = repo;
    (window as any).sketchDocument = nd;
    router.push({ name: 'document' });
}

function Setindex(a: any, b: any) {
    emits('settitle', b)
}
</script>

<template>
    <el-row class="tac">
        <el-col :span="12">
            <div class="logo">
                <img :src="avatar" alt="ProtoDesign" />
                <h3 class="mb-2" style="font-size:24px">ProtoDesign</h3>
            </div>
            <div class="new">
                <button class="newfile" @click="newFile"> <el-icon :size="22">
                        <Plus />
                    </el-icon><span>{{ t('home.New_file') }}</span></button>
                <button class="openfile" @click="picker.invoke()"><el-icon :size="22">
                        <Folder />
                    </el-icon><span>{{ t('home.open_local_file') }}</span></button>
            </div>
            <el-menu active-text-color="#ffd04b" class="el-menu-vertical-demo" text-color="#000000">
                <router-link to="/apphome/recently"><el-menu-item index="1" @click="Setindex(1, t('home.recently_opened'))">
                        <el-icon>
                            <Clock />
                        </el-icon>
                        <span>{{ t('home.recently_opened') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/starfile"><el-menu-item index="2" @click="Setindex(2, t('home.star_file'))">
                        <el-icon>
                            <Star />
                        </el-icon>
                        <span>{{ t('home.star_file') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/meshare"><el-menu-item index="3" @click="Setindex(3, t('home.file_shared'))">
                        <el-icon>
                            <Share />
                        </el-icon>
                        <span>{{ t('home.file_shared') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/shareme"><el-menu-item index="4"
                        @click="Setindex(4, t('home.shared_file_received'))">
                        <el-icon>
                            <BottomLeft />
                        </el-icon>
                        <span>{{ t('home.shared_file_received') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/recyclebin" props=""><el-menu-item index="5"
                        @click="Setindex(5, t('home.recycling_station'))">
                        <el-icon>
                            <Delete />
                        </el-icon>
                        <span>{{ t('home.recycling_station') }}</span>
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
                display: flex;
                justify-content: center;
                align-items: center;

                span {
                    margin-left: 10px;
                }


                &.newfile {
                    background: rgb(69, 69, 248);
                    color: #ffffff;
                }

                &:active {
                    background: rgb(143, 143, 255);
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