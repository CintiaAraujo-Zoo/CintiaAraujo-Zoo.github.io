const CATEGORY_META = {
    research:    { icon: "fa-flask",              en: "Research",    pt: "Pesquisa" },
    publication: { icon: "fa-file-lines",         en: "Publication", pt: "Publicação" },
    award:       { icon: "fa-trophy",             en: "Award",       pt: "Premiação" },
    conference:  { icon: "fa-microphone-lines",   en: "Conference",  pt: "Evento" },
    teaching:    { icon: "fa-chalkboard-user",    en: "Teaching",    pt: "Ensino" },
    project:     { icon: "fa-code",                en: "Project",     pt: "Projeto" },
    outreach:    { icon: "fa-people-group",        en: "Outreach",    pt: "Extensão" },
    update:      { icon: "fa-bullhorn",            en: "Update",      pt: "Atualização" }
};

let allNews = [];
let activeNewsFilter = "all";

function currentLang() {
    return localStorage.getItem("lang") || "en";
}

function setLang(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent.toLowerCase() === lang);
    });

    document.querySelectorAll("[data-lang]").forEach(el => {
        el.classList.toggle("visible", el.dataset.lang === lang);
    });

    document.querySelectorAll(".nav-links a[data-en]").forEach(a => {
        a.textContent = lang === "en" ? a.dataset.en : a.dataset.pt;
    });

    localStorage.setItem("lang", lang);

    if (allNews.length) {
        updateNewsFilterLabels(lang);
    }
}

function safeText(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function safeUrl(url = "") {
    const trimmed = String(url).trim();
    if (!trimmed) return "";
    if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
    return "";
}

function formatDate(dateString, lang) {
    const date = new Date(`${dateString}T12:00:00`);
    if (Number.isNaN(date.getTime())) return safeText(dateString);

    return new Intl.DateTimeFormat(
        lang === "pt" ? "pt-BR" : "en-US",
        { year: "numeric", month: "short", day: "2-digit" }
    ).format(date);
}

function categoryMeta(category) {
    return CATEGORY_META[category] || CATEGORY_META.update;
}

function renderNewsCard(item) {
    const category = item.category || "update";
    const meta = categoryMeta(category);
    const isFeatured = item.featured === true;
    const image = item.image ? safeText(item.image) : "";
    const link = safeUrl(item.link);

    const media = image
        ? `<div class="news-media">
               <img src="${image}" alt="${safeText(item.image_alt_en || item.title_en || "News image")}" loading="lazy">
           </div>`
        : `<div class="news-badge">
               <i class="fa-solid ${safeText(item.icon || meta.icon)}"></i>
               <span class="news-badge-title">
                   <span data-lang="en" class="visible">${safeText(item.badge_en || meta.en)}</span>
                   <span data-lang="pt">${safeText(item.badge_pt || meta.pt)}</span>
               </span>
               ${(item.badge_sub_en || item.badge_sub_pt) ? `
               <span class="news-badge-subtitle">
                   <span data-lang="en" class="visible">${safeText(item.badge_sub_en || "")}</span>
                   <span data-lang="pt">${safeText(item.badge_sub_pt || "")}</span>
               </span>` : ""}
           </div>`;

    return `
        <article class="news-card${isFeatured ? " featured" : ""}" data-category="${safeText(category)}">
            ${media}
            <div class="news-body">
                <div class="news-topline">
                    <span class="news-category">
                        <i class="fa-solid ${safeText(meta.icon)}"></i>
                        <span data-lang="en" class="visible">${safeText(meta.en)}</span>
                        <span data-lang="pt">${safeText(meta.pt)}</span>
                    </span>
                    <span class="news-date">
                        <span data-lang="en" class="visible">${formatDate(item.date, "en")}</span>
                        <span data-lang="pt">${formatDate(item.date, "pt")}</span>
                    </span>
                </div>

                <h3 data-lang="en" class="visible">${safeText(item.title_en)}</h3>
                <h3 data-lang="pt">${safeText(item.title_pt || item.title_en)}</h3>

                ${item.location ? `
                <div class="news-location">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${safeText(item.location)}</span>
                </div>` : ""}

                <p data-lang="en" class="visible">${safeText(item.summary_en || "")}</p>
                <p data-lang="pt">${safeText(item.summary_pt || item.summary_en || "")}</p>

                ${link ? `
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="news-link">
                    <span data-lang="en" class="visible">${safeText(item.link_label_en || "Read more")}</span>
                    <span data-lang="pt">${safeText(item.link_label_pt || "Saiba mais")}</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </a>` : ""}
            </div>
        </article>
    `;
}

function renderNews(items) {
    const grid = document.getElementById("news-grid");
    if (!grid) return;

    if (!items.length) {
        grid.innerHTML = `
            <div class="news-empty">
                <span data-lang="en" class="visible">No updates in this category yet.</span>
                <span data-lang="pt">Ainda não há atualizações nesta categoria.</span>
            </div>
        `;
        setLang(currentLang());
        return;
    }

    grid.innerHTML = items.map(renderNewsCard).join("");
    setLang(currentLang());
    observeReveal(grid.querySelectorAll(".news-card"));
}

function renderNewsFilters() {
    const container = document.getElementById("news-filters");
    if (!container) return;

    const categories = [...new Set(allNews.map(item => item.category || "update"))];
    const filters = ["all", ...categories];

    container.innerHTML = filters.map(category => {
        if (category === "all") {
            return `
                <button class="news-filter active" type="button" data-filter="all" data-label-en="All" data-label-pt="Todos">
                    All
                </button>`;
        }

        const meta = categoryMeta(category);
        return `
            <button class="news-filter" type="button" data-filter="${safeText(category)}"
                    data-label-en="${safeText(meta.en)}" data-label-pt="${safeText(meta.pt)}">
                ${safeText(meta.en)}
            </button>`;
    }).join("");

    container.querySelectorAll(".news-filter").forEach(button => {
        button.addEventListener("click", () => {
            activeNewsFilter = button.dataset.filter;

            container.querySelectorAll(".news-filter").forEach(btn => {
                btn.classList.toggle("active", btn === button);
            });

            const filtered = activeNewsFilter === "all"
                ? allNews
                : allNews.filter(item => (item.category || "update") === activeNewsFilter);

            renderNews(filtered);
        });
    });

    updateNewsFilterLabels(currentLang());
}

function updateNewsFilterLabels(lang) {
    document.querySelectorAll(".news-filter").forEach(button => {
        button.textContent = lang === "pt"
            ? button.dataset.labelPt
            : button.dataset.labelEn;
    });
}

async function loadNews() {
    const grid = document.getElementById("news-grid");
    if (!grid) return;

    try {
        const response = await fetch("data/news.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        allNews = (Array.isArray(data) ? data : []).filter(item => item.published !== false);

        allNews.sort((a, b) => String(b.date).localeCompare(String(a.date)));

        renderNewsFilters();
        renderNews(allNews);
    } catch (error) {
        console.error("Could not load news.json:", error);
        grid.innerHTML = `
            <div class="news-error">
                <span data-lang="en" class="visible">The latest updates could not be loaded.</span>
                <span data-lang="pt">Não foi possível carregar as últimas atualizações.</span>
            </div>
        `;
        setLang(currentLang());
    }
}


function normalizeDoi(doi = "") {
    return String(doi)
        .trim()
        .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
        .replace(/^doi:\s*/i, "");
}

function renderPublication(item) {
    const doi = normalizeDoi(item.doi || "");
    const customUrl = safeUrl(item.url || "");
    const href = doi ? `https://doi.org/${encodeURI(doi)}` : customUrl;
    const linkText = doi
        ? `doi:${safeText(doi)}`
        : safeText(item.link_label || "View publication");

    return `
        <article class="pub-item">
            <div class="pub-title">${safeText(item.title || "")}</div>
            <div class="pub-authors">${safeText(item.authors || "")}</div>
            <div class="pub-journal">${safeText(item.journal || "")}</div>
            ${href ? `
            <a href="${href}" target="_blank" rel="noopener noreferrer" class="pub-doi">
                <i class="fa-solid fa-link"></i> ${linkText}
            </a>` : ""}
        </article>
    `;
}

function renderPublications(items) {
    const list = document.getElementById("pub-list");
    if (!list) return;

    if (!items.length) {
        list.innerHTML = `
            <div class="pub-status">
                <span data-lang="en" class="visible">No publications available yet.</span>
                <span data-lang="pt">Ainda não há publicações disponíveis.</span>
            </div>
        `;
        setLang(currentLang());
        return;
    }

    list.innerHTML = items.map(renderPublication).join("");
    setLang(currentLang());
    observeReveal(list.querySelectorAll(".pub-item"));
}

async function loadPublications() {
    const list = document.getElementById("pub-list");
    if (!list) return;

    try {
        const response = await fetch("data/publications.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const items = (Array.isArray(data) ? data : [])
            .filter(item => item.published !== false)
            .sort((a, b) => {
                const byYear = Number(b.year || 0) - Number(a.year || 0);
                if (byYear !== 0) return byYear;
                return String(a.title || "").localeCompare(String(b.title || ""));
            });

        renderPublications(items);
    } catch (error) {
        console.error("Could not load publications.json:", error);
        list.innerHTML = `
            <div class="pub-status">
                <span data-lang="en" class="visible">The publication list could not be loaded.</span>
                <span data-lang="pt">Não foi possível carregar a lista de publicações.</span>
            </div>
        `;
        setLang(currentLang());
    }
}

// Scroll reveal
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = "fadeUp 0.5s ease both";
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

function observeReveal(elements) {
    elements.forEach(el => {
        el.style.opacity = "0";
        observer.observe(el);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setLang(currentLang());

    observeReveal(document.querySelectorAll(".project-card"));
    loadNews();
    loadPublications();
});
