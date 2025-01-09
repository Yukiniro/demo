import Konva from "konva";
import hotkeys from "hotkeys-js";
import { nanoid } from "nanoid";
import { emitter } from "./mitt-store";

let stage: Konva.Stage | null = null;
let layer: Konva.Layer | null = null;
let aiPreviewLayer: Konva.Layer | null = null;
const selection = new Konva.Transformer();
let selectionRectangle: Konva.Rect | null = null;
let isAiPreviewing = false;

const textList: Record<string, string[]> = {
  "new year": ["New Year Starts!", "Joy, Hope, Love.", "Fresh Day Begins!", "Time Flies Fast!"],
  "happy birthday": ["Happy Birthday!", "Fun Times Here!", "Party Time Now!", "Cake Time Fun!"],
  travel: ["Travel Begins!", "Explore World!", "Journey Forward!", "Wonders Await!"],
};

const styleList = [
  {
    fontFamily: "Comic Sans MS",
    fill: "transparent",
    stroke: "rgba(0,0,0,0.5)",
    strokeWidth: 2,
  },
  {
    fontFamily: "Bookman",
    fill: "#FF69B4",
    stroke: "#FF1493",
    strokeWidth: 1,
    shadowColor: "#FFB6C1",
    shadowBlur: 10,
    shadowOffset: { x: 5, y: 5 },
    shadowOpacity: 0.8,
  },
  {
    fontFamily: "Impact",
    fill: "#4CAF50",
    stroke: "#2E7D32",
    strokeWidth: 4,
    shadowColor: "#81C784",
    shadowBlur: 20,
    shadowOffset: { x: 10, y: 10 },
    shadowOpacity: 0.8,
  },
];
let curStyleIndex = 0;
let interfaceType = "";

function clearBlur() {
  document.activeElement instanceof HTMLElement && document.activeElement.blur();
}

hotkeys("escape", function () {
  clearBlur();
  clearAiPreview();
});

hotkeys("space", function () {
  clearBlur();
  applyAiPreview();
});

hotkeys("backspace, delete", function () {
  clearBlur();
  clearAiPreview();
  selection.nodes().forEach(node => {
    node.remove();
  });
  selection.nodes([]);
});

hotkeys("/", function () {
  clearBlur();
  inference();
});

emitter.on("text-edit", text => {
  selection.nodes().forEach(node => {
    if (node.className === "Text") {
      (node as Konva.Text).text(text);
    }
  });
  updateInterfaceType("changet-text");
});

export function initApp(container: HTMLDivElement) {
  const { width, height } = container.getBoundingClientRect();
  stage = new Konva.Stage({
    container: container,
    width,
    height,
  });

  stage.on("dragstart", e => {
    if (selection.nodes().includes(e.target)) {
      return;
    }
    selection.nodes([e.target]);
  });

  layer = new Konva.Layer();
  stage.add(layer);

  aiPreviewLayer = new Konva.Layer({
    listening: false,
    draggable: false,
  });
  stage.add(aiPreviewLayer);

  selectionRectangle = new Konva.Rect({
    fill: "rgba(0,0,255,0.5)",
    visible: false,
    listening: false,
  });
  layer.add(selectionRectangle);
  layer.add(selection);

  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;
  let selecting = false;
  stage.on("mousedown touchstart", e => {
    clearAiPreview();
    if (e.target !== stage) {
      return;
    }
    e.evt.preventDefault();
    x1 = stage?.getPointerPosition()?.x ?? 0;
    y1 = stage?.getPointerPosition()?.y ?? 0;
    x2 = stage?.getPointerPosition()?.x ?? 0;
    y2 = stage?.getPointerPosition()?.y ?? 0;

    selectionRectangle?.width(0);
    selectionRectangle?.height(0);
    selecting = true;

    layer?.add(selectionRectangle!);
  });

  stage.on("mousemove touchmove", e => {
    if (!selecting) {
      return;
    }
    e.evt.preventDefault();
    x2 = stage?.getPointerPosition()?.x ?? 0;
    y2 = stage?.getPointerPosition()?.y ?? 0;

    selectionRectangle?.setAttrs({
      visible: true,
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    });
  });

  stage.on("mouseup touchend", e => {
    selecting = false;
    if (!selectionRectangle?.visible()) {
      return;
    }
    e.evt.preventDefault();
    selectionRectangle.visible(false);
    const box = selectionRectangle?.getClientRect();
    const selected = layer?.children?.filter(shape => {
      if (shape === selection || shape === selectionRectangle) {
        return false;
      }
      return Konva.Util.haveIntersection(box, shape.getClientRect());
    });
    selection.nodes(selected ?? []);
  });

  stage.on("click tap", e => {
    clearAiPreview();
    if (selectionRectangle?.visible()) {
      return;
    }

    if (e.target === stage) {
      selection.nodes([]);
      return;
    }

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = selection.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
      selection.nodes([e.target]);
    } else if (metaPressed && isSelected) {
      const nodes = selection.nodes().slice();
      nodes.splice(nodes.indexOf(e.target), 1);
      selection.nodes(nodes);
    } else if (metaPressed && !isSelected) {
      const nodes = selection.nodes().concat([e.target]);
      selection.nodes(nodes);
    }
  });

  stage.on("dblclick", e => {
    if (e.target === stage) {
      return;
    }
    if (e.target.className === "Text") {
      emitter.emit("dblclick-text", (e.target as Konva.Text).text());
    }
  });
}

function newElement(element: Konva.Text | Konva.Rect) {
  if (!layer || !stage) {
    return;
  }
  const { width, height } = stage.size();
  element.position({
    x: width / 2 - element.width() / 2,
    y: height / 2 - element.height() / 2,
  });
  layer.add(element);
  selection.setNodes([element]);
}

function updateInterfaceType(type: string) {
  interfaceType = type;
  console.trace("updateInterfaceType", type);
}

// 推理
function inference() {
  const allSelection = selection.nodes();
  const jsonList = allSelection.map(node => JSON.parse(node.toJSON()));
  if (interfaceType === "changet-text") {
    let contentList: string[] = [];
    const keys = Object.keys(textList);
    for (let i = 0; i < jsonList.length; i++) {
      const json = jsonList[i];
      if (json.className === "Text") {
        const key = keys.find(key => {
          const words1 = json.attrs.text.toLowerCase().split(/\s+/);
          const words2 = key.toLowerCase().split(/\s+/);
          return words1.some((word: string) => words2.includes(word));
        });
        if (key) {
          contentList = textList[key];
          break;
        }
      }
    }

    if (contentList.length === 0) {
      updateInterfaceType("change-style");
      inference();
      return;
    }

    if (jsonList.length < 4) {
      const item = JSON.parse(JSON.stringify(jsonList[jsonList.length - 1]));
      item.attrs.id = nanoid();
      item.attrs.y += allSelection[jsonList.length - 1].height();
      jsonList.push(item);
    } else if (jsonList[0].attrs.text === contentList[0]) {
      updateInterfaceType("");
      inference();
      return;
    }
    jsonList.forEach((json, index) => {
      json.attrs.text = contentList[index];
    });
  } else if (interfaceType === "change-style") {
    let styleIndex = curStyleIndex;
    while (styleIndex === curStyleIndex) {
      styleIndex = Math.floor(Math.random() * styleList.length);
    }
    curStyleIndex = styleIndex;
    const style = styleList[styleIndex];
    jsonList.forEach(json => {
      json.attrs = {
        ...json.attrs,
        ...style,
      };
    });
    updateInterfaceType("");
  } else if (interfaceType === "layout") {
    const layoutIndex = Math.random() < 0.5 ? 0 : 1;
    switch (layoutIndex) {
      case 0: {
        const height = allSelection.reduce((acc, node) => acc + node.height(), 0);
        const { height: stageHeight } = stage?.size() ?? { width: 0, height: 0 };
        jsonList.forEach((json, idx) => {
          json.attrs.x = jsonList[0].attrs.x;
          json.attrs.y = (stageHeight - height) / 2 + allSelection[idx].height() * idx;
        });
        break;
      }
      case 1: {
        jsonList.forEach((json, idx) => {
          const y = 100 + allSelection[idx].height() * idx;
          json.attrs.x = 50;
          json.attrs.y = y;
        });
        break;
      }
    }
  } else {
    if (allSelection.length > 0 && allSelection.some(node => node.x() !== allSelection[0].x())) {
      updateInterfaceType("layout");
      inference();
      return;
    }
    updateInterfaceType("change-style");
    inference();
    return;
  }

  selection.nodes().forEach(node => {
    node.visible(false);
  });
  selection.visible(false);
  updateAiPreview(JSON.stringify(jsonList));
}

function updateAiPreview(data: string) {
  isAiPreviewing = true;
  const jsonList = JSON.parse(data);
  const elements = jsonList.map((json: unknown) => {
    return Konva.Node.create(json);
  });
  const group = new Konva.Group({ name: "animation" });
  group.add(...elements);
  const backRect = new Konva.Rect({ fill: "rgba(255,165,0,0.6)", width: 1000, height: 1000 });
  const { x, y, width, height } = group.getClientRect();
  backRect.position({ x, y });
  backRect.size({ width, height });
  aiPreviewLayer?.opacity(0.8);
  aiPreviewLayer?.add(group);
  aiPreviewLayer?.add(backRect);
}

function clearAiPreview() {
  isAiPreviewing = false;
  aiPreviewLayer?.destroyChildren();
  selection.nodes().forEach(node => {
    node.visible(true);
  });
  selection.visible(true);
}

function applyAiPreview() {
  if (!isAiPreviewing) {
    return;
  }
  const animationElement = aiPreviewLayer?.findOne(".animation");
  if (!animationElement) {
    return;
  }
  (animationElement as Konva.Group).children.forEach(node => {
    const id = node.id();
    const element = layer?.findOne(`#${id}`);
    if (element) {
      element.setAttrs(Object.assign({}, element.attrs, node.attrs));
    } else {
      layer?.add(node);
    }
  });
  clearAiPreview();

  if (interfaceType === "changet-text") {
    selection.nodes(layer?.find("Text") ?? []);
  }
}

export function addText() {
  if (!layer || !stage) {
    return;
  }
  const textNode = new Konva.Text({
    text: "hello world",
    fontSize: 60,
    fontFamily: "Arial",
    draggable: true,
    id: nanoid(),
  });
  newElement(textNode);
}

export function setText(text: string) {
  const textNode = selection.nodes()[0] as Konva.Text;
  textNode.text(text);
  updateInterfaceType("changet-text");
}
