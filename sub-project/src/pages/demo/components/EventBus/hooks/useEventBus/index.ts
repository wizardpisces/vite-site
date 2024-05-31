import { useEffect, useState } from 'react';

type EventCallback = (data?: any) => void;


class EventBus {
  private listeners: { [key: string]: EventCallback[] } = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  unsubscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();

export const useEventBus = (event: string, initialState: any) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const updateState = (data: any) => setState(data);
    eventBus.subscribe(event, updateState);
    return () => eventBus.unsubscribe(event, updateState);
  }, [event]);

  const emitEvent = (data: any) => {
    eventBus.emit(event, data);
  };

  return [state, emitEvent] as const;
};
