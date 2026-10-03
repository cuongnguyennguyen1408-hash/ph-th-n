import React from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { Handshake, Globe, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface PartnerSectionProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
}

export const PartnerSection: React.FC<PartnerSectionProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
}) => {
  const t = translations[lang].partners;

  return (
    <div className="py-12 sm:py-16 bg-[#FFF8E9] min-h-screen text-[#123C2E]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#65452F] mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#123C2E] transition-colors cursor-pointer"
          >
            {translations[lang].nav.home}
          </button>
          <span>/</span>
          <span className="text-[#123C2E] font-bold">{translations[lang].nav.partners}</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#123C2E]/10 border border-[#B88932]/40 text-[#123C2E] text-xs font-semibold uppercase tracking-wider mb-3">
            <Handshake className="w-4 h-4 text-[#A52B25]" />
            <span>Hợp Tác Chiến Lược</span>
          </div>
          <h1
            onClick={onHeadingClick}
            className="text-3xl sm:text-4xl font-serif font-black text-[#123C2E] cursor-pointer hover:opacity-95"
          >
            {t.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#65452F]">
            {t.subtitle}
          </p>
        </div>

        {/* Featured Collaboration Card */}
        <div className="bg-[#F4E8D2] border border-[#B88932]/40 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden mb-12 text-[#123C2E]">
          {/* Subtle watermark */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none text-9xl font-black font-serif text-[#123C2E]">
            1955
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Visual Brand Lockup with Heritage Background Illustration */}
            <div className="md:col-span-5 relative rounded-xl overflow-hidden border-2 border-[#D6A84F] shadow-lg flex flex-col justify-end min-h-[290px] sm:min-h-[310px] md:min-h-[330px] bg-[#FFF8E9] group">
              {/* Background Illustration / Photo */}
              <img
                src="/src/assets/images/regenerated_image_1790962400224.webp"
                alt="Lễ công bố hợp tác và ra mắt Phở Story - Phở Thìn Bờ Hồ & Chin-su Masan"
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Semi-transparent warm cream overlay & gradient to blend with website palette and ensure logo legibility */}
              <div className="absolute inset-0 bg-[#FFF8E9]/15 mix-blend-overlay pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8E9] via-[#FFF8E9]/85 to-transparent pointer-events-none" />

              {/* Logos & Subtitle Overlay at the bottom */}
              <div className="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center gap-3.5 sm:gap-4 mb-2.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#A52B25] border-2 border-[#D6A84F] flex flex-col items-center justify-center text-[#FFF8E9] font-serif font-bold text-xs p-1 shadow-md hover:scale-105 transition-transform shrink-0">
                    <span>PHỞ THÌN</span>
                    <span className="text-[9px] text-[#F4E8D2] tracking-wider">BỜ HỒ</span>
                    <span className="text-[8px] text-[#D6A84F]">1955</span>
                  </div>
                  <span className="text-xl font-bold text-[#65452F] drop-shadow-xs">✕</span>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 border-2 border-white flex flex-col items-center justify-center text-white font-black text-xs p-1 shadow-md hover:scale-105 transition-transform shrink-0">
                    <span>CHIN-SU</span>
                    <span className="text-[8px] uppercase tracking-tighter">MASAN</span>
                  </div>
                </div>

                <span className="text-sm sm:text-base font-serif font-bold text-[#123C2E] block drop-shadow-xs">
                  Dự Án "Phở Story"
                </span>
                <span className="text-xs text-[#65452F] font-medium mt-0.5 block">
                  - Chuẩn vị phở bò thanh trong Bờ Hồ
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-7 space-y-4">
              <h2
                onClick={onHeadingClick}
                className="text-xl sm:text-2xl font-serif font-bold text-[#123C2E] hover:text-[#A52B25] cursor-pointer"
              >
                {t.projectTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#3A281E] leading-relaxed">
                {t.desc1}
              </p>
              <p className="text-xs sm:text-sm text-[#3A281E] leading-relaxed">
                {t.desc2}
              </p>

              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#123C2E] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#A52B25] shrink-0" />
                  <span>{t.highlightQuality}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#123C2E] font-medium">
                  <Globe className="w-4 h-4 text-[#A52B25] shrink-0" />
                  <span>{t.highlightReach}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA to Reserve Table or View Menu */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-[#65452F] mb-4">
            {lang === 'vi'
              ? 'Để trải nghiệm trọn vẹn bát phở nóng hổi vừa bốc khói tại chỗ, kính mời quý khách ghé thăm 4 cơ sở chính thức:'
              : 'To experience steaming hot bowls prepared fresh at our hearth, we welcome you to our 4 official branches:'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('menu')}
              className="px-6 py-2.5 bg-[#FFF8E9] border border-[#B88932]/40 text-[#123C2E] hover:bg-[#123C2E] hover:text-[#FFF8E9] rounded-lg text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors shadow-sm"
            >
              {translations[lang].nav.menu}
            </button>
            <button
              onClick={() => onNavigate('reservation')}
              className="px-6 py-2.5 bg-[#D6A84F] text-[#123C2E] hover:bg-[#B88932] hover:text-[#FFF8E9] rounded-lg text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors shadow-md"
            >
              {translations[lang].nav.reserve}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
