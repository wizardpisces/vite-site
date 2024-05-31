import { useEventBus } from "./hooks/useEventBus";
import { EventType } from "./hooks/useEventBus/type";

export const Child2 = () => {
  const [signal, emitSignalChange] = useEventBus(EventType.SIGNAL_CHANGE, 0);
  return <button onClick={() => emitSignalChange(Number(!signal))}>click to toggle signal</button>;
}