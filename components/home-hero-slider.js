"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Laptop,
  PlayCircle,
  Sparkles,
} from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85",
    eyebrow: "RCLD Islampur · Skill Development",
    title: "Learn skills that move",
    accent: "your future forward.",
    description: "Modern computer education with structured learning, practical guidance and a digital student experience built around your progress.",
    primary: "Explore courses",
    primaryHref: "/courses",
    secondary: "Student login",
    secondaryHref: "/student/login",
    icon: GraduationCap,
    stat: "Career-ready learning",
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2000&q=85",
    eyebrow: "Learn · Practice · Progress",
    title: "Your classroom now has",
    accent: "a digital workspace.",
    description: "Access lessons, resources, assessments and progress from one focused learning portal—wherever your learning continues.",
    primary: "Start learning",
    primaryHref: "/student/login",
    secondary: "How it works",
    secondaryHref: "/learning",
    icon: Laptop,
    stat: "One connected platform",
  },
  {
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=2000&q=85",
    eyebrow: "Practical Computer Education",
    title: "Turn curiosity into",
    accent: "real digital capability.",
    description: "From computer fundamentals and office skills to programming and professional digital tools, choose a path designed for useful outcomes.",
    primary: "View programs",
    primaryHref: "/courses",
    secondary: "About RCLD",
    secondaryHref: "/about",
    icon: Code2,
    stat: "10+ focused programs",
  },
];

export default function HomeHeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const move = (direction) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section className="home-slider" aria-label="RCLD highlights">
      {slides.map((slide, index) => {
        const Icon = slide.icon;
        return (
          <article
            key={slide.title}
            className={"home-slide " + (index === active ? "is-active" : "")}
            aria-hidden={index !== active}
          >
            <div
              className="home-slide-image"
              style={{ backgroundImage: `url("${slide.image}")` }}
            />

            <div className="home-slide-content mx-auto w-full max-w-7xl px-6 py-20">
              <div className="max-w-3xl">
                <span className="public-pill">
                  <Sparkles size={14} />
                  {slide.eyebrow}
                </span>

                <h1 className="mt-7 text-5xl font-black leading-[.98] tracking-[-.055em] text-white sm:text-6xl lg:text-[5.25rem]">
                  {slide.title}
                  <br />
                  <span className="public-gradient-text">{slide.accent}</span>
                </h1>

                <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                  {slide.description}
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href={slide.primaryHref} className="public-btn-primary">
                    {slide.primary} <ArrowRight size={17} />
                  </Link>
                  <Link href={slide.secondaryHref} className="public-btn-secondary">
                    {slide.secondary}
                  </Link>
                </div>

                <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                  <div className="home-slide-panel">
                    <Icon size={19} className="text-cyan-300" />
                    <p className="mt-3 text-sm font-black text-white">{slide.stat}</p>
                  </div>
                  <div className="home-slide-panel">
                    <BookOpen size={19} className="text-cyan-300" />
                    <p className="mt-3 text-sm font-black text-white">Structured courses</p>
                  </div>
                  <div className="home-slide-panel">
                    <CheckCircle2 size={19} className="text-cyan-300" />
                    <p className="mt-3 text-sm font-black text-white">Progress & assessments</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      <button type="button" className="home-slider-arrow prev" onClick={() => move(-1)} aria-label="Previous slide">
        <ArrowLeft size={18} />
      </button>
      <button type="button" className="home-slider-arrow next" onClick={() => move(1)} aria-label="Next slide">
        <ArrowRight size={18} />
      </button>

      <div className="home-slider-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={"home-slider-dot " + (index === active ? "is-active" : "")}
            onClick={() => setActive(index)}
            aria-label={"Go to slide " + (index + 1)}
          />
        ))}
      </div>
    </section>
  );
}
