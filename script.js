(() => {
  'use strict';

  const photos = [
    { src: './assets/IMG_7852.jpg', title: 'Урлагийн дунд', alt: 'Баримал сонирхон зогсож буй Билгүүндарь' },
    { src: './assets/IMG_7853.jpg', title: 'Чиний харж буй ертөнц', alt: 'Үзэсгэлэнгийн дүрсийг утсаараа буулгаж буй нь' },
    { src: './assets/IMG_7854.jpg', title: 'Инээмсэглэх шалтгаан', alt: 'Улаан даашинзтай инээмсэглэж буй Билгүүндарь' },
    { src: './assets/IMG_7855.jpg', title: 'Өнгө нэмсэн агшин', alt: 'Ягаан гэрэлтэй орчинд инээмсэглэн суугаа нь' },
    { src: './assets/IMG_7856.jpg', title: 'Зүгээр л, чи', alt: 'Билгүүндарийн инээмсэглэсэн хөрөг' },
  ];
  const letterDialog = document.querySelector('#letter-dialog');
  const photoDialog = document.querySelector('#photo-dialog');
  const lightboxImage = document.querySelector('#lightbox-image');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activePhoto = 0;
  let lastTrigger = null;

  function openDialog(dialog, trigger) {
    lastTrigger = trigger;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
  }

  [letterDialog, photoDialog].forEach((dialog) => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      lastTrigger?.focus({ preventScroll: true });
    });
  });

  document.querySelectorAll('[data-open-letter]').forEach((button) => {
    button.addEventListener('click', () => openDialog(letterDialog, button));
  });

  function renderPhoto(index) {
    activePhoto = (index + photos.length) % photos.length;
    const photo = photos[activePhoto];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    document.querySelector('#lightbox-caption').textContent = photo.title;
    document.querySelector('#lightbox-count').textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  }

  document.querySelectorAll('[data-photo]').forEach((button) => {
    button.addEventListener('click', () => {
      renderPhoto(Number(button.dataset.photo));
      openDialog(photoDialog, button);
    });
  });
  document.querySelector('#previous-photo').addEventListener('click', () => renderPhoto(activePhoto - 1));
  document.querySelector('#next-photo').addEventListener('click', () => renderPhoto(activePhoto + 1));
  photoDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      renderPhoto(activePhoto + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });

  let touchStart = null;
  lightboxImage.addEventListener('touchstart', (event) => {
    touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }, { passive: true });
  lightboxImage.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) renderPhoto(activePhoto + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  lightboxImage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('waiting');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('waiting');
      observer.observe(element);
    });
  }

  const wishes = [
    'Чиний инээмсэглэл чамд хамгийн гоё зохидог. ♡',
    'Өнөөдөр чамд нэг сайхан зүйл тохиолдоосой. ✳',
    'Энэ жижигхэн булан үргэлж чинийх. ♡',
    'Чамтай танилцсандаа баяртай байна, Билгүүндарь. ♡',
  ];
  let wishIndex = 0;
  let lastBurst = 0;
  const smileButton = document.querySelector('#smile-button');
  smileButton.addEventListener('click', () => {
    document.querySelector('#smile-message').textContent = wishes[wishIndex++ % wishes.length];
    if (reducedMotion.matches || Date.now() - lastBurst < 400) return;
    lastBurst = Date.now();
    const bounds = smileButton.getBoundingClientRect();
    const layer = document.querySelector('#heart-particles');
    for (let i = 0; i < 18; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'heart-particle';
      particle.textContent = i % 4 === 0 ? '✳' : '♡';
      particle.style.setProperty('--x', `${bounds.left + bounds.width / 2}px`);
      particle.style.setProperty('--y', `${bounds.top + bounds.height / 2}px`);
      particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 300}px`);
      particle.style.setProperty('--dy', `${-75 - Math.random() * 200}px`);
      particle.style.setProperty('--size', `${14 + Math.random() * 18}px`);
      particle.style.setProperty('--rotation', `${(Math.random() - 0.5) * 100}deg`);
      particle.style.setProperty('--color', ['#8b3b4b', '#b67986', '#c39275'][i % 3]);
      layer.append(particle);
      window.setTimeout(() => particle.remove(), 1700);
    }
  });
})();
