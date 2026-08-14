// PuffTrack Render Backend API Client & Keep-Alive Service

class BackendApiService {
  private eventSource: EventSource | null = null;
  private pingInterval: any = null;
  private currentBackendUrl: string;

  constructor() {
    this.currentBackendUrl = localStorage.getItem('pufftrack_backend_url') || "https://pufftrack-app.onrender.com";
  }

  public getBackendUrl(): string {
    return this.currentBackendUrl;
  }

  public setBackendUrl(url: string) {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    this.currentBackendUrl = cleanUrl;
    localStorage.setItem('pufftrack_backend_url', cleanUrl);
  }

  // Initialize 14 minute Keep-Alive Heartbeat Ping Loop
  public startKeepAlivePing() {
    this.pingServer();
    if (this.pingInterval) clearInterval(this.pingInterval);
    
    // Ping backend server every 14 minutes (840,000 ms) to keep Render awake 24/7
    this.pingInterval = setInterval(() => {
      this.pingServer();
    }, 14 * 60 * 1000);
  }

  public async pingServer(): Promise<boolean> {
    try {
      const res = await fetch(`${this.currentBackendUrl}/ping`, { mode: 'cors' });
      if (res.ok) {
        console.log('[PuffTrack] 4.5m Heartbeat ping sent to Render server');
        return true;
      }
      return false;
    } catch (e) {
      console.log('[PuffTrack] Backend ping note (offline or initial boot):', e);
      return false;
    }
  }

  // Subscribe to real-time Server-Sent Events (SSE) stream for instant hit updates
  public connectStream(key: string, onHitReceived: (data: any) => void) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      const url = `${this.currentBackendUrl}/api/stream?key=${encodeURIComponent(key)}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PUFF_ADDED') {
            onHitReceived(data);
          }
        } catch (e) {
          console.error('SSE parse error', e);
        }
      };

      this.eventSource.onerror = () => {
        console.warn('SSE stream error, retrying...');
      };
    } catch (e) {
      console.warn('Failed to connect SSE stream', e);
    }
  }

  public disconnectStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Trigger hit directly to backend API
  public async logHit(key: string, mood?: string) {
    try {
      const res = await fetch(`${this.currentBackendUrl}/hit?key=${encodeURIComponent(key)}${mood ? `&mood=${mood}` : ''}`, {
        method: 'GET',
        mode: 'cors',
      });
      return await res.json();
    } catch (e) {
      console.error('Backend log hit error', e);
      return null;
    }
  }
}

export const backendApi = new BackendApiService();
