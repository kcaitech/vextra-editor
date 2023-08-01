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
import { Repository, CoopRepository, Document } from '@kcdesign/data';
import { LzDataLocal } from '@/basic/lzdatalocal'; // todo
import { importSketch } from '@kcdesign/data';
import { Zip } from "@pal/zip";
import { createDocument } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { DocEditor } from '@kcdesign/data';
import { measure } from '@/layout/text/measure';
import { onUnmounted } from 'vue';

interface Emits {
    (e: 'settitle', title: string): void;
}
const emits = defineEmits<Emits>();
const { t } = useI18n();

const picker = new FilePicker((file) => {
    if (!file) return;
    const lzdata = new LzDataLocal(new Zip(file));
    const repo = new Repository();
    importSketch(file.name, lzdata, repo, measure).then((document: Document) => {
        window.document.title = document.name;
        const coopRepo = new CoopRepository(document, repo);
        (window as any).skrepo = coopRepo;
        (window as any).sketchDocument = document;
        router.push({ name: 'document' });
    })
});

function newFile() {
    const repo = new Repository();
    const nd = createDocument(t('system.new_file'), repo, measure);
    const coopRepo = new CoopRepository(nd, repo)
    const editor = new DocEditor(nd, coopRepo);
    const page = editor.create(t('system.page1'));
    editor.insert(0, page);
    window.document.title = nd.name;
    (window as any).skrepo = coopRepo;
    (window as any).sketchDocument = nd;
    router.push({ name: 'document' });
}

function Setindex(a: any, b: any) {
    emits('settitle', b)
    sessionStorage.setItem('index', a)
}
const x = sessionStorage.getItem('index')

onUnmounted(() => {
    picker.unmount();
})

</script>
<template>
    <el-row class="tac">
        <el-col>
            <div class="new">
                <button class="newfile" @click="newFile"> <el-icon>
                        <Plus />
                    </el-icon><span>{{ t('home.New_file') }}</span></button>
                <button class="openfile" @click="picker.invoke()"><el-icon>
                        <FolderOpened />
                    </el-icon><span>{{ t('home.open_local_file') }}</span></button>
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
                <router-link to="/apphome/recyclebin"><el-menu-item index="5"
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
    overflow: hidden;
    overflow-y: auto;
    background-color: white;

    .el-col {
        max-width: 100%;
        flex: 1;

        .new {
            display: block;
            text-align: center;
            margin: 20px 10px auto;

            button {
                width: 100%;
                height: 36px;
                margin: 0px 0 20px 0;
                border: none;
                font-size: 14px;
                letter-spacing: 1px;
                font-weight: 500;
                border-radius: 6px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;

                span {
                    overflow: hidden;
                    white-space: nowrap;
                }

                .el-icon {
                    font-size: 20px;
                    margin-right: 6px;
                }
            }


            .newfile {
                display: flex;
                justify-content: center;
                align-items: center;
                background: #9775fa;
                color: #ffffff;

                &:hover {
                    background-color: #9675fadc;
                }

                &:active {
                    background-color: #9775fa;
                }
            }

            .openfile {
                background-color: #f3f0ff;
                color: #9775fa;

                &:hover {
                    border: 1px #9775fa solid;
                }
            }


        }

        .el-menu {
            border: none;
            background: none;
            

            .el-menu-item {
                border-radius: 4px;
                margin: 10px;
                height: 32px;
                &:hover {
                    background-color: #f3f0ff;
                    color: #9775fa;
                }

                &.is-active {
                    font-weight: 600;
                    color: #9775fa;
                    background-color: #e5dbff;
                }
            }
        }
    }
}


@media screen and (max-width:1000px) {

    span,
    h3 {
        display: none;
    }

    .el-row .el-col .new button .el-icon {
        padding: 0;
        margin: 0;
        font-size:24px;
    }
    .el-menu-item{
        justify-content: center;
    }


    .el-icon {
        margin: 0;
        padding: 0;
        font-size: 32px;
    }

}
</style>