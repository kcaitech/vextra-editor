import { createRouter, createWebHashHistory, createWebHistory, onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { SKIP_LOGIN } from '@/utils/setting';
import { Component } from "vue-property-decorator";
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
const per_center = () => import('@/components/Userinfo/per_center.vue')
const Privacypolicy = () => import("@/components/Login/Privacypolicy.vue");
const Serviceagreement = () => import("@/components/Login/Serviceagreement.vue");
const KChome = () => import("@/components/Home/KChome.vue");
const HomeContent = () => import("@/components/Home/HomeContent.vue")
const routes = [
    {
        path: '/',
        name: "kchome",
        component: KChome,
        redirect: { name: 'homecontent' },
        children: [
            {
                path: "introduction",
                name: "homecontent",
                component: HomeContent,
                alias: '/'
            },
            {
                path: "privacypolicy",
                name: "privacypolicy",
                component: Privacypolicy,

            },
            {
                path: "serviceagreement",
                name: "serviceagreement",
                component: Serviceagreement
            },
        ]
    },
    {
        path: "/login",
        name: "login",
        component: Login,
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
        component: DocumentVue,
        meta: {
            requireAuth: true
        }
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
        component: Apply,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/pcenter",
        name: "per_center",
        component: per_center
    },

    {
        path: '/:catchAll(.*)',
        redirect: '/',

    },
]

export const router = createRouter({
    history: createWebHashHistory(),
    scrollBehavior(to,from,savedPosition){
        if(savedPosition){
            return savedPosition
        }
        return{
            top:0,
            behavior:'smooth'
        }
    },
    routes: routes
})

