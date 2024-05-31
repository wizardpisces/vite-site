import { useEventBus } from "./hooks/useEventBus";
import { EventType } from "./hooks/useEventBus/type";

export const Child1 = () => {
  const [signal] = useEventBus(EventType.SIGNAL_CHANGE, 0);
  console.log(signal)
  return <div>{signal ? 'signal is 1' : 'signal is 0'}</div>;
}