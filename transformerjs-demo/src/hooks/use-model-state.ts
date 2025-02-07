import { useState } from "react";

export interface ModelState {
  prepareModelTime: number;
  pendingTime: number;
  isModelReady: boolean;
  input: string;
  output: string;
  pending: boolean;
}

export interface ModelStateActions {
  setPrepareModelTime: (time: number) => void;
  setPendingTime: (time: number) => void;
  setIsModelReady: (ready: boolean) => void;
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  setPending: (pending: boolean) => void;
}

export default function useModelState(inputDefault?: string): [ModelState, ModelStateActions] {
  const [prepareModelTime, setPrepareModelTime] = useState(0);
  const [pendingTime, setPendingTime] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);
  const [input, setInput] = useState(inputDefault || "");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);

  return [
    { prepareModelTime, pendingTime, isModelReady, input, output, pending },
    { setPrepareModelTime, setPendingTime, setIsModelReady, setInput, setOutput, setPending },
  ];
}
