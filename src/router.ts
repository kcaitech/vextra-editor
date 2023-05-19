import { createRouter, createWebHashHistory, onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { ref } from 'vue';
import { SKIP_LOGIN } from '@/utils/setting';
// import { Document } from "@kcdesign/data/document";
const AppVue = () => import("@/App.vue");
const HomeVue = () => import("@/components/Home/index.vue");
const DocumentVue = () => import("@/components/Document/index.vue");
const Apphome = () => import("@/components/AppHome/Apphome.vue");
const Login = () => import("@/components/Login/Login.vue");
const Recently = () => import("@/components/AppHome/Main/Recently.vue");
const StarFile = () => import("@/components/AppHome/Main/StarFile.vue");
const ShareMe = () => import("@/components/AppHome/Main/ShareMe.vue");
const MeShare = () => import("@/components/AppHome/Main/MeShare.vue");
const RecycleBin = () => import("@/components/AppHome/Main/RecycleBin.vue");
const Apply = () => import("@/components/Apply/index.vue")
const per_center=()=>import('@/components/Userinfo/per_center.vue')

const routes = [
    {
        path: '/',
        redirect: SKIP_LOGIN ? '/apphome/recently' : '/login'
    },
    {
        path: "/login",
        name: "login",
        component: Login
    },
    {
        path: "/home",
        name: "home",
        component: HomeVue,
        props: true,
    },
    {
        path: "/document",
        name: "document",
        component: DocumentVue
    },
    {
        path: "/apphome",
        name: "apphome",
        component: Apphome,
        redirect: '/apphome/recently',
        children: [
            {
                path: 'recently',
                name: 'recently',
                component: Recently
            },
            {
                path: 'starfile',
                name: 'starfile',
                component: StarFile
            },
            {
                path: 'meshare',
                name: 'meshare',
                component: MeShare
            },
            {
                path: 'shareme',
                name: 'shareme',
                component: ShareMe
            },
            {
                path: 'recyclebin',
                name: 'recyclebin',
                component: RecycleBin
            }
        ]
    },
    {
        path: "/apply",
        name: "apply",
        component: Apply
    },
    {
        path: "/pcenter",
        name: "per_center",
        component: per_center
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes

})

