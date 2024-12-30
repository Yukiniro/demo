import Konva from "konva";

let stage: Konva.Stage | null = null;
let layer: Konva.Layer | null = null;
const selection = new Konva.Transformer();
let selectionRectangle: Konva.Rect | null = null;

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

export function addText() {
  if (!layer || !stage) {
    return;
  }
  const textNode = new Konva.Text({ text: "hello world", fontSize: 60, fontFamily: "Arial", draggable: true });
  newElement(textNode);
}

export function addRect() {
  if (!layer || !stage) {
    return;
  }
  const rect = new Konva.Rect({ width: 200, height: 200, fill: "red", draggable: true });
  newElement(rect);
}
