"use client";

import { Type, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { addText } from "@/store";
import IconButton from "./button/icon-button";

export default function Toolbar() {
  const handleAddText = () => {
    addText();
  };
  const tools = [
    { icon: Type, label: "Text", onClick: handleAddText },
    { icon: Square, label: "Shape", onClick: () => {} },
  ];

  return (
    <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 px-6 py-2">
        {tools.map(tool => (
          <IconButton icon={<tool.icon />} onClick={tool.onClick} />
        ))}
      </div>
    </Card>
  );
}
