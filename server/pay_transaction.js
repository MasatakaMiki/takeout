const consola = require('consola')
const kintone = require('@kintone/kintone-js-sdk')
const moment = require('moment')

const DOMAIN_NAME = process.env.KINTONE_DOMAIN_NAME
const KINTONE_USER_ID = process.env.KINTONE_USER_ID
const KINTONE_USER_PASSWORD = process.env.KINTONE_USER_PASSWORD
const TRANSACTION_APP_ID = process.env.KINTONE_TRANSACTION_APP_ID
const ORDER_APP_ID = process.env.KINTONE_ORDER_ITEM_APP_ID
const APP_URL = process.env.API_URL

const PAY_STATE_ORDERED = 'ORDERED'
const PAY_STATE_PAYING = 'PAYING'
const PAY_STATE_PAID = 'PAID'

const DELIVERY_STATE_PREPARING = 'PREPARING'
// const DELIVERY_STATE_READY = 'READY'
// const DELIVERY_STATE_DELIVERED = 'DELIVERED'

const CURRENCY_JPY = 'JPY'

/*
    決済情報
    - order_id
    - user_id
    - title
    - amount
    - pay_state
    - transaction_id
    - ordered_at
    - paid_at
    - shipping_method
    - shipping_fee_amount
    - delivery_state
    - delivered_at
*/
module.exports = class PayTransaction {
  constructor(orderId, userId) {
    this.orderId = orderId
    this.userId = userId
  }

  static _auth() {
    consola.log(`_auth called!`)
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
    return kintoneConnection
  }

  // kintone の認証
  static auth() {
    consola.log(`auth called!`)
    const kintoneConnection = PayTransaction._auth()
    const kintoneRecord = new kintone.Record({ connection: kintoneConnection })
    return kintoneRecord
  }

  // kintone の認証 Bulk Request 版
  static authWithBulkRequest() {
    consola.log(`auth called!`)
    const kintoneConnection = PayTransaction._auth()
    const bulkRequest = new kintone.BulkRequest({
      connection: kintoneConnection
    })
    return bulkRequest
  }

  // kintone からPayTransaction に変換する
  static convertPayTransactionFromKintoneRecord(record) {
    consola.log(
      `convertPayTransactionFromKintoneRecord called! OrderId: ${JSON.stringify(
        record,
        null,
        4
      )}`
    )
    const tran = new PayTransaction(record.order_id.value, record.user_id.value)
    tran.userId = record.user_id.value
    tran.currency = record.currency.value
    tran.title = record.title.value
    tran.transactionId = record.transaction_id.value
    tran.amount = parseInt(record.amount.value)
    tran.payState = record.pay_state.value
    if (record.ordered_at.value) {
      tran.orderedAt = moment(record.ordered_at.value)
    }
    if (record.paid_at.value) {
      tran.paidAt = moment(record.paid_at.value)
    }
    tran.kintoneRecordId = record.$id.value
    tran.deliveryState = record.delivery_state.value
    if (record.delivered_at.value) {
      tran.deliveredAt = moment(record.delivered_at.value)
    }
    tran.recordId = record['レコード番号'].value
    consola.log(`Parsed transaction: ${JSON.stringify(tran, null, 4)}`)
    return tran
  }

  // 決済情報をkintone から取得する
  static getTransaction(orderId) {
    consola.log(
      `getTransaction called! OrderId: ${JSON.stringify(orderId, null, 4)}`
    )
    return new Promise(function(resolve, reject) {
      const kintoneRecord = PayTransaction.auth()
      const app = TRANSACTION_APP_ID
      const query = `order_id = "${orderId}" order by ordered_at desc limit 1`
      consola.log(`Query: ${query}`)
      const totalCount = true
      let result = null
      kintoneRecord
        .getRecords({ app, query, totalCount })
        .then((rsp) => {
          consola.log(`Got transaction: ${JSON.stringify(rsp, null, 4)}`)
          const record = rsp.records[0]
          const tran = PayTransaction.convertPayTransactionFromKintoneRecord(
            record
          )
          result = tran
          resolve(result)
        })
        .catch((err) => {
          consola.log(err)
          consola.log(`ERROR OBJECT: ${JSON.stringify(err.error)}`)
          reject(new Error('Get transaction failed...'))
        })
    })
  }

  /**
   *
   * @param {*} orderId
   * @param {*} userId
   * @param {*} transactionTitle
   * @param {*} amount
   * @param {*} transactionId
   * @param {*} orderItems Order object {
                  itemId,
                  itemName,
                  unitPrice,
                  quantity}
   */
  static registOrderAndTransaction(
    orderId,
    userId,
    transactionTitle,
    amount,
    transactionId,
    orderItems
  ) {
    consola.log(`registOrderAndTransaction called!`)
    return new Promise(function(resolve, reject) {
      // 注文商品情報を生成する
      const orderRecords = PayTransaction.generateOrderRecords(
        orderId,
        userId,
        orderItems
      )
      consola.log('Order Records', JSON.stringify(orderRecords))
      const transactionRecord = PayTransaction.generateTransactionRecord(
        orderId,
        userId,
        transactionTitle,
        amount,
        transactionId
      )
      consola.log('Transaction Record', JSON.stringify(transactionRecord))
      // BulkRequest を呼び出す
      let bulkRequest = PayTransaction.authWithBulkRequest()
      for (let index = 0; index < orderRecords.length; index++) {
        const r = orderRecords[index]
        bulkRequest = bulkRequest.addRecord(r)
      }
      bulkRequest = bulkRequest.addRecord(transactionRecord)
      bulkRequest
        .execute()
        .then((resp) => {
          consola.log(resp)
          resolve(null)
        })
        .catch((error) => {
          consola.log(error)
          consola.log(`ERROR OBJECT: ${JSON.stringify(error.error)}`)
          reject(new Error('Regist order and transaction failed...'))
        })
    })
  }

  static generateOrderRecords(orderId, userId, orderItems) {
    consola.log(`generateKintoneOrderRecords called!`)
    const records = orderItems.map((item) => {
      const record = {
        order_id: {
          value: orderId
        },
        user_id: {
          value: userId
        },
        item_id: {
          value: item.itemId
        },
        item_name: {
          value: item.itemName
        },
        unit_price: {
          value: item.unitPrice
        },
        quantity: {
          value: item.quantity
        }
      }
      return { app: ORDER_APP_ID, record }
    })
    return records
  }

  static generateTransactionRecord(
    orderId,
    userId,
    title,
    amount,
    transactionId
  ) {
    consola.log(`generateTransactionRecord called!`)
    const app = TRANSACTION_APP_ID
    // Build record for kintone app
    const record = {
      order_id: {
        value: orderId
      },
      user_id: {
        value: userId
      },
      title: {
        value: title
      },
      amount: {
        value: amount
      },
      transaction_id: {
        value: transactionId
      },
      currency: {
        value: CURRENCY_JPY
      },
      pay_state: {
        value: PAY_STATE_ORDERED
      },
      delivery_state: {
        value: DELIVERY_STATE_PREPARING
      },
      app_url: {
        value: APP_URL
      }
    }
    return { app, record }
  }

  /*
        注文時の決済情報を登録する
        pay_state will set as ORDERED
    */
  static registOrderedTransaction(
    orderId,
    userId,
    title,
    amount,
    transactionId
  ) {
    consola.log(`registOrderedTransaction called!`)
    return new Promise(function(resolve, reject) {
      const record = PayTransaction.generateTransactionRecord(
        orderId,
        userId,
        title,
        amount,
        transactionId
      )
      consola.log('Transaction', record)
      // Add to kintone
      const kintoneRecord = PayTransaction.auth()
      let result = null
      kintoneRecord
        .addRecord(record)
        .then(async (resp) => {
          consola.log(resp)
          const tran = await PayTransaction.getTransaction(orderId)
          result = tran
          resolve(result)
        })
        .catch((error) => {
          consola.log(error)
          consola.log(`ERROR OBJECT: ${JSON.stringify(error.error)}`)
          reject(new Error('Regist ordered transaction failed...'))
        })
    })
  }

  /*
        決済情報に配送情報を追加する
        pay_state will set as PAYING
    */
  updateShippingInfo(shippingMethod, shippingFeeAmount) {
    consola.log(`updateShippingInfo called! shippingMethod: ${shippingMethod}`)
    const app = TRANSACTION_APP_ID
    const updateKey = {
      field: 'transaction_id',
      value: this.transactionId
    }
    const orderId = this.orderId
    return new Promise(function(resolve, reject) {
      const record = {
        pay_state: {
          value: PAY_STATE_PAYING
        }
      }
      if (shippingMethod && shippingFeeAmount) {
        // 配送方法の指定がある場合のみ更新する
        record.shipping_method = {
          value: shippingMethod
        }
        record.shipping_fee_amount = {
          value: shippingFeeAmount
        }
      }
      consola.log('Transaction', record)
      consola.log('updateKey', updateKey)
      consola.log('app', app)
      // update
      let result = null
      const kintoneRecord = PayTransaction.auth()
      kintoneRecord
        .updateRecordByUpdateKey({ app, updateKey, record })
        .then(async (rsp) => {
          consola.log(rsp)
          const tran = await PayTransaction.getTransaction(orderId)
          result = tran
          resolve(result)
        })
        .catch((err) => {
          consola.log(err)
          consola.log(`ERROR OBJECT: ${JSON.stringify(err.error)}`)
          reject(new Error('Update transaction failed...'))
        })
    })
  }

  /*
        決済情報を決済完了とする
        pay_state will set as PAID
    */
  setPaid(paidDate) {
    consola.log(`setPaid called! paidDate: ${paidDate}`)
    const orderId = this.orderId
    const transactionId = this.transactionId
    return new Promise(function(resolve, reject) {
      const app = TRANSACTION_APP_ID
      if (!paidDate) {
        paidDate = moment()
      }
      const updateKey = {
        field: 'transaction_id',
        value: transactionId
      }
      const record = {
        paid_at: {
          value: paidDate.toISOString()
        },
        pay_state: {
          value: PAY_STATE_PAID
        },
        delivery_state: {
          value: DELIVERY_STATE_PREPARING
        }
      }
      consola.log('Transaction', record)
      consola.log('updateKey', updateKey)
      consola.log('app', app)
      // update
      let result = null
      const kintoneRecord = PayTransaction.auth()
      kintoneRecord
        .updateRecordByUpdateKey({ app, updateKey, record })
        .then(async (rsp) => {
          consola.log(rsp)
          const tran = await PayTransaction.getTransaction(orderId)
          result = tran
          resolve(result)
        })
        .catch((err) => {
          consola.log(err)
          consola.log(`ERROR OBJECT: ${JSON.stringify(err.error)}`)
          reject(new Error('Set paid info to transaction failed...'))
        })
      return result
    })
  }
}
