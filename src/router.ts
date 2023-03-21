import { createRouter, createWebHashHistory } from "vue-router";
// import { Document } from "@kcdesign/data/document";
// const AppVue = () => import("@/App.vue");
// const HomeVue = () => import("@/components/Home/index.vue");
const DocumentVue = () => import("@/components/Document/index.vue");

const routes = [
    // { path: "/", redirect: "/home" },
    // {
    //     path: "/",
    //     name: "app",
    //     component: AppVue
    // },
    // {
    //     path: "/home",
    //     name: "home",
    //     component: HomeVue,
    //     props: true,
    // },
    {
        path: "/document/:id",
        name: "document",
        component: DocumentVue,
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})