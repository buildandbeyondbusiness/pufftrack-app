// PuffTrack Cloudflare Edge API Client

class BackendApiService {
  private eventSource: EventSource | null = null;
  private currentBackendUrl: string;

  constructor() {
    // Default to current origin if in browser, or stored custom URL
    const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    this.currentBackendUrl = localStorage.getItem('pufftrack_backend_url') || defaultOrigin || 'https://pufftrack-app.pages.dev';
  }

  public getBackendUrl(): string {
    return this.currentBackendUrl;
  }

  public setBackendUrl(url: string) {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    this.currentBackendUrl = cleanUrl;
    localStorage.setItem('pufftrack_backend_url', cleanUrl);
  }

  // Cloudflare is always-on global edge, so ping is just a quick health check
  public startKeepAlivePing() {
    this.pingServer();
  }

  public async pingServer(): Promise<boolean> {
    try {
      const res = await fetch(`${this.currentBackendUrl}/ping`, { mode: 'cors' });
      if (res.ok) {
        console.log('[PuffTrack] Cloudflare Edge ping successful');
        return true;
      }
      return false;
    } catch (e) {
      console.log('[PuffTrack] Cloudflare Edge ping note:', e);
      return false;
    }
  }

  // Subscribe to real-time Server-Sent Events (SSE) stream if available
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
        // quiet retry
      };
    } catch (e) {
      // quiet fallback to Firestore realtime sync
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
      const res = await fetch(
        `${this.currentBackendUrl}/hit?key=${encodeURIComponent(key)}${mood ? `&mood=${encodeURIComponent(mood)}` : ''}`,
        {
          method: 'GET',
          mode: 'cors',
        }
      );
      return await res.json();
    } catch (e) {
      console.error('Backend log hit error', e);
      return null;
    }
  }
}

export const backendApi = new BackendApiService();
