"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useRef } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);  
  const [connectionStatus, setConnectionStatus] = useState("未连接");
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleConnect = () => {
    setIsConnected(true);
    const eventSource = new EventSource("/api/sse");
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      setMessage(event.data);
    };
    
    eventSource.onerror = (event) => {
      console.error("EventSource failed:", event);
      setIsConnected(false);
      setConnectionStatus("连接失败");
      console.log(eventSource.readyState);
    };
    
    eventSource.onopen = () => {
      setConnectionStatus("已连接");
    };
  };

  const handleDisconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setConnectionStatus("已断开连接");
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
      <div className="w-screen h-screen flex flex-col items-center justify-center font-mono text-lg text-center gap-4">
        <h1 className="text-6xl font-bold fixed top-12">SSE Demo</h1>
        <div className="flex gap-4">
          <Button onClick={handleConnect} disabled={isConnected}>
            {isConnected ? "已连接" : "连接"}
          </Button>
          <Button onClick={handleDisconnect} disabled={!isConnected}>
            断开连接
          </Button>
        </div>
        <p>连接状态：{connectionStatus}</p>
        <p>{message}</p>
      </div>
    </div>
  );
}