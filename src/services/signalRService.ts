import * as signalR from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL ?? '';

let connection: signalR.HubConnection | null = null;

// Handlers registered before connection is ready — attached on start / reconnect
const pendingHandlers: Array<{ event: string; handler: (...args: unknown[]) => void }> = [];

export function getConnection(): signalR.HubConnection | null {
  return connection;
}

/**
 * Register a SignalR event handler.
 * Works even if the connection hasn't started yet — the handler is queued
 * and attached once the connection is ready.
 * Returns a cleanup function that removes the handler.
 */
export function onHubEvent(
  event: string,
  handler: (...args: unknown[]) => void,
): () => void {
  const conn = connection;
  if (conn) {
    conn.on(event, handler);
  } else {
    pendingHandlers.push({ event, handler });
  }

  return () => {
    connection?.off(event, handler);
    const idx = pendingHandlers.findIndex(p => p.event === event && p.handler === handler);
    if (idx !== -1) pendingHandlers.splice(idx, 1);
  };
}

function flushPending() {
  if (!connection) return;
  while (pendingHandlers.length > 0) {
    const { event, handler } = pendingHandlers.shift()!;
    connection.on(event, handler);
  }
}

export async function startConnection(token: string): Promise<void> {
  if (connection) {
    await stopConnection();
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/app`, {
      accessTokenFactory: () => token,
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  // Re-attach pending handlers after automatic reconnection
  connection.onreconnected(() => flushPending());

  // Attach any handlers that were registered before this call
  flushPending();

  try {
    await connection.start();
  } catch {
    // Keep the connection object so withAutomaticReconnect can retry
  }
}

export async function stopConnection(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}
