import type { Product } from "@/lib/shopify/types";
import React from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const HeroSlider = ({ products }: { products: Product[] }) => {
  return (
    <div className="hero-slider-wrapper rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-800/50">
      <Swiper
        pagination={{
          clickable: true,
          bulletClass: "banner-pagination-bullet",
          bulletActiveClass: "banner-pagination-bullet-active",
        }}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        effect={"fade"}
        modules={[Pagination, Autoplay, EffectFade]}
        className="h-[500px] md:h-[580px]"
      >
        {products?.map((item: Product) => {
          const category =
            (item as any).category || item.collections?.nodes?.[0]?.title;

          return (
            <SwiperSlide key={item.id}>
              <div className="relative h-full w-full flex items-center overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[70%] bg-primary/20 blur-[120px] rounded-full opacity-40"></div>
                  <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-zinc-800/50 blur-[100px] rounded-full opacity-30"></div>
                </div>

                <div className="container relative z-10 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full pb-8 md:pb-0">
                  {/* Content (Animated via active slide CSS) */}
                  <div className="animate-hero-text opacity-0">
                    {category && (
                      <span className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-4 md:mb-6">
                        {category}
                      </span>
                    )}

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 leading-[1.1] tracking-tight">
                      {item.title}
                    </h1>

                    <p className="text-base md:text-lg lg:text-xl text-zinc-400 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-4 md:gap-8 items-center">
                      <a
                        className="group flex items-center gap-2 md:gap-3 btn btn-primary px-6 py-3 md:px-10 md:py-5 text-base md:text-lg font-bold rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:translate-y-0"
                        href={`/products/${item.handle}`}
                      >
                        Comprar Ahora
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </a>

                      <div className="flex flex-col border-l-2 border-zinc-800 pl-4 md:pl-8 py-1">
                        <span className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                          Desde
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-white text-2xl md:text-3xl font-black">
                            {item.priceRange.minVariantPrice.amount}
                          </span>
                          <span className="text-primary text-lg md:text-xl font-bold">
                            €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Section */}
                  <div className="hidden lg:flex justify-center items-center animate-hero-image opacity-0">
                    <div className="relative group/img">
                      {/* Floating effects around the image */}
                      <div className="absolute -inset-10 bg-primary/10 blur-3xl rounded-full opacity-50 group-hover/img:opacity-80 transition-opacity"></div>

                      {item.featuredImage && (
                        <img
                          src={item.featuredImage.url}
                          className="relative z-10 w-full max-w-[450px] lg:max-w-[500px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)] transform hover:rotate-2 hover:scale-105 transition-all duration-700 ease-in-out pointer-events-none"
                          width={"600"}
                          height={"600"}
                          alt={item.title}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hero-slider-wrapper .swiper-pagination {
          bottom: 25px !important;
          margin-top: 0 !important;
        }
        .banner-pagination-bullet {
          background: rgba(255,255,255,0.2) !important;
          width: 8px !important;
          height: 8px !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          transition: all 0.3s ease !important;
        }
        .banner-pagination-bullet-active {
          background: #ff4d4d !important; /* Primary color */
          width: 24px !important;
          border-radius: 4px !important;
          opacity: 1 !important;
        }
      `,
        }}
      />
    </div>
  );
};

export default HeroSlider;
