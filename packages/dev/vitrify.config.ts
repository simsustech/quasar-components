import type { VitrifyConfig } from "vitrify";
import { certificateFor } from "devcert";
export default async function ({ mode, command }): Promise<VitrifyConfig> {
  const config: VitrifyConfig = {
    vitrify: {
      lang: "nl",
      hooks: {
        // Vitrify hooks
      },
      globalCss: ["@simsustech/quasar-components/css"],
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
