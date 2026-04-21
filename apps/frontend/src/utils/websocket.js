/**
 * WebSocket Client for Real-time Notifications
 * Handles: Loan status, payments, chat, leaderboards
 */

const WS_API_URL = "ws://localhost:8000";

class WebSocketClient {
  constructor() {
    this.notificationsSocket = null;
    this.chatSocket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnected = false;
  }

  /**
   * Connect to notifications WebSocket
   */
  async connectNotifications(userId) {
    return new Promise((resolve, reject) => {
      try {
        this.notificationsSocket = new WebSocket(
          `${WS_API_URL}/ws/notifications/${userId}`,
        );

        this.notificationsSocket.onopen = () => {
          console.log("Notifications WebSocket connected");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.notificationsSocket.onclose = () => {
          console.log("Notifications WebSocket disconnected");
          this.isConnected = false;
          this.attemptReconnect(userId, "notifications");
        };

        this.notificationsSocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.notificationsSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Connect to chat WebSocket
   */
  async connectChat(userId) {
    return new Promise((resolve, reject) => {
      try {
        this.chatSocket = new WebSocket(`${WS_API_URL}/ws/chat/${userId}`);

        this.chatSocket.onopen = () => {
          console.log("Chat WebSocket connected");
          resolve();
        };

        this.chatSocket.onclose = () => {
          console.log("Chat WebSocket disconnected");
        };

        this.chatSocket.onerror = (error) => {
          console.error("Chat WebSocket error:", error);
          reject(error);
        };

        this.chatSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.emit("chat", data);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    switch (data.type) {
      case "loan_update":
        this.emit("loan", data);
        // Show notification
        if (data.message) {
          window.showToast(data.message, "info");
        }
        break;

      case "payment_update":
        this.emit("payment", data);
        if (data.message) {
          window.showToast(
            data.message,
            data.status === "completed" ? "success" : "error",
          );
        }
        break;

      case "achievement":
        this.emit("achievement", data);
        if (data.message) {
          window.showToast(data.message, "success");
        }
        break;

      case "leaderboard_update":
        this.emit("leaderboard", data);
        break;

      case "pong":
        // Keepalive response
        break;

      default:
        this.emit(data.type, data);
    }
  }

  /**
   * Send chat message
   */
  sendChatMessage(message) {
    if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
      this.chatSocket.send(
        JSON.stringify({
          type: "chat_message",
          message: message,
        }),
      );
    }
  }

  /**
   * Attempt to reconnect
   */
  async attemptReconnect(userId, type) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
      );
      setTimeout(() => {
        if (type === "notifications") {
          this.connectNotifications(userId);
        }
      }, this.reconnectDelay);
    }
  }

  /**
   * Event emitter
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data));
    }
  }

  /**
   * Disconnect all
   */
  disconnect() {
    if (this.notificationsSocket) {
      this.notificationsSocket.close();
      this.notificationsSocket = null;
    }
    if (this.chatSocket) {
      this.chatSocket.close();
      this.chatSocket = null;
    }
    this.isConnected = false;
  }
}

// Create singleton instance
const wsClient = new WebSocketClient();

// Export
window.wsClient = wsClient;
export default wsClient;
