const axios = require('axios');
const cron = require('node-cron');
const Order = require('../models/order.model');
// Các thông số cốt lõi
const MY_WALLET = 'TV9fTvNQh8gaWofEAFnUAdCpZXZR62baRk'; // Bắt đầu bằng chữ T
const TRONGRID_API_KEY = 'd8ccebb0-fe91-4f10-846e-a84d6c961086';
// Đây là mã hợp đồng thông minh của đồng USDT trên mạng TRON (Cố định, không đổi)
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; 

// Hàm gọi API lên mạng lưới TRON để lấy danh sách nhận tiền gần nhất
async function getRecentUSDTTransfers() {
    try {
        const url = `https://api.trongrid.io/v1/accounts/${MY_WALLET}/transactions/trc20`;
        const response = await axios.get(url, {
            params: {
                limit: 10, // Lấy 10 giao dịch gần nhất
                contract_address: USDT_CONTRACT,
                only_to: true // Chỉ lấy những giao dịch CHUYỂN ĐẾN ví của mình
            },
            headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY }
        });

        return response.data.data; // Trả về mảng các giao dịch
    } catch (error) {
        console.error("Lỗi khi quét Blockchain:", error.message);
        return [];
    }
}

// Hàm so khớp tiền
async function checkPendingOrders() {
    console.log("[HỆ THỐNG] Đang quét Blockchain tìm giao dịch USDT...");
    
    // 1. Lấy danh sách giao dịch thực tế từ mạng lưới
    const transactions = await getRecentUSDTTransfers();
    if (transactions.length === 0) return;

    // 2. LẤY DỮ LIỆU THẬT TỪ DATABASE
    // Dùng Mongoose để tìm tất cả đơn có trạng thái là 'pending' (chờ thanh toán)
    const pendingOrders = await Order.find({ 
        status: 'pending',
        paymentMethod: 'crypto'
    });

    // Nếu lúc này không có ai nợ tiền, thì dừng lại luôn, khỏi mất công so sánh
    if (pendingOrders.length === 0) return;

    // 3. Quét và so sánh
    for (let order of pendingOrders) {
        for (let tx of transactions) {
            // LƯU Ý TỬ HUYỆT: Tiền Crypto lưu dưới dạng số nguyên cực lớn. 
            // USDT có 6 số thập phân. Nghĩa là 1 USDT trên API sẽ trả về là 1,000,000.
            // Phải lấy số tiền mạng trả về chia cho 10^6
            const actualAmountReceived = parseInt(tx.value) / 1000000;

            if (actualAmountReceived === order.exact_amount) {
                console.log(`[BINGO!] Đơn hàng ${order.id} đã nhận đủ ${actualAmountReceived} USDT!`);
                console.log(`Mã giao dịch (TxID): ${tx.transaction_id}`);
                
                await Order.updateOne(
                    { _id: order._id }, 
                    { 
                        status: 'paid', // Đổi trạng thái thành Đã thanh toán
                        tx_id: tx.transaction_id // Lưu đính kèm cái TxID vào DB để sau này có bằng chứng tra soát
                    }
                );

                // NẾU TÌM THẤY RỒI THÌ THOÁT KHỎI VÒNG LẶP GIAO DỊCH (Tránh việc update 1 đơn 2 lần nếu có bug API)
                break;
            }
        }
    }
}

// Lên lịch: Cứ mỗi 1 phút chạy hàm quét 1 lần
cron.schedule('*/1 * * * *', () => {
    checkPendingOrders();
});

module.exports = { checkPendingOrders };