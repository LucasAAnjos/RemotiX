// WebSocket utility for equipment control

export type VariableUpdateCallback = (status: string, bits: any) => void;

export interface EquipmentWebSocket {
  sendCommand: (tag: string, command: number) => void;
  close: () => void;
  isOpen: () => boolean;
}

export function createEquipmentWebSocket(
  url: string,
  onVariableUpdate: VariableUpdateCallback,
  onError?: (err: Event) => void,
  onOpen?: () => void,
  onClose?: () => void
): EquipmentWebSocket {
  let ws: WebSocket | null = new WebSocket(url);

  ws.onopen = () => {
    if (onOpen) onOpen();
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'variableUpdate') {
        onVariableUpdate(msg.status, msg.bits);
      }
    } catch (err) {
      console.error('Erro parse WebSocket:', err);
    }
  };

  ws.onerror = (err: Event) => {
    if (onError) onError(err);
    else console.error('WebSocket erro:', err);
  };

  ws.onclose = () => {
    if (onClose) onClose();
  };

  return {
    sendCommand: (tag: string, command: number) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'setCommand',
            tag,
            command,
          })
        );
      } else {
        throw new Error('WebSocket not open');
      }
    },
    close: () => {
      if (ws) ws.close();
    },
    isOpen: () => ws !== null && ws.readyState === WebSocket.OPEN,
  };
} 