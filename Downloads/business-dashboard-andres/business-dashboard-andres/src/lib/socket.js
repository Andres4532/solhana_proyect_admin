import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.isConnected = true;
      
      // Authenticate with the server
      this.socket.emit('authenticate', { token });
    });

    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      toast.success('Connected to real-time updates');
    });

    this.socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error);
      toast.error('Failed to connect to real-time updates');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error');
    });

    // Order events
    this.socket.on('order_status_changed', (data) => {
      console.log('Order status changed:', data);
      this.notifyListeners('order_status_changed', data);
      toast.success(`Order ${data.orderNumber} status: ${data.status}`);
    });

    this.socket.on('new_order_available', (data) => {
      console.log('New order available:', data);
      this.notifyListeners('new_order_available', data);
      toast.success('New order received!');
    });

    // Moto events
    this.socket.on('moto_status_changed', (data) => {
      console.log('Moto status changed:', data);
      this.notifyListeners('moto_status_changed', data);
      toast.success(`Moto request ${data.requestNumber} status: ${data.status}`);
    });

    this.socket.on('new_moto_request', (data) => {
      console.log('New moto request:', data);
      this.notifyListeners('new_moto_request', data);
      toast.success('New moto request received!');
    });

    // Driver events
    this.socket.on('driver_location_updated', (data) => {
      console.log('Driver location updated:', data);
      this.notifyListeners('driver_location_updated', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket listener:', error);
        }
      });
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Order events
  updateOrderStatus(orderId, status, driverId = null) {
    this.emit('order_status_update', { orderId, status, driverId });
  }

  notifyNewOrder(orderData) {
    this.emit('new_order', orderData);
  }

  // Moto events
  updateMotoStatus(requestId, status, driverId = null) {
    this.emit('moto_status_update', { requestId, status, driverId });
  }

  notifyNewMotoRequest(requestData) {
    this.emit('new_moto_request', requestData);
  }

  // Driver events
  updateDriverLocation(lat, lng) {
    this.emit('update_location', { lat, lng });
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 