import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";
import { calcTextSize } from "@/util";

const AUTO_PALY = true;
const TEXT = "hello world";

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
  console.clear();

  canvasAniTarget.forEach(target => {
    const { scale, opacity, filter, index } = target;
    const { width: textWidth } = calcTextSize(ctx, TEXT.slice(0, index + 1));
    const { width: charWidth, height: charHeight } = calcTextSize(ctx, TEXT[index]);
    ctx.save();
    ctx.translate(288 + textWidth + charWidth / 2, 256 + charHeight / 2);
    console.log(`x: ${288 + textWidth / 2 + charWidth / 2}`);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;
    ctx.filter = filter;
    ctx.fillText(TEXT[index], -(charWidth * scale) / 2, (charHeight * scale) / 2);
    ctx.restore();
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
        loop: true,
        autoplay: AUTO_PALY,
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
        loop: true,
        autoplay: AUTO_PALY,
        update: () => {
          canvasAniUpdate(ctx);
        },
      });
  }, []);

  return (
    <>
      <div className="w-1/2 h-full border-black border-r relative">
        <div ref={domRef} className="absolute font-serif text-6xl left-72 top-64 will-change-transform">
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
