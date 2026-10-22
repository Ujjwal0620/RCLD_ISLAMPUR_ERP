"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Laptop,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";

const fallbackSlides = [
  {
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2200&q=88",
    eyebrow: "RCLD Islampur · Skill Development",
    title: "Learn skills that move",
    accent: "your future forward.",
    description: "Modern computer education with structured learning, practical guidance and a digital student experience built around your progress.",
    primaryLabel: "Explore courses",
    primaryHref: "/courses",
    secondaryLabel: "Student login",
    secondaryHref: "/student/login",
    statLabel: "Career-ready learning",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2200&q=88",
    eyebrow: "Learn · Practice · Progress",
    title: "Your classroom now has",
    accent: "a digital workspace.",
    description: "Access lessons, resources, assessments and progress from one focused learning portal—wherever your learning continues.",
    primaryLabel: "Start learning",
    primaryHref: "/student/login",
    secondaryLabel: "How it works",
    secondaryHref: "/learning",
    statLabel: "One connected platform",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=2200&q=88",
    eyebrow: "Practical Computer Education",
    title: "Turn curiosity into",
    accent: "real digital capability.",
    description: "From computer fundamentals and office skills to programming and professional digital tools, choose a path designed for useful outcomes.",
    primaryLabel: "View programs",
    primaryHref: "/courses",
    secondaryLabel: "About RCLD",
    secondaryHref: "/about",
    statLabel: "10+ focused programs",
  },
];

function normalize(slide) {
  return {
    ...slide,
    imageUrl: slide.imageUrl || slide.image || "",
    primaryLabel: slide.primaryLabel || slide.primary || "Explore courses",
    secondaryLabel: slide.secondaryLabel || slide.secondary || "Student login",
    statLabel: slide.statLabel || slide.stat || "Career-ready learning",
  };
}

export default function HomeHeroSlider({ initialSlides = [] }) {
  const displaySlides = useMemo(
    () => (initialSlides.length ? initialSlides : fallbackSlides).slice(0, 3).map(normalize),
    [initialSlides]
  );
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActive(0);
  }, [displaySlides.length]);

  const next = useCallback(() => {
    setActive((current) => (current + 1) % displaySlides.length);
  }, [displaySlides.length]);

  useEffect(() => {
    if (paused || displaySlides.length < 2) return undefined;
    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [next, paused, displaySlides.length]);

  const move = (direction) => {
    setActive((current) => (current + direction + displaySlides.length) % displaySlides.length);
  };

  return (
    <section
      className="home-slider"
      aria-label="RCLD Islampur featured programs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      {displaySlides.map((slide, index) => {
        const activeSlide = index === active;
        return (
          <article
            key={slide.id || slide.title || index}
            className={"home-slide " + (activeSlide ? "is-active" : "")}
            aria-hidden={!activeSlide}
          >
            <div
              className="home-slide-image"
              style={{ backgroundImage: `url("${slide.imageUrl}")` }}
              aria-hidden="true"
            />
            <div className="home-slide-shade" aria-hidden="true" />

            <div className="home-slide-content mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
              <div className="home-slide-copy">
                <span className="public-pill">
                  <Sparkles size={14} />
                  {slide.eyebrow || "RCLD Islampur · Skill Development"}
                </span>

                <h1 className="home-slide-title">
                  {slide.title}
                  {slide.accent && (
                    <>
                      <br />
                      <span className="public-gradient-text">{slide.accent}</span>
                    </>
                  )}
                </h1>

                {slide.description && (
                  <p className="home-slide-description">{slide.description}</p>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={slide.primaryHref || "/courses"} className="public-btn-primary">
                    {slide.primaryLabel} <ArrowRight size={17} />
                  </Link>
                  {slide.secondaryLabel && (
                    <Link href={slide.secondaryHref || "/student/login"} className="public-btn-secondary">
                      {slide.secondaryLabel}
                    </Link>
                  )}
                </div>

                <div className="mt-8 grid max-w-3xl gap-2.5 sm:grid-cols-3">
                  <div className="home-slide-panel">
                    <GraduationCap size={18} className="text-cyan-300" />
                    <div><p>{slide.statLabel}</p><span>Focused outcomes</span></div>
                  </div>
                  <div className="home-slide-panel">
                    <BookOpen size={18} className="text-cyan-300" />
                    <div><p>Structured courses</p><span>Learn step by step</span></div>
                  </div>
                  <div className="home-slide-panel">
                    <CheckCircle2 size={18} className="text-cyan-300" />
                    <div><p>Progress tracking</p><span>See your growth</span></div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      {displaySlides.length > 1 && (
        <>
          <button type="button" className="home-slider-arrow prev" onClick={() => move(-1)} aria-label="Previous banner">
            <ArrowLeft size={18} />
          </button>
          <button type="button" className="home-slider-arrow next" onClick={() => move(1)} aria-label="Next banner">
            <ArrowRight size={18} />
          </button>

          <div className="home-slider-controls">
            <div className="home-slider-dots">
              {displaySlides.map((slide, index) => (
                <button
                  key={slide.id || slide.title || index}
                  type="button"
                  className={"home-slider-dot " + (index === active ? "is-active" : "")}
                  onClick={() => setActive(index)}
                  aria-label={"Go to banner " + (index + 1)}
                  aria-current={index === active}
                />
              ))}
            </div>
            <button
              type="button"
              className="home-slider-pause"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Resume automatic banner rotation" : "Pause automatic banner rotation"}
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
              <span>{paused ? "Play" : "Pause"}</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
}
