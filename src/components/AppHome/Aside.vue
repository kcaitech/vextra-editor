<script setup lang="ts" >
import {
    Clock,
    Star,
    Delete,
    BottomLeft,
    Plus,
    Folder,
    FolderOpened,
} from '@element-plus/icons-vue'
import { router } from '@/router'
import { useRoute } from 'vue-router'
import { FilePicker } from '../common/filepicker';
import { Repository, CoopRepository, Document } from '@kcdesign/data';
import { LzDataLocal } from '@/basic/lzdatalocal'; // todo
import { importSketch } from '@kcdesign/data';
import { Zip } from "@pal/zip";
import { createDocument } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { DocEditor } from '@kcdesign/data';
import { Ref, computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import * as user_api from '@/apis/users'
import addTeam from '../TeamProject/addTeam.vue'
import addProject from '../TeamProject/addProject.vue';
import { ElMessage } from 'element-plus';

interface Emits {
    (e: 'settitle', title: string): void;
    (e: 'teamdata', data: any): void;
}

const emits = defineEmits<Emits>();
const { t } = useI18n();
const route = useRoute()
const showoverlay = ref(false)
const teamcard = ref(false)
const projectcard = ref(false)
const teamid = ref('')
const teamdata = ref<any[]>([])

const { updateShareData } = inject('shareData') as {
    updateShareData: (id: string, name: string, avatar: string, description: string) => void;
};

const picker = new FilePicker((file) => {
    if (!file) return;
    const lzdata = new LzDataLocal(new Zip(file));
    const repo = new Repository();
    importSketch(file.name, lzdata, repo).then((document: Document) => {
        window.document.title = document.name;
        const coopRepo = new CoopRepository(document, repo);
        (window as any).skrepo = coopRepo;
        (window as any).sketchDocument = document;
        router.push({ name: 'document' });
        console.log(window);

    })
});

function newFile() {
    const repo = new Repository();
    const nd = createDocument(t('system.new_file'), repo);
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

const showteamcard = () => {
    showoverlay.value = true
    teamcard.value = true
    nextTick(() => {
        const input = document.querySelector(".team-name input") as HTMLInputElement
        input?.focus()
    })
}

const showprojectcard = (id: string) => {
    showoverlay.value = true
    projectcard.value = true
    teamid.value = id
    nextTick(() => {
        const input = document.querySelector(".project-name input") as HTMLInputElement
        input?.focus()
    })
}

const GetteamList = async () => {
    try {
        const { code, data, message } = await user_api.GetteamList()
        if (code === 0) {
            teamdata.value = data
            emits('teamdata', teamdata.value)
        } else {
            ElMessage({ type: 'error', message: message })
        }
    } catch (error) {

    }

}


const { updatestate, state } = inject('shareData') as {
    updatestate: Ref<boolean>;
    state: (b: boolean) => void;
};

watch(updatestate, (newvalue) => {
    if (newvalue) {
        console.log(newvalue);
        
        GetteamList()
        state(false)
        console.log(updatestate);
        
    }
})

const torouter = (id: string) => {
    router.push({ path: '/apphome/teams/' + id })
}

const isActive = (id: string, name: string, avatar: string, description: string) => {
    if (route.params.id === id) {
        updateShareData(id, name, avatar, description)
    }
    return route.params.id === id
}

onMounted(() => {
    GetteamList()
})

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
            <div class="teamlists">
                <div class="teamitem" :class="{ 'is-active': isActive(id, name, avatar, description) }"
                    v-for="{ team: { name, id, avatar, description } } in teamdata" :key="id" @click.stop="torouter(id)">
                    <div class="left">
                        <div class="team-avatar">
                            <div v-if="avatar.includes('http')" class="img">
                                <img :src="avatar" alt="team avatar">
                            </div>
                            <div v-else class="text">
                                <span>{{ name.slice(0, 1) }}</span>
                            </div>
                        </div>
                        <span>{{ name }}</span>
                    </div>
                    <div class="right" @click.stop="showprojectcard(id)">
                        <svg-icon icon-class="close" />
                    </div>
                </div>
            </div>
            <div class="team-container">
                <button class="newteam" @click.stop="showteamcard">
                    <svg-icon icon-class="close" />
                    <span>{{ t('Createteam.add_team') }}</span>
                </button>
            </div>
        </el-col>
    </el-row>
    <transition name="nested" :duration="550">
        <div v-if="showoverlay" class="overlay">
            <addTeam v-if="teamcard" class="inner" @close="showoverlay = false; teamcard = false"
                @updateteamlist="GetteamList" />
            <addProject v-if="projectcard" class="inner" :teamid="teamid"
                @close="showoverlay = false; projectcard = false" />
        </div>
    </transition>
</template>

<style lang="scss" scoped>
a {
    text-decoration: none;
}

.nested-enter-active,
.nested-leave-active {
    transition: all 0.3s ease-in-out;
}

.nested-leave-active {
    transition-delay: 0.25s;
}

.nested-enter-from,
.nested-leave-to {
    transform: translateY(400px);
    opacity: 0;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
    transition: all 0.3s ease-in-out;
}

.nested-enter-active .inner {
    transition-delay: 0.25s;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.001;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

.team-container {
    position: absolute;
    bottom: 8px;
    width: 100%;
    text-align: center;

    .newteam {
        cursor: pointer;
        border: none;
        width: calc(100% - 16px);
        height: 32px;
        margin: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        background-color: #9775fa;
        box-shadow: 1px 1px 3px rgb(0, 0, 0);
        box-sizing: border-box;
        transition: all 0.5s ease-out;

        &:hover {
            background-color: rgba(150, 117, 250, 0.862745098);
        }

        &:active {
            background-color: #9775fa;
        }

        span {
            color: #ffffff;
            letter-spacing: 2px;
            font-size: 14px;
            font-weight: 600;
        }

        svg {
            margin-right: 4px;
            margin-top: 2px;
            width: 16px;
            height: 16px;
            fill: white;
            transform: rotate(45deg);
        }
    }
}

.el-row {
    width: 100%;
    height: calc(100vh - 56px);
    overflow: hidden;
    overflow-y: auto;
    background-color: white;

    .el-col {
        width: 100%;
        max-width: 100%;
        flex: 1;

        .new {
            display: block;
            text-align: center;
            margin: 20px 10px auto;

            button {
                width: 100%;
                height: 40px;
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
                height: 40px;

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

        .teamlists {
            width: 100%;
            position: absolute;
            bottom: 60px;
            top: 400px;
            overflow-y: auto;

            &::-webkit-scrollbar {
                height: 0;
                width: 0;
            }


            .teamitem {
                border-radius: 4px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow-x: hidden;
                line-height: 40px;
                margin: 0 10px 6px 10px;
                padding: 0 6px;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .left {
                    display: flex;
                    align-items: center;
                    width: calc(100% - 16px);

                    .team-avatar {
                        width: 24px;
                        height: 24px;
                        min-width: 24px;
                        background-color: #9775fa;
                        text-align: center;
                        border-radius: 50%;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 6px;

                        .img {
                            width: 100%;
                            height: 100%;
                            line-height: 0;

                            img {
                                width: 100%;
                                height: 100%;
                                object-fit: cover;

                            }
                        }

                        .text {
                            line-height: 0;

                            span {
                                width: 100%;
                                height: 100%;
                                font-size: 12px;
                                font-weight: 600;
                                color: white;
                            }
                        }

                    }

                    span {
                        overflow-x: hidden;
                        text-overflow: ellipsis;
                    }
                }

                .right {
                    display: flex;

                    svg {
                        width: 16px;
                        min-width: 16px;
                        height: 16px;
                        fill: #9775fa;
                        transform: rotate(45deg);
                    }

                    &:hover {
                        transform: scale(1.1);
                    }
                }

                &:hover {
                    cursor: pointer;
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
        font-size: 24px;
    }

    .el-menu-item {
        justify-content: center;
    }


    .el-icon {
        margin: 0;
        padding: 0;
        font-size: 32px;
    }

}
</style>