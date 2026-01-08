export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss"],
  css: ["~/assets/css/tailwind.css"],

  app: {
    head: {
      title: "Dyogaf.fx",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Dyogaf.fx - Spot Pullback Helper 15m untuk pemula trading crypto di Indodax."
        }
      ]
    }
  },

  compatibilityDate: "2026-01-07"
});