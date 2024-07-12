function calcTextSize(ctx: CanvasRenderingContext2D, text: string) {
  ctx.save();
  ctx.font = '60px ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
  const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  const lineHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
  ctx.restore();

  return {
    width: textWidth,
    height: textHeight,
    lineHeight,
  };
}

export { calcTextSize };
