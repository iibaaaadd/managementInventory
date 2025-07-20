const http = require('http');
const url = require('url');
const InventoryManager = require('./models/InventoryManager');
const logger = require('./utils/Logger');
const db = require('./utils/Database');
const inventory = new InventoryManager();

inventory.on('lowStock', (info) => {
  logger.log(`⚠️ Low stock for product ${info.productId}, remaining: ${info.stock}`);
});

const server = http.createServer(async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  const { pathname, query } = url.parse(req.url, true);
  const method = req.method;

  try {
    if (pathname === '/products' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const { id, name, price, stock, category } = JSON.parse(body);
        await inventory.addProduct(id, name, price, stock, category);
        logger.log(`Product added: ID=${id}, Name=${name}, Price=${price}, Stock=${stock}, Category=${category}`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'Product added successfully',
          data: { id, name, price, stock, category }
        }));
      });

    } else if (pathname.startsWith('/products/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const { name, price, stock, category } = JSON.parse(body);
        await inventory.updateProduct(id, name, price, stock, category);
        logger.log(`Product updated: ID=${id}, Name=${name}, Price=${price}, Stock=${stock}, Category=${category}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'Product updated successfully',
          data: { id, name, price, stock, category }
        }));
      });

    } else if (pathname === '/products' && method === 'GET') {
      const { category, page = 1, limit = 10 } = query;
      const offset = (page - 1) * limit;
      let result;

      if (category) {
        result = await inventory.getProductsByCategory(category);
        logger.log(`Retrieved products by category: ${category}`);
      } else {
        const [rows] = await db.query(
          'SELECT * FROM products LIMIT ? OFFSET ?',
          [parseInt(limit), parseInt(offset)]
        );
        result = rows;
        logger.log(`Retrieved product list: page=${page}, limit=${limit}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (!result || result.length === 0) {
        res.end(JSON.stringify({
          status: 'empty',
          message: 'No products found.',
          data: []
        }));
      } else {
        res.end(JSON.stringify({
          status: 'success',
          message: 'Products retrieved successfully',
          data: result
        }));
      }

    } else if (pathname === '/transactions' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { id, productId, quantity, type, customerId } = JSON.parse(body);
          await inventory.createTransaction(id, productId, quantity, type, customerId);
          logger.log(`Transaction created: ID=${id}, ProductID=${productId}, Qty=${quantity}, Type=${type}, CustomerID=${customerId}`);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            message: 'Transaction created successfully',
            data: { id, productId, quantity, type, customerId }
          }));
        } catch (err) {
          logger.log(`Transaction error: ${err.message}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'error',
            message: err.message,
            data: null
          }));
        }
      });

    } else if (pathname === '/reports/category' && method === 'GET') {
      const { category } = query;
      if (!category) {
        logger.log(`Category report request failed: category is missing`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'error',
          message: 'Category is required',
          data: null
        }));
      }

      const products = await inventory.getProductsByCategory(category);
      logger.log(`Report: products in category ${category} fetched`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: products.length === 0 ? 'empty' : 'success',
        message: products.length === 0 ? 'No products found for this category.' : 'Products found in category',
        data: products
      }));

    } else if (pathname === '/reports/inventory' && method === 'GET') {
      const value = await inventory.getInventoryValue();
      logger.log(`Inventory value report generated: ${value}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        message: 'Inventory value calculated',
        data: { totalValue: value }
      }));

    } else if (pathname === '/reports/history' && method === 'GET') {
      const { productId } = query;
      if (!productId) {
        logger.log('History report request failed: productId is missing');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'error',
          message: 'productId is required',
          data: null
        }));
      }

      const history = await inventory.getProductHistory(productId);
      logger.log(`Transaction history fetched for product ${productId}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: history.length === 0 ? 'empty' : 'success',
        message: history.length === 0 ? 'No transaction history found for this product.' : 'Transaction history retrieved',
        data: history
      }));

    } else if (pathname === '/reports/low-stock' && method === 'GET') {
      const threshold = parseInt(query.threshold) || 10;
      const products = await inventory.getLowStockProducts(threshold);
      logger.log(`Low stock report generated with threshold=${threshold}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        message: products.length === 0 ? 'All product stock is still safe.' : 'Products with low stock.',
        data: products
      }));

    }else if (pathname === "/reports/inventoryAll" && method === "GET") {
      const { start_date, end_date } = query;
    //   const start_date = "2025-01-01";
    //   const end_date = "2025-12-31";
      const transactions = await inventory.reportInventory(start_date, end_date);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(transactions));
    }
    
    else {
      logger.log(`Route not found: ${method} ${pathname}`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'not_found',
        message: 'Route not found',
        data: null
      }));
    }

  } catch (err) {
    logger.log(`Internal server error: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: err.message,
      data: null
    }));
  }
});

server.listen(3000, () => {
  logger.log('Server running on http://localhost:3000');
});
