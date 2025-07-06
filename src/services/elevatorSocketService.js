const WEBSOCKET_URL = 'ws://localhost:8080/ws/elevator/status'; // 后端WebSocket服务器地址

class ElevatorSocketService {
  constructor() {
    this.socket = null;
    this.messageListener = null;
  }

  /**
   * 连接到WebSocket服务器
   * @param {string} elevatorId - 要订阅的电梯ID
   * @param {function} onMessageCallback - 收到消息时的回调函数
   */
  connect(elevatorId, onMessageCallback) {
    // 防止重复连接
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected.');
      return;
    }

    const url = `${WEBSOCKET_URL}/${elevatorId}`;
    this.socket = new WebSocket(url);
    this.messageListener = onMessageCallback;

    this.socket.onopen = () => {
      console.log(`WebSocket connected to ${url}`);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.messageListener) {
          this.messageListener(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket disconnected from ${url}. Code: ${event.code}, Reason: ${event.reason}`);
      // 可选：在此处实现自动重连逻辑
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * 发送消息到服务器
   * @param {any} data - 要发送的数据
   */
  sendMessage(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  /**
   * 关闭WebSocket连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.messageListener = null;
    }
  }
}

// 导出一个单例，确保整个应用只有一个WebSocket服务实例
export default new ElevatorSocketService(); 