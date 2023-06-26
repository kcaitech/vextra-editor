<script setup lang="ts" >
import {
    Clock,
    Star,
    Delete,
    BottomLeft,
    Plus,
    Folder,
    FolderOpened,
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
    sessionStorage.setItem('index', a)
}
const x = sessionStorage.getItem('index')

// window.addEventListener('popstate', function () {
//     if (location.hash.toLowerCase() == '#/apphome/starfile') {
//         sessionStorage.setItem('index', '2')
//         sessionStorage.setItem('title', t('home.star_file'))
//         location.reload()
//     }
//     if (location.hash.toLowerCase() == '#/apphome/recently') {
//         sessionStorage.setItem('index', '1')
//         sessionStorage.setItem('title', t('home.recently_opened'))
//         location.reload()
//     }
//     if (location.hash.toLowerCase() == '#/apphome/meshare') {
//         sessionStorage.setItem('index', '3')
//         sessionStorage.setItem('title', t('home.file_shared'))
//         location.reload()
//     }
//     if (location.hash.toLowerCase() == '#/apphome/shareme') {
//         sessionStorage.setItem('index', '4')
//         sessionStorage.setItem('title', t('home.shared_file_received'))
//         location.reload()
//     }
//     if (location.hash.toLowerCase() == '#/apphome/recyclebin') {
//         sessionStorage.setItem('index', '5')
//         sessionStorage.setItem('title', t('home.recycling_station'))
//         location.reload()
//     }
// });

</script>
<template>
    <el-row class="tac">
        <el-col :span="12">
            <div class="logo">
                <div style="width: 108px;height: 108px;"><img :src="avatar" alt="ProtoDesign" /></div>
                <h3 class="mb-2" style="font-size:24px">ProtoDesign</h3>
            </div>
            <div class="new">
                <button class="newfile" @click="newFile"> <el-icon :size="22">
                        <Plus />
                    </el-icon>{{ t('home.New_file') }}</button>
                <button class="openfile" @click="picker.invoke()"><el-icon :size="22">
                        <FolderOpened />
                    </el-icon>{{ t('home.open_local_file') }}</button>
            </div>
            <el-menu :default-active="x ? x : '1'" active-text-color="#ffd04b" class="el-menu-vertical-demo"
                text-color="#000000">
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
                            <Folder />
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

.logo {
    position: sticky;
    top: 0px;
    left: 0px;
    margin: auto;
    background-color: white;
    z-index: 2;
}

.el-row {
    height: 100vh;
    overflow: hidden;
    overflow-y: auto;
    background-color: white;

    .el-col {
        max-width: 100%;
        flex: 1;

        .logo {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;

            .el-icon {
                margin-right: 10px;
            }
        }

        .new {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 20px 20px auto;

            button {
                width: 280px;
                height: 56px;
                margin: 0px 0 20px 0;
                border: none;
                font-size: 16px;
                letter-spacing: 2px;
                font-weight: bold;
                border-radius: 5px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .newfile {
                background: rgb(69, 69, 248);
                color: #ffffff;
                &:hover {
                    background-color:  rgba(69, 69, 248, 0.5);
                }

                &:active {
                    background-color:  rgb(48, 48, 255);
                }
            }

            .openfile {
                &:hover {
                    background-color: rgba(192, 192, 192, 0.6);
                }

                &:active {
                    background-color: rgba(170, 170, 255, 0.6)
                }

            }


        }

        .el-menu {
            border: none;
            background: none;

            .el-menu-item {
                border-radius: 5px;
                margin: 10px;

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