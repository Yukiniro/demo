function calcTextSize(ctx: CanvasRenderingContext2D, text: string) {
  ctx.save();
  ctx.font = '60px ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
  const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  const lineHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
  ctx.restore();

  return {
    // 如果 textWidth 为 0，说明 text 为空字符串，此时使用 textMetrics.width 作为宽度
    width: textWidth || textMetrics.width,
    height: textHeight,
    lineHeight,
  };
}

export { calcTextSize };
