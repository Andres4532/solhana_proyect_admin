# Business Dashboard Frontend

A modern React/Next.js frontend for the Business Dashboard application with real-time updates, authentication, and comprehensive business management features.

## Features

- **Authentication**: JWT-based login/register system
- **Real-time Updates**: Socket.IO integration for live notifications
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Radix UI components with beautiful design
- **State Management**: React Context for authentication
- **API Integration**: Axios for backend communication
- **File Upload**: Support for images and documents
- **Toast Notifications**: User-friendly feedback system

## Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Prerequisites

- Node.js (v18 or higher)
- Backend server running (see backend README)
- MongoDB database
- MinIO server (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd business-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.local.example .env.local
   ```
   
   Update the `.env.local` file:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=Business Dashboard
   NEXT_PUBLIC_APP_DESCRIPTION=Manage your business operations efficiently
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Backend Integration

### Prerequisites
Make sure your backend server is running:
```bash
cd backend
npm install
cp env.example .env
# Update .env with your MongoDB connection
npm run dev
```

### Database Setup
Seed the database with sample data:
```bash
cd backend
node src/scripts/seedData.js
```

### Default Login Credentials
After seeding, you can login with:
- **Email**: eliss@mail.com
- **Password**: 2dfe98f0

## Project Structure

```
business-dashboard/
├── app/                    # Next.js app directory
│   ├── login/             # Authentication pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── app-sidebar.tsx   # Main navigation
│   ├── dashboard-content.tsx # Content management
│   └── ...               # Feature components
├── contexts/             # React contexts
│   └── AuthContext.js    # Authentication state
├── lib/                  # Utilities and services
│   ├── api.js           # API service layer
│   ├── socket.js        # Socket.IO service
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## Authentication Flow

1. **Login/Register**: Users can create accounts or login
2. **JWT Storage**: Tokens stored in localStorage
3. **Auto-redirect**: Unauthenticated users redirected to login
4. **Socket.IO**: Automatic connection after authentication
5. **Logout**: Clears tokens and disconnects sockets

## Real-time Features

### Socket.IO Events
- **Order Updates**: Real-time order status changes
- **Moto Requests**: Live delivery request updates
- **Driver Location**: Real-time driver tracking
- **Notifications**: Toast notifications for events

### Event Handling
```javascript
// Listen for order status changes
socketService.on('order_status_changed', (data) => {
  // Update UI with new order status
});

// Listen for new orders
socketService.on('new_order_available', (data) => {
  // Show notification and update orders list
});
```

## API Integration

### Authentication
```javascript
import { authAPI } from '@/lib/api';

// Login
const result = await authAPI.login(email, password);

// Register
const result = await authAPI.register(userData);
```

### Products
```javascript
import { productsAPI } from '@/lib/api';

// Get all products
const response = await productsAPI.getAll({ page: 1, limit: 20 });

// Create product with image
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('file', imageFile);
const response = await productsAPI.create(formData);
```

### Orders
```javascript
import { ordersAPI } from '@/lib/api';

// Get orders with filters
const response = await ordersAPI.getAll({ 
  status: 'pending', 
  search: 'customer name' 
});

// Update order status
await ordersAPI.updateStatus(orderId, 'preparing');
```

### Moto Delivery
```javascript
import { motoAPI } from '@/lib/api';

// Calculate delivery price
const priceData = await motoAPI.calculatePrice({
  pickupCoords: { lat: -16.5, lng: -68.1193 },
  deliveryCoords: { lat: -16.504, lng: -68.115 }
});

// Create moto request
const formData = new FormData();
formData.append('pickupAddress', 'Pickup Location');
formData.append('deliveryAddress', 'Delivery Location');
// ... other data
const response = await motoAPI.create(formData);
```

## Component Usage

### Authentication Context
```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Socket Service
```javascript
import socketService from '@/lib/socket';

// Connect to Socket.IO
socketService.connect(token);

// Listen for events
socketService.on('order_status_changed', (data) => {
  console.log('Order status changed:', data);
});

// Emit events
socketService.updateOrderStatus(orderId, 'completed');
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables
All configuration is done through environment variables in `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - Socket.IO server URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_DESCRIPTION` - Application description

### Adding New Features
1. Create components in `components/`
2. Add API methods in `lib/api.js`
3. Update Socket.IO events in `lib/socket.js`
4. Add routes in `app/` directory
5. Update navigation in `app-sidebar.tsx`

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Environment Setup**
   - Set production API URLs
   - Configure CORS on backend
   - Set up SSL certificates

3. **Deploy**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify
   - Self-hosted

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if backend server is running
   - Verify API URL in `.env.local`
   - Check CORS configuration

2. **Socket.IO Connection Issues**
   - Verify Socket.IO URL
   - Check authentication token
   - Ensure backend Socket.IO is configured

3. **Authentication Problems**
   - Clear localStorage
   - Check JWT token expiration
   - Verify backend authentication routes

4. **File Upload Issues**
   - Check MinIO configuration
   - Verify file size limits
   - Check file type restrictions

## Support

For issues and questions:
1. Check the browser console for errors
2. Verify environment configuration
3. Ensure backend is running and accessible
4. Check network connectivity

## License

MIT License - see LICENSE file for details.
