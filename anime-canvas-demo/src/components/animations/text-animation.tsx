import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";
import { calcTextSize } from "@/util";

const AUTO_PALY = true;
const TEXT = "hello world";
const BASE_LEFT = 288;
const BASE_TOP = 256;

const charCanvas = new OffscreenCanvas(100, 100);
const charCanvasPaddingRatio = 0.2;

const canvasAniTarget = Array.from(TEXT)
  .map((t, index) => {
    if (t !== " ") {
      return {
        index,
        scale: 2,
        opacity: 0,
        filter: "blur(6px)",
      };
    }
  })
  .filter(t => !!t);
const canvasAniUpdate = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = '60px ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

  const { height: textHeight } = calcTextSize(ctx, TEXT);

  let offset = 0;

  canvasAniTarget.forEach(target => {
    const { scale, opacity, filter, index } = target;
    const { width: charWidth } = calcTextSize(ctx, TEXT[index]);

    charCanvas.width = charWidth + charCanvasPaddingRatio * charWidth * 2;
    charCanvas.height = textHeight + charCanvasPaddingRatio * textHeight * 2;
    const charCtx = charCanvas.getContext("2d");

    if (!charCtx) return;
    charCtx.save();
    charCtx.font = '60px ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    charCtx.translate(charWidth / 2, textHeight / 2);
    charCtx.fillText(TEXT[index], -charWidth / 2, textHeight / 2);
    charCtx.restore();

    ctx.save();
    ctx.translate(BASE_LEFT + offset + charCanvas.width / 2, BASE_TOP + charCanvas.width / 2);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;
    ctx.filter = filter;
    ctx.drawImage(charCanvas, -charCanvas.width / 2, -charCanvas.width / 2);
    ctx.restore();

    offset += charWidth;
  });
};

function TextAnimation() {
  const domRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const domAni = useRef<anime.AnimeInstance | null>(null);
  const canvasAni = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    if (!domRef.current) return;
    domAni.current =
      domAni.current ||
      anime({
        targets: domRef.current.querySelectorAll("span"),
        scale: [2, 1],
        opacity: [0, 1],
        translateZ: 0,
        filter: ["blur(6px)", "blur(0px)"],
        easing: "linear",
        delay: anime.stagger(200),
        duration: 2000,
        // loop: true,
        autoplay: AUTO_PALY,
        begin: () => {
          console.log("dom ani begin", performance.now());
        },
        complete: () => {
          console.log("dom ani complete", performance.now());
        },
      });
  }, []);

  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !canvasContainer) return;

    const { width, height } = canvasContainer.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvasAniUpdate(ctx);

    canvasAni.current =
      canvasAni.current ||
      anime({
        targets: canvasAniTarget,
        scale: [2, 1],
        opacity: [0, 1],
        translateZ: 0,
        filter: ["blur(6px)", "blur(0px)"],
        easing: "linear",
        delay: anime.stagger(200),
        duration: 2000,
        // loop: true,
        autoplay: AUTO_PALY,
        update: () => {
          canvasAniUpdate(ctx);
        },
        begin: () => {
          console.log("canvas ani begin", performance.now());
        },
        complete: () => {
          console.log("canvas ani complete", performance.now());
        },
      });
  }, []);

  return (
    <>
      <div className="w-1/2 h-full border-black border-r relative">
        <div
          ref={domRef}
          style={{
            left: BASE_LEFT,
            top: BASE_TOP,
          }}
          className="absolute font-serif text-6xl will-change-transform"
        >
          {Array.from(TEXT).map((char, i) => (
            <span className="inline-block" key={i}>
              {char}
            </span>
          ))}
        </div>
      </div>
      <div ref={canvasContainerRef} className="w-1/2 h-full border-black border-l relative">
        <canvas ref={canvasRef} />
      </div>
    </>
  );
}

export default TextAnimation;
