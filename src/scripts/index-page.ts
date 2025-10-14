export function initIndexPage() {
  // Lazy Instagram
  document.addEventListener('DOMContentLoaded', function () {
    const target = document.querySelector('.instagram-section');
    if (!target) return;
    const loadOnce = () => {
      // если уже загружен
      if ((window as any).instgrm || document.querySelector('script[src*="instagram.com/embed.js"]')) return;
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(s);
    };
    // IntersectionObserver
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            loadOnce();
            io.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      io.observe(target);
    } else {
      loadOnce();
    }
    // Фолбек: если пользователь не долистал, всё равно подгрузим через 3 сек
    setTimeout(loadOnce, 3000);
  });

  // Точное выравнивание геро-фото
  document.addEventListener('DOMContentLoaded', function(){
    const subtitle = document.querySelector('.hero .subtitle') as HTMLElement | null;
    const photo = document.querySelector('.hero-photo') as HTMLElement | null;
    if (!subtitle || !photo) return;
    const adjust = () => {
      if (window.innerWidth < 769) {
        photo.style.marginTop = '0px';
        return;
      }
      const subtitleTop = subtitle.getBoundingClientRect().top + window.scrollY;
      const heroTop = (photo.parentElement ? photo.parentElement.getBoundingClientRect().top + window.scrollY : 0);
      const delta = Math.max(0, subtitleTop - heroTop + 2);
      photo.style.marginTop = `${Math.round(delta)}px`;
    };
    adjust();
    window.addEventListener('resize', adjust);
  });
}
