"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Hash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type StorySlide = { id:string; url:string; alt:string|null; caption:string|null; width:number; height:number; fileSize:number };

export function StorySlider({ slug, title, slides, initialFrame }: { slug:string; title:string; slides:StorySlide[]; initialFrame:number }) {
  const [frame, setFrame] = useState(initialFrame);
  const index = frame - 1, slide = slides[index];
  const go = useCallback((nextFrame:number, push=true) => {
    if (nextFrame < 1 || nextFrame > slides.length) return;
    setFrame(nextFrame);
    if (push) window.history.pushState({ frame: nextFrame }, "", `/stories/${slug}/${nextFrame}`);
  }, [slides.length, slug]);

  useEffect(() => {
    const preload = (target:number) => { const item=slides[target-1]; if(item){const image=new window.Image(); image.src=item.url;} };
    preload(frame-1); preload(frame+1);
  }, [frame, slides]);
  useEffect(() => {
    const onPopState=()=>{const value=Number(window.location.pathname.split("/").pop());if(Number.isInteger(value)&&value>=1&&value<=slides.length)setFrame(value)};
    const onKey=(event:KeyboardEvent)=>{if(event.key==="ArrowLeft")go(frame-1);if(event.key==="ArrowRight")go(frame+1)};
    window.addEventListener("popstate",onPopState);window.addEventListener("keydown",onKey);return()=>{window.removeEventListener("popstate",onPopState);window.removeEventListener("keydown",onKey)};
  }, [frame, go, slides.length]);

  return <>
    <div className="relative grid min-h-[420px] place-items-center overflow-hidden bg-border-light md:min-h-[620px]">
      <Image key={`backdrop-${slide.id}`} src={slide.url} alt="" fill sizes="(max-width: 1024px) 100vw, 66vw" unoptimized aria-hidden className="scale-110 object-cover opacity-45 blur-2xl saturate-75"/>
      <div className="absolute inset-0 bg-black/15" aria-hidden="true"/>
      <Image key={slide.id} src={slide.url} alt={slide.alt||title} width={slide.width} height={slide.height} sizes="(max-width: 1024px) 100vw, 66vw" priority unoptimized className="relative z-10 max-h-[78vh] h-auto w-auto max-w-full object-contain shadow-2xl"/>
      {frame>1&&<button type="button" onClick={()=>go(frame-1)} aria-label="Ảnh trước" className="absolute left-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/80"><ArrowLeft size={20}/></button>}
      {frame<slides.length&&<button type="button" onClick={()=>go(frame+1)} aria-label="Ảnh tiếp theo" className="absolute right-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/80"><ArrowRight size={20}/></button>}
    </div>
    <div className="mt-3 flex items-start justify-between gap-4"><p className="text-xs leading-5 text-muted">{String(frame).padStart(2,"0")} / {slide.caption||slide.alt||"Không có chú thích"}</p><span className="shrink-0 font-mono text-xs text-muted">{slide.width} × {slide.height}</span></div>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-2">{slides.map((thumb,thumbIndex)=><button type="button" key={thumb.id} onClick={()=>go(thumbIndex+1)} aria-label={`Frame ${thumbIndex+1}`} className={`relative h-16 w-20 shrink-0 overflow-hidden border-2 ${thumbIndex===index?"border-burnt-orange":"border-transparent opacity-60 hover:opacity-100"}`}><Image src={thumb.url} alt="" fill sizes="80px" className="object-cover"/></button>)}</div>
    <div className="mt-5 grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-3"><div><span className="text-muted">Frame</span><p className="font-medium">{frame} / {slides.length}</p></div><div><span className="text-muted">Resolution</span><p className="font-medium">{slide.width} × {slide.height}</p></div><div><span className="flex items-center gap-1 text-muted"><Hash size={13}/>Frame ID</span><p className="font-mono text-xs font-medium">{slide.id.slice(0,8).toUpperCase()}</p></div></div>
  </>;
}
