"use client";

// import { Type, Square } from "lucide-react";
import { Type } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { addText } from "@/store";

export default function Toolbar() {
  const tools = [
    { icon: Type, label: "Text" },
    // { icon: Square, label: "Shape" },
  ];

  const handleAddText = () => {
    addText();
  };

  return (
    <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <TooltipProvider>
        <div className="flex items-center gap-4 px-6 py-2">
          {tools.map(tool => (
            <Tooltip key={tool.label}>
              <TooltipTrigger asChild>
                <Toggle
                  onClick={tool.label === "Text" ? handleAddText : () => {}}
                  variant="outline"
                  size="sm"
                  className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                  <tool.icon className="h-32 w-32" />
                  <span className="sr-only">{tool.label}</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </Card>
  );
}
