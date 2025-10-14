export function initIndexPage() {
  // Lazy Instagram
  document.addEventListener('DOMContentLoaded', function () {
    const target = document.querySelector('.instagram-section');
    if (!target) return;
    const onVisible = () => {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(s);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          onVisible();
          io.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    io.observe(target);
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
