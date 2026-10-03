import React, { useState, useEffect } from 'react';
import { Language, Dish, PageView } from '../types';
import { adminStore, AdminDish } from '../services/adminStore';
import { translations } from '../data/translations';
import { Award, ArrowRight, Sparkles } from 'lucide-react';

interface MenuSectionProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onSelectDish: (dish: Dish) => void;
  onHeadingClick: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  lang,
  onNavigate,
  onSelectDish,
  onHeadingClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pho' | 'drinks' | 'others'>('all');
  const [dishesList, setDishesList] = useState<AdminDish[]>(() => adminStore.getDishes());

  useEffect(() => {
    const handleUpdate = () => {
      setDishesList([...adminStore.getDishes()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  const t = translations[lang].menu;

  const phoDishes = dishesList.filter((d) => d.category === 'pho');
  const drinkDishes = dishesList.filter((d) => d.category === 'drinks');
  const otherDishes = dishesList.filter((d) => d.category === 'others');

  const categories = [
    { key: 'all', label: t.tabAll, count: dishesList.length },
    { key: 'pho', label: t.tabPho, count: phoDishes.length },
    { key: 'drinks', label: t.tabDrinks, count: drinkDishes.length },
    { key: 'others', label: t.tabOthers, count: otherDishes.length },
  ] as const;

  return (
    <div className="py-10 sm:py-16 bg-[#FFF8E9] min-h-screen text-[#123C2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb: Trang chủ / Thực đơn */}
        <div className="flex items-center gap-2 text-xs text-[#65452F] mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#123C2E] transition-colors cursor-pointer"
          >
            {t.breadcrumbHome}
          </button>
          <span>/</span>
          <span className="text-[#123C2E] font-bold">{t.breadcrumbMenu}</span>
        </div>

        {/* Big Banner "Thực Đơn" - Deep forest green & gold */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B2E24] via-[#123C2E] to-[#0B2E24] border border-[#B88932]/40 p-8 sm:p-12 mb-12 shadow-xl text-center text-[#FFF8E9]">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0B2E24]/60 border border-[#B88932] text-[#D6A84F] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span>❖ Gia Truyền Từ 1955 ❖</span>
            </span>
            <h1
              onClick={onHeadingClick}
              className="text-3xl sm:text-5xl font-serif font-black text-[#D6A84F] text-gold-radiant cursor-pointer hover:opacity-95 transition-opacity"
              title="Bấm vào tiêu đề để xem cảnh báo"
            >
              {t.bannerTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#F4E8D2]">
              {t.bannerSub}
            </p>
          </div>
          {/* Subtle amber watermark in background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D6A84F_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((c) => {
            const isActive = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#123C2E] text-[#F4E8D2] border border-[#B88932]/40 shadow-md scale-102'
                    : 'bg-[#F4E8D2] text-[#123C2E] hover:text-[#0B2E24] hover:bg-[#FFF8E9] border border-[#B88932]/35 shadow-xs'
                }`}
              >
                {c.label} ({c.count})
              </button>
            );
          })}
        </div>

        {/* 3 Sequential Groups: Phở -> Đồ uống -> Khác */}
        <div className="space-y-16">
          {/* GROUP 1: PHỞ TRUYỀN THỐNG */}
          {(selectedCategory === 'all' || selectedCategory === 'pho') && (
            <section id="section-pho" className="scroll-mt-24">
              <div className="border-b border-[#B88932]/30 pb-3 mb-8 flex items-baseline justify-between">
                <h2
                  onClick={onHeadingClick}
                  className="text-2xl sm:text-3xl font-serif font-bold text-[#123C2E] cursor-pointer hover:text-[#0B2E24]"
                  title="Bấm để xem cảnh báo"
                >
                  {t.tabPho}
                </h2>
                <span className="text-xs text-[#65452F]">
                  {phoDishes.length} {lang === 'vi' ? 'món phở' : 'dishes'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phoDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => onSelectDish(dish)}
                    className="group bg-[#F4E8D2]/80 border border-[#B88932]/35 hover:border-[#D6A84F] rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl shadow-xs"
                  >
                    <div>
                      {/* Dish Photo */}
                      <div className="relative aspect-16/10 overflow-hidden bg-[#F4E8D2]">
                        <img
                          src={dish.image}
                          alt={dish.name[lang]}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E24]/60 via-transparent to-transparent opacity-60" />

                        {/* SIGNATURE badge strictly for Phở tái chín */}
                        {dish.isSignature && (
                          <div className="absolute top-3 left-3 bg-[#A52B25] text-[#F4E8D2] font-black text-[11px] px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-[#D6A84F]" />
                            <span>{t.signatureBadge}</span>
                          </div>
                        )}

                        {/* OUT OF STOCK badge if toggled by admin */}
                        {dish.isAvailable === false && (
                          <div className="absolute top-3 right-3 bg-neutral-900/90 text-amber-200 border border-amber-500/50 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                            Tạm hết hôm nay
                          </div>
                        )}

                        <div className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded bg-[#FFF8E9]/95 border border-[#B88932]/40 text-sm font-mono font-bold text-[#A52B25] shadow-xs">
                          {dish.formattedPrice} {t.vnd}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-serif font-bold text-[#123C2E] group-hover:text-[#A52B25] transition-colors leading-snug">
                          {dish.name[lang]}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-[#3A281E] line-clamp-3 leading-relaxed">
                          {dish.shortDescription[lang]}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-[#B88932]/20 flex items-center justify-between text-xs text-[#123C2E] font-bold group-hover:text-[#A52B25]">
                        <span>{t.viewDetail}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* GROUP 2: ĐỒ UỐNG HÀ NỘI */}
          {(selectedCategory === 'all' || selectedCategory === 'drinks') && (
            <section id="section-drinks" className="scroll-mt-24">
              <div className="border-b border-[#B88932]/30 pb-3 mb-8 flex items-baseline justify-between">
                <h2
                  onClick={onHeadingClick}
                  className="text-2xl sm:text-3xl font-serif font-bold text-[#123C2E] cursor-pointer hover:text-[#0B2E24]"
                  title="Bấm để xem cảnh báo"
                >
                  {t.tabDrinks}
                </h2>
                <span className="text-xs text-[#65452F]">
                  {drinkDishes.length} {lang === 'vi' ? 'đồ uống' : 'drinks'}
                </span>
              </div>

              {/* Compact cards for auxiliary items */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {drinkDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => onSelectDish(dish)}
                    className="group bg-[#F4E8D2]/80 border border-[#B88932]/35 hover:border-[#D6A84F] rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-xs"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#F4E8D2]">
                      <img
                        src={dish.image}
                        alt={dish.name[lang]}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#FFF8E9]/95 border border-[#B88932]/40 text-xs font-mono font-bold text-[#A52B25] shadow-xs">
                        {dish.formattedPrice} {t.vnd}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-xs sm:text-sm font-serif font-bold text-[#123C2E] group-hover:text-[#A52B25] line-clamp-1 transition-colors">
                        {dish.name[lang]}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#3A281E] line-clamp-2">
                        {dish.shortDescription[lang]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* GROUP 3: MÓN ĂN KÈM & KHÁC */}
          {(selectedCategory === 'all' || selectedCategory === 'others') && (
            <section id="section-others" className="scroll-mt-24">
              <div className="border-b border-[#B88932]/30 pb-3 mb-8 flex items-baseline justify-between">
                <h2
                  onClick={onHeadingClick}
                  className="text-2xl sm:text-3xl font-serif font-bold text-[#123C2E] cursor-pointer hover:text-[#0B2E24]"
                  title="Bấm để xem cảnh báo"
                >
                  {t.tabOthers}
                </h2>
                <span className="text-xs text-[#65452F]">
                  {otherDishes.length} {lang === 'vi' ? 'món ăn kèm' : 'side items'}
                </span>
              </div>

              {/* Compact cards for quẩy, bánh mì, trứng chần */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {otherDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => onSelectDish(dish)}
                    className="group bg-[#F4E8D2]/80 border border-[#B88932]/35 hover:border-[#D6A84F] rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-xs"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-[#F4E8D2]">
                      <img
                        src={dish.image}
                        alt={dish.name[lang]}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#FFF8E9]/95 border border-[#B88932]/40 text-xs font-mono font-bold text-[#A52B25] shadow-xs">
                        {dish.formattedPrice} {t.vnd}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-serif font-bold text-[#123C2E] group-hover:text-[#A52B25] transition-colors">
                        {dish.name[lang]}
                      </h3>
                      <p className="mt-1 text-xs text-[#3A281E] line-clamp-2">
                        {dish.shortDescription[lang]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
