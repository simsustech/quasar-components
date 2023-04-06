import { h } from "vue";
import { RouteRecordRaw } from "vue-router";

const authenticationPages = import.meta.glob("../pages/authentication/*.vue");
const generalPages = import.meta.glob("../pages/general/*.vue");

// export const authenticationRoutes = Object.entries(authenticationPages).reduce(
//   (acc, [key, val]) => {
//     const name = key.split("/").at(-1)?.split(".").at(0);
//     if (name)
//       acc.push({
//         name,
//         path: name.toLowerCase(),
//         component: val,
//       });
//     return acc;
//   },
//   [] as { name: string; path: string; component: any }[]
// );

export const getRoutes = (pages: Record<string, () => any>) =>
  Object.entries(pages).reduce((acc, [key, val]) => {
    const name = key.split("/").at(-1)?.split(".").at(0);
    if (name)
      acc.push({
        name,
        path: name.toLowerCase(),
        component: val,
      });
    return acc;
  }, [] as { name: string; path: string; component: any }[]);

export const authenticationRoutes = getRoutes(authenticationPages);
export const generalRoutes = getRoutes(generalPages);
// const testPages = import.meta.glob("../pages/test/*.vue");

// const testRoutes = Object.entries(testPages).reduce((acc, [key, val]) => {
//   const name = key.split("/").at(-1)?.split(".").at(0);
//   if (name)
//     acc.push({
//       name,
//       path: "/" + name.toLowerCase(),
//       component: val,
//     });
//   return acc;
// }, [] as { name: string; path: string; component: any }[]);

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("src/layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/Index.vue") },
      {
        path: "general",
        component: () => import("../pages/General.vue"),
        children: generalRoutes,
      },
      {
        path: "authentication",
        component: () => import("../pages/Authentication.vue"),
        children: authenticationRoutes,
      },
      {
        path: "flags",
        component: () => import("../pages/Flags.vue"),
      },
      {
        path: "icons",
        component: () => import("../pages/Icons.vue"),
      },
      // ...testRoutes,
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("src/pages/Error404.vue"),
  },
];

export default routes;
