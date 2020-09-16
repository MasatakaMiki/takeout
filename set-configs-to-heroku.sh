#!/bin/sh

# set configs to heroku loading environment values in .env file
. ./.env
heroku config:set USE_VCONSOLE=${USE_VCONSOLE}
heroku config:set SKIP_LOGIN=${SKIP_LOGIN}
heroku config:set LIFF_ID=${LIFF_ID}
heroku config:set LINE_BOT_CHANNEL_ACCESS_TOKEN=${LINE_BOT_CHANNEL_ACCESS_TOKEN}
heroku config:set LINE_BOT_CHANNEL_SECRET=${LINE_BOT_CHANNEL_SECRET}
heroku config:set LINE_PAY_CHANNEL_ID=${LINE_PAY_CHANNEL_ID}
heroku config:set LINE_PAY_CHANNEL_SECRET=${LINE_PAY_CHANNEL_SECRET}
heroku config:set KINTONE_DOMAIN_NAME=${KINTONE_DOMAIN_NAME}
heroku config:set KINTONE_USER_ID=${KINTONE_USER_ID}
heroku config:set KINTONE_USER_PASSWORD=${KINTONE_USER_PASSWORD}
heroku config:set KINTONE_FOLLOWED_USER_APP_ID=${KINTONE_FOLLOWED_USER_APP_ID}
heroku config:set KINTONE_ORDER_ITEM_APP_ID=${KINTONE_ORDER_ITEM_APP_ID}
heroku config:set KINTONE_TRANSACTION_APP_ID=${KINTONE_TRANSACTION_APP_ID}
heroku config:set KINTONE_INQUIRY_APP_ID=${KINTONE_INQUIRY_APP_ID}
heroku config:set LINE_RICH_MENU_DEFAULT_ID=${LINE_RICH_MENU_DEFAULT_ID}
heroku config:set USE_AZURE_AI=${USE_AZURE_AI}
heroku config:set AZURE_TEXT_ANALYTICS_URL=${AZURE_TEXT_ANALYTICS_URL}
heroku config:set AZURE_TEXT_ANALYTICS_KEY=${AZURE_TEXT_ANALYTICS_KEY}
heroku config:set AZURE_TRANSLATOR_KEY=${AZURE_TRANSLATOR_KEY}

heroku config:set API_URL=$(heroku info -s | grep web_url | cut -d= -f2 | sed -e 's/\/$//')
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set HOST=0.0.0.0
heroku config:set NODE_ENV=production

# show configs
heroku config
