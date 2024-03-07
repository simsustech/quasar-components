import type { VitrifyConfig } from "vitrify";
import { certificateFor } from "devcert";
import QuasarComponentsPlugin from "@simsustech/quasar-components/vite-plugin";
export default async function ({ mode, command }): Promise<VitrifyConfig> {
  const config: VitrifyConfig = {
    plugins: [QuasarComponentsPlugin()],
    vitrify: {
      lang: "nl",
      hooks: {
        // Vitrify hooks
      },
      sass: {
        variables: {
          $primary: "#000000",
        },
      },
    },
    quasar: {
      extras: ["material-icons"],
      framework: {
        components: [
          // Deprecated
        ],
        plugins: ["Dialog"],
      },
    },
  };
  if (mode === "development") {
    config.server = {
      https: await certificateFor("vitrify.test"),
    };
  }
  return config;
}
