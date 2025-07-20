const EventEmitter = require("events");
const db = require("../utils/Database");
const CustomError = require("../utils/CustomError");
const logger = require("../utils/Logger");
const nodemailer = require("nodemailer");

// gsql tag helper
const gsql = (strings, ...values) => ({
  text: strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""),
    ""
  ),
  values,
});

class InventoryManager extends EventEmitter {
  constructor() {
    super();
  }

  async addProduct(id, name, price, stock, category) {
    const query = gsql`SELECT id FROM products WHERE id = ${id}`;
    const { rows } = await db.query(query);
    if (rows.length) throw new CustomError("Product already exists");

    const insertQuery = gsql`
      INSERT INTO products (id, name, price, stock, category)
      VALUES (${id}, ${name}, ${price}, ${stock}, ${category})
    `;
    await db.query(insertQuery);
  }

  async updateProduct(id, name, price, stock, category) {
    const query = gsql`SELECT id FROM products WHERE id = ${id}`;
    const { rows } = await db.query(query);
    if (!rows.length) throw new CustomError("Product not found");

    const updateQuery = gsql`
        UPDATE products
        SET name = ${name}, price = ${price}, stock = ${stock}, category = ${category}
        WHERE id = ${id}
    `;
    await db.query(updateQuery);
  }

  async updateStock(productId, quantity, transactionType) {
    const query = gsql`SELECT stock FROM products WHERE id = ${productId}`;
    const { rows } = await db.query(query);
    if (!rows.length) throw new CustomError("Product not found");

    const currentStock = rows[0].stock;
    const newStock =
      transactionType === "sale"
        ? currentStock - quantity
        : currentStock + quantity;
    if (newStock < 0) throw new CustomError("Stock cannot be negative");

    const updateQuery = gsql`UPDATE products SET stock = ${newStock} WHERE id = ${productId}`;
    await db.query(updateQuery);

    if (newStock < 5) {

      // Ganti dengan data SMTP dari Mailtrap kamu
      const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 587,
        auth: {
          user: "4b2247711d96d5", // ganti ini
          pass: "756a55b4f149ab", // ganti ini
        },
      });

      const mailOptions = {
        from: "ibad20020718@gmail.com",
        to: "choirul.21059@mhs.unesa.ac.id", // bebas, tidak dikirim ke real email
        subject: "Update Stok",
        text: `Barang dengan id ${productId} akan habis`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("❌ Gagal kirim email:", error);
        } else {
          console.log("✅ Email berhasil dikirim:", info.response);
        }
      });
      this.emit("lowStock", { productId, stock: newStock });
    }
  }

  async createTransaction(id, productId, quantity, type, customerId) {
    let finalQuantity = quantity;
    let totalPrice = 0;

    // Ambil harga produk
    const productQuery = gsql`
      SELECT price FROM products WHERE id = ${productId}
    `;
    const productResult = await db.query(productQuery);
    const product = productResult.rows[0];

    if (!product) {
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
    }

    let unitPrice = parseFloat(product.price);

    // Hitung total transaksi sale customer untuk logika diskon
    if (type === "sale" && customerId) {
      const countQuery = gsql`
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE customer_id = ${customerId} AND type = 'sale'
      `;
      const countResult = await db.query(countQuery);
      const count = parseInt(countResult.rows[0].count, 10) + 1; // +1 untuk transaksi saat ini

      // Terapkan diskon 15% tiap 3x transaksi
      if (count % 3 === 0) {
        unitPrice *= 0.85; // Diskon 15%
        logger.log(
          `✅ Diskon 15% diterapkan untuk customer ${customerId} pada transaksi ke-${count}`
        );
      }
    }

    totalPrice = unitPrice * finalQuantity;

    await this.updateStock(productId, finalQuantity, type);

    const insertQuery = gsql`
      INSERT INTO transactions (id, product_id, quantity, type, customer_id, total_price, created_at)
      VALUES (${id}, ${productId}, ${finalQuantity}, ${type}, ${customerId}, ${totalPrice}, NOW())
    `;
    await db.query(insertQuery);

    logger.log(`📦 Transaction recorded: ${id}`);
  }

  async getProductsByCategory(category) {
    const query = gsql`SELECT * FROM products WHERE category = ${category}`;
    const { rows } = await db.query(query);
    return rows;
  }

  async getInventoryValue() {
    const query = gsql`SELECT price, stock FROM products`;
    const { rows } = await db.query(query);
    return rows.reduce((total, p) => total + p.price * p.stock, 0);
  }

  async getProductHistory(productId) {
    const query = gsql`
      SELECT * FROM transactions
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async getLowStockProducts(threshold = 10) {
    const query = gsql`
        SELECT * FROM products
        WHERE stock < ${threshold}
        ORDER BY stock ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async  reportInventory(startDate, endDate) {
    function getRandomHexColor() {
        return (
        "#" +
        Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")
        );
    }

    const query = `
        SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        t.type,
        t.quantity,
        t.total_price,
        t.created_at
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.created_at BETWEEN $1 AND $2
    `;

    const { rows } = await db.query(query, [startDate, endDate]);

    const queryta = gsql`SELECT price, stock FROM products`;
    const result = await db.query(queryta);
    const rowsta = result.rows;
    let total_asset = 0;
    total_asset = rowsta.reduce((total, p) => total + parseFloat(p.price) * parseInt(p.stock), 0);



    const summary = {
        totalRevenue: total_asset,
        totalOrders: 0,
        productsSold: 0,
        avgOrderValue: 0,
    };

    const monthlyMap = new Map();
    const categoryMap = new Map();
    const productMap = new Map();

    for (const row of rows) {
        const {
        type,
        quantity,
        price,
        category,
        product_name,
        product_id,
        created_at,
        total_price
        } = row;

        if (type === "sale") {
        const revenue = parseInt(total_price);

        // summary.totalRevenue += revenue;
        summary.totalOrders += 1;
        summary.productsSold += quantity;

        const dateObj = new Date(created_at);
        const monthNum = dateObj.getMonth(); // 0 = Jan, 11 = Dec
        const monthLabel = dateObj.toLocaleString("default", { month: "short" });

        monthlyMap.set(monthNum, {
            label: monthLabel,
            revenue: (monthlyMap.get(monthNum)?.revenue || 0) + revenue,
        });

        categoryMap.set(category, (categoryMap.get(category) || 0) + revenue);

        if (!productMap.has(product_id)) {
            productMap.set(product_id, {
            name: product_name,
            category,
            sales: 0,
            revenue: 0,
            });
        }

        const product = productMap.get(product_id);
        product.sales += quantity;
        product.revenue += revenue;
        }
    }

    summary.avgOrderValue = summary.totalOrders
        ? parseFloat((summary.totalRevenue / summary.totalOrders).toFixed(2))
        : 0;

    const monthlyData = Array.from(monthlyMap.entries())
        .sort((a, b) => a[0] - b[0]) // sort by numeric month
        .map(([_, { label, revenue }]) => ({
        month: label,
        sales: revenue,
        }));

    const categoryData = Array.from(categoryMap.entries()).map(
        ([category, sales]) => ({
        category,
        sales,
        color: getRandomHexColor(),
        })
    );

    const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((p, i) => ({
        rank: i + 1,
        name: p.name,
        category: p.category,
        sales: p.sales,
        revenue: p.revenue,
        }));

    return {
        summary,
        monthlyData,
        categoryData,
        topProducts,
    };
    }

}

module.exports = InventoryManager;
