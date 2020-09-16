// load env values from .env file when app is not production mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: 'LINE×kintone×Azureでテイクアウトアプリを作ってみよう！',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      },
      {
        hid: 'og:site_name',
        property: 'og:site_name',
        content: 'LINE×kintone×Azureでテイクアウトアプリを作ってみよう！'
      },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      {
        hid: 'og:url',
        property: 'og:url',
        content: process.env.API_URL
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'LINE×kintone×Azureでテイクアウトアプリを作ってみよう！'
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content: process.env.npm_package_description || ''
      },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://ldc-takeout.herokuapp.com/icon.png'
      }
    ],
    script: [
      { src: 'https://static.line-scdn.net/liff/edge/2.1/sdk.js' },
      {
        src:
          'https://cdnjs.cloudflare.com/ajax/libs/vConsole/3.3.4/vconsole.min.js'
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  // PWA Setting
  manifest: {
    name: 'LDC テイクアウトアプリ',
    lang: 'ja',
    short_name: 'LDC テイクアウト',
    title: 'LDC テイクアウト',
    description: 'LINE×kintone×Azureでテイクアウトアプリを作ってみよう！',
    theme_color: '#ffffff',
    background_color: '#ffffff'
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: ['@/assets/scss/app.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/axios.js' },
    { src: '~/plugins/bootstrap-vue.js' }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    ['bootstrap-vue/nuxt', { css: false }],
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
    // ,
    // Doc: https://github.com/nuxt-community/dotenv-module
    // '@nuxtjs/dotenv'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.API_URL || 'http://127.0.0.1:3000',
    browserBaseURL: process.env.API_URL || 'http://127.0.0.1:3000'
  },
  env: {
    API_URL: process.env.API_URL || 'http://127.0.0.1:3000',
    USE_VCONSOLE: process.env.USE_VCONSOLE || false,
    SKIP_LOGIN: process.env.SKIP_LOGIN || false,
    LIFF_ID: process.env.LIFF_ID || '',
    LINE_BOT_CHANNEL_ACCESS_TOKEN:
      process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN || '',
    LINE_BOT_CHANNEL_SECRET: process.env.LINE_BOT_CHANNEL_SECRET || '',
    KINTONE_DOMAIN_NAME: process.env.KINTONE_DOMAIN_NAME || '',
    KINTONE_USER_ID: process.env.KINTONE_USER_ID || '',
    KINTONE_USER_PASSWORD: process.env.KINTONE_USER_PASSWORD || '',
    KINTONE_FOLLOWED_USER_APP_ID:
      process.env.KINTONE_FOLLOWED_USER_APP_ID || '',
    KINTONE_ORDER_ITEM_APP_ID: process.env.KINTONE_ORDER_ITEM_APP_ID || '',
    KINTONE_TRANSACTION_APP_ID: process.env.KINTONE_TRANSACTION_APP_ID || '',
    KINTONE_INQUIRY_APP_ID: process.env.KINTONE_INQUIRY_APP_ID || '',
    LINE_RICH_MENU_DEFAULT_ID: process.env.LINE_RICH_MENU_DEFAULT_ID || '',
    USE_AZURE_AI: process.env.USE_AZURE_AI || false,
    AZURE_TEXT_ANALYTICS_URL: process.env.AZURE_TEXT_ANALYTICS_URL || '',
    AZURE_TEXT_ANALYTICS_KEY: process.env.AZURE_TEXT_ANALYTICS_KEY || '',
    AZURE_TRANSLATOR_KEY: process.env.AZURE_TRANSLATOR_KEY || ''
  },
  /*
   ** Build configuration
   */
  build: {
    // for PWA with Safari
    filenames: {
      app: ({ isDev }) => (isDev ? '[name].[hash].js' : '[chunkhash].js'),
      chunk: ({ isDev }) => (isDev ? '[name].[hash].js' : '[chunkhash].js')
    },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
