const Koa = require('koa');
const http = require('http');
const socketIO = require('socket.io');
const { instrument } = require("@socket.io/admin-ui");
const serve = require('koa-static');
const path = require('path');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const send = require('koa-send'); // Add this import

// Initialize Koa app
const app = new Koa();
const router = new Router();

// Add CORS middleware for Koa
app.use(cors({
    origin: '*',  // Or specify allowed origins: ['https://app.yourdomain.com', 'https://admin.yourdomain.com']
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: '*',
  }));

// Middleware
app.use(bodyParser());
app.use(serve(path.join(__dirname, 'public')));


// Create HTTP server
const server = http.createServer(app.callback());

const socketServerOptions = {
    cors: {
        origin: "*",  // Or your specific domains: ["https://app.yourdomain.com", "https://admin.yourdomain.com"]
        methods: ["GET", "POST"],
        allowedHeaders: "*",
      }
};

// Initialize Socket.IO
const io = socketIO(server, socketServerOptions);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send a welcome message
  socket.emit('message', { 
    lot_id: 0, 
    status: 'Welcome message'
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Set up the admin UI
instrument(io, {
  auth: {
    type: "basic",
    username: "excelsior",
    password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS" // "changeit" encrypted
  },
  namespaceName: "/monitor" // This sets a custom namespace for admin features
});

// Add a route for your admin panel
router.get('/monitor', async (ctx) => {
  await send(ctx, 'admin.html', { root: __dirname + '/public' });
});

// POST endpoint to receive bid data
router.post('/api/lotUpdate', async (ctx) => {
  try {
    const { lot_id } = ctx.request.body;
    
    // Validate required fields
    if (!lot_id) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: lot_id, price, user' };
      return;
    }
    
    // Create message object
    const message = {
      lot_id: parseInt(lot_id),
      timestamp: new Date().toISOString()
    };
    
    console.log('Broadcasting message from API:', message);
    
    // Broadcast the message to all connected clients
    io.emit('message', message);
    
    // Return success response
    ctx.status = 200;
    ctx.body = { 
      success: true, 
      message: 'Bid broadcasted successfully',
      data: message
    };
  } catch (error) {
    console.error('Error processing bid:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

// Register routes
app.use(router.routes()).use(router.allowedMethods());

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server kind of listening on port ${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/bid`);
});