const consola = require('consola')
const kintone = require('@kintone/kintone-js-sdk')

const DOMAIN_NAME = process.env.KINTONE_DOMAIN_NAME
const KINTONE_USER_ID = process.env.KINTONE_USER_ID
const KINTONE_USER_PASSWORD = process.env.KINTONE_USER_PASSWORD
const APP_ID = process.env.KINTONE_FOLLOWED_USER_APP_ID

/*
    注文情報
    - order_id
    - user_id
    - item_id
    - item_name
    - unit_price
    - quantity
    - ordered_at
*/
module.exports = class FollowedUser {
  constructor(orderId, userId) {
    this.orderId = orderId
    this.userId = userId
  }

  // kintone の認証
  static auth() {
    consola.log(`auth called!`)
    // kintone Authentication
    const kintoneAuth = new kintone.Auth()
    kintoneAuth.setPasswordAuth({
      username: KINTONE_USER_ID,
      password: KINTONE_USER_PASSWORD
    })
    // kintoneAuth.setApiToken({ apiToken: API_TOKEN })
    consola.log(`kintoneAuth: ${kintoneAuth}`)
    const kintoneConnection = new kintone.Connection({
      domain: DOMAIN_NAME,
      auth: kintoneAuth
    })
    const kintoneRecord = new kintone.Record({ connection: kintoneConnection })
    return kintoneRecord
  }

  /*
        ユーザー情報を登録する
    */
  static registUserInfo(userId, nickname, language) {
    consola.log(`registUserInfo called!`)
    return new Promise(function(resolve, reject) {
      const app = APP_ID
      // Build record for kintone app
      const record = {
        user_id: {
          value: userId
        },
        nickname: {
          value: nickname
        },
        language: {
          value: language
        }
      }
      // Add to kintone
      const kintoneRecord = FollowedUser.auth()
      kintoneRecord
        .addRecord({ app, record })
        .then((rsp) => {
          consola.log(rsp)
          resolve()
        })
        .catch((err) => {
          consola.error(err)
          consola.error(`ERROR OBJECT: ${JSON.stringify(err.error)}`)
          reject(err)
        })
    })
  }
}
