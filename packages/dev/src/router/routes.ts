import { h } from "vue";
import { RouteRecordRaw } from "vue-router";

const authenticationPages = import.meta.glob("../pages/authentication/*.vue");
export const authenticationRoutes = Object.entries(authenticationPages).reduce(
  (acc, [key, val]) => {
    const name = key.split("/").at(-1)?.split(".").at(0);
    if (name)
      acc.push({
        name,
        path: name.toLowerCase(),
        component: val,
      });
    return acc;
  },
  [] as { name: string; path: string; component: any }[]
);

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
        path: "authentication",
        component: () => import("../pages/Authentication.vue"),
        children: authenticationRoutes,
      },
      {
        path: "flags",
        component: () => import("../pages/Flags.vue"),
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
