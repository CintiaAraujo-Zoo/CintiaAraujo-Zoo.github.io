function setLang(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
    });
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.classList.toggle('visible', el.dataset.lang === lang);
    });
    document.querySelectorAll('.nav-links a[data-en]').forEach(a => {
        a.textContent = lang === 'en' ? a.dataset.en : a.dataset.pt;
    });
    localStorage.setItem('lang', lang);
}

const saved = localStorage.getItem('lang') || 'en';
setLang(saved);

// Scroll-reveal
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.animation = 'fadeUp 0.5s ease both';
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .news-card, .pub-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});
