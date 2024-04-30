import { createRouter, createWebHistory} from "vue-router";
import i18n from "./i18n";
import _ from "lodash";
import kcdesk from "./kcdesk";

declare module 'vue-router'{
    interface RouteMeta{
        transition?:string,
    }
}

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
const HomeContent = () => import("@/components/Home/HomeContent.vue");
const TeamPage = () => import("@/components/TeamProject/TeamPage.vue");
const joinTeam = () => import("@/components/TeamProject/jionTeam.vue");
const ProjectPage = () => import("@/components/TeamProject/ProjectPage.vue");
const projectApply = () => import("@/components/TeamProject/ProjectFill/ProjectApply.vue");
const ProjectShare = () => import('@/components/TeamProject/ProjectShare/ProjectSharePage.vue')
const MobileHome = () => import('@/components/Mobile/index.vue')
const PageViews = () => import('@/components/Mobile/PageViews.vue')
const ProjectView = () => import('@/components/Mobile/ProjectView.vue')
const ProjectFileView = () => import('@/components/Mobile/ProjectFileView.vue')
const Privacy=()=>import('@/components/Mobile/MobliePrivacyolicy.vue')
const Agreements=()=>import('@/components/Mobile/MoblieServiceagreement.vue')
const Sharefile=()=>import('@/components/Mobile/ShareFile.vue')
const Wxlogin=()=>import('@/components/Mobile/WxLogin.vue')
const Mapply=()=>import('@/components/Mobile/Mapply.vue')
const Msearch=()=>import('@/components/Mobile/Searchview.vue')

let _t: any = i18n.global

const children = [
    {
        path: 'recently',
        name: 'recently',
        component: Recently,
        meta: { title: _t.t('home.recently_opened') + ' - ' + _t.t('product.name') },
    },
    {
        path: 'star',
        name: 'starfile',
        component: StarFile,
        meta: { title: _t.t('home.star_file') + ' - ' + _t.t('product.name') },
    },
    {
        path: 'myfile',
        name: 'meshare',
        component: MeShare,
        meta: { title: _t.t('home.file_shared') + ' - ' + _t.t('product.name') },
    },
    {
        path: 'shared',
        name: 'shareme',
        component: ShareMe,
        meta: { title: _t.t('home.shared_file_received') + ' - ' + _t.t('product.name') },
    },
    {
        path: 'trash',
        name: 'recyclebin',
        component: MeShare
    },
    {
        path: 'team/:id',
        name: 'TeamPage',
        component: TeamPage,
        meta: {
            requireAuth: true
        }
    },
    {
        path: 'project_shared',
        name: 'ProjectShare',
        component: ProjectShare,
        meta: { title: _t.t('Createteam.sharetip') + ' - ' + _t.t('product.name') },
    },
    {
        path: 'project/:id',
        name: 'ProjectPage',
        component: ProjectPage,
        meta: {
            requireAuth: true
        }
    },
]

const routes = [
    {
        path: '/',
        name: "kchome",
        component: KChome,
        redirect: { name: navigator.userAgent.includes('miniProgram')?'Wxlogin':'login' },
        children: [
            {
                path: "introduction",
                name: "homecontent",
                component: HomeContent,
                // alias: '/'
            },
            {
                path: "privacypolicy",
                name: "privacypolicy",
                component: Privacypolicy,
                meta: { title: _t.t('system.read_Privacy') + ' - ' + _t.t('product.name')},

            },
            {
                path: "serviceagreement",
                name: "serviceagreement",
                component: Serviceagreement,
                meta: { title: _t.t('system.read_TOS') + ' - ' + _t.t('product.name') },
            },
        ]
    },
    {
        path: "/login",
        name: "login",
        component: Login,
        meta: { title: _t.t('system.btn_login') + ' - ' + _t.t('product.name'), requireAuth: true},
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
        },
        beforeEnter: (to: any, from: any, next: any) => {
            if (to.name === 'document' && to.query.id) {
                const id = to.query.id
                const newid = id ? (id.split(' ')[0] ? id.split(' ')[0] : id.split('%20')[0]) : '';
                if (kcdesk && to.query.from !== 'kcdesk') {
                    const name = window.sessionStorage.getItem("kcdesk_document_name") ?? "";
                    kcdesk.fileOpen(newid, name, "");
                    next(false);
                }
                else if (newid !== id) {
                    next({ ...to, query: { ...to.query, id: newid } });
                } else {
                    next();
                }
            } else {
                next();
            }
        },
    },
    {
        path: "/pageviews",
        name: "pageviews",
        component: PageViews,
        meta: {
            requireAuth: true,
        },
    },
    {
        path: "/files",
        name: "apphome",
        component: Apphome,
        redirect: '/files/recently',
        children: children
    },
    {  
        path: "/wxlogin",
        name: "Wxlogin",
        component: Wxlogin,
        meta: {
            requireAuth: true,
        },
    },
    {
        path: "/m",
        name: "mobilehome",
        component: MobileHome,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: "/team",
        name: 'projectview',
        component: ProjectView,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: "/project",
        name: 'projectfileview',
        component: ProjectFileView,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: "/share",
        name: 'share',
        component: Sharefile,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: "/search",
        name: 'search',
        component: Msearch,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: "/privacy",
        name: 'privacy',
        component: Privacy,
    },
    {
        path: "/agreements",
        name: 'agreements',
        component: Agreements,
    },
    {
        path: "/join",
        name: "join",
        component: joinTeam,
        meta: {
            requireAuth: true
        }
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
        path: "/mapply",
        name: "mapply",
        component: Mapply,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/projectApply",
        name: "projectApply",
        component: projectApply,
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
        path: '/catchAll(.*)/:catchAll(.*)',
        redirect: '/',

    },
]

declare const ENV_SUFFIX: string;
let devPrefix = ENV_SUFFIX;
if (devPrefix) {
    if (devPrefix[0] !== '/') devPrefix = '/' + devPrefix;
    if (devPrefix[devPrefix.length - 1] !== '/') devPrefix += '/';
}

export const router = createRouter({
    // history: createWebHistory(),
    history: createWebHistory(devPrefix),
    // history: createWebHashHistory(),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        return {
            top: 0,
            behavior: 'smooth'
        }
    },
    routes: routes
})

