const axios = require("axios");
const cron = require("node-cron");
const Order = require("../model/order.model");

const MY_WALLET = "TV9fTvNQh8gaWofEAFnUAdCpZXZR62baRk";
const TRONGRID_API_KEY = "d8ccebb0-fe91-4f10-846e-a84d6c961086";
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

async function getRecentUSDTTransfers() {
  try {
    const url = `https://api.trongrid.io/v1/accounts/${MY_WALLET}/transactions/trc20`;
    const response = await axios.get(url, {
      params: {
        limit: 10,
        contract_address: USDT_CONTRACT,
        only_to: true
      },
      headers: { "TRON-PRO-API-KEY": TRONGRID_API_KEY }
    });

    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi quét Blockchain:", error.message);
    return [];
  }
}

async function checkPendingOrders() {
  console.log("[HỆ THỐNG] Đang quét Blockchain tìm giao dịch USDT...");

  const transactions = await getRecentUSDTTransfers();
  if (transactions.length === 0) return;

  const pendingOrders = await Order.find({
    status: "pending",
    paymentMethod: "crypto"
  });

  if (pendingOrders.length === 0) return;

  for (const order of pendingOrders) {
    for (const tx of transactions) {
      const actualAmountReceived = parseInt(tx.value, 10) / 1000000;

      if (actualAmountReceived === order.exact_amount) {
        console.log(`[BINGO!] Thanh toán ${order.id} đã nhận đủ ${actualAmountReceived} USDT.`);
        console.log(`TxID: ${tx.transaction_id}`);

        await Order.updateOne(
          { _id: order._id },
          {
            status: "paid",
            tx_id: tx.transaction_id
          }
        );

        break;
      }
    }
  }
}

cron.schedule("*/1 * * * *", () => {
  checkPendingOrders();
});

module.exports = { checkPendingOrders };
