const db = require("../config/db");

const PaymentModel = {
  getAllPayments: async () => {
    const query = `
      SELECT p.id, p.user_id, p.cart_id, p.payment_method, p.amount, p.status, 
             p.transaction_id, p.payment_date, p.payos_order_code, p.payos_checkout_url,
             u.full_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },
  getPaymentsByUserId: async (userId) => {
    const query = `
      SELECT id, cart_id, payment_method, amount, status, transaction_id, payment_date, payos_order_code, payos_checkout_url
      FROM payments
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  },

  findPaymentById: async (paymentId) => {
    const query = `
      SELECT id, user_id, cart_id, payment_method, amount, status, transaction_id, payment_date, payos_order_code, payos_checkout_url
      FROM payments
      WHERE id = ?
    `;
    const [rows] = await db.query(query, [paymentId]);
    return rows[0];
  },

  findPaymentByOrderCode: async (orderCode) => {
    const query = `
      SELECT id, user_id, cart_id, payment_method, amount, status, transaction_id, payment_date, payos_order_code, payos_checkout_url
      FROM payments
      WHERE payos_order_code = ?
    `;
    const [rows] = await db.query(query, [orderCode]);
    return rows[0];
  },

  createPayment: async (paymentData) => {
    const query = `
      INSERT INTO payments (user_id, cart_id, payment_method, amount, status, payos_order_code, payos_checkout_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      paymentData.user_id,
      paymentData.cart_id,
      paymentData.payment_method,
      paymentData.amount,
      paymentData.status,
      paymentData.payos_order_code,
      paymentData.payos_checkout_url,
    ];
    const [result] = await db.query(query, values);
    return result.insertId;
  },

  updatePayment: async (paymentId, paymentData) => {
    const query = `
      UPDATE payments
      SET user_id = ?, cart_id = ?, payment_method = ?, amount = ?, status = ?, 
          transaction_id = ?, payment_date = ?, payos_order_code = ?, payos_checkout_url = ?
      WHERE id = ?
    `;
    const values = [
      paymentData.user_id,
      paymentData.cart_id,
      paymentData.payment_method,
      paymentData.amount,
      paymentData.status,
      paymentData.transaction_id,
      paymentData.payment_date,
      paymentData.payos_order_code,
      paymentData.payos_checkout_url,
      paymentId,
    ];
    const [result] = await db.query(query, values);
    return result.affectedRows > 0;
  },
  getPaymentStats: async () => {
    const query = `
      SELECT 
        DATE_FORMAT(payment_date, '%m/%Y') AS month,
        SUM(amount) AS income,
        COUNT(*) AS transactions
      FROM payments
      WHERE status = 'Success' AND payment_date IS NOT NULL
      GROUP BY DATE_FORMAT(payment_date, '%m/%Y')
      ORDER BY MIN(payment_date) ASC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

};

module.exports = PaymentModel;