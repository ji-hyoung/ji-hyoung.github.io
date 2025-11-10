(function () {
    const DATA_URL = './data/content.json';
    let contentPromise = null;
    // current gallery state
    let galleryItems = [];
    let galleryCurrentIndex = -1;

    function fetchContentData() {
        if (contentPromise) {
            return contentPromise;
        }

        contentPromise = fetch(DATA_URL, { cache: 'no-cache' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to load content.json');
                }
                return response.json();
            })
            .catch((error) => {
                console.error(error);
                if (window.CONTENT_DATA) {
                    return window.CONTENT_DATA;
                }
                return null;
            });

        return contentPromise;
    }

    function createPortfolioSlide(item) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide el';
        // data-index will be assigned by renderPortfolio when items array index is known

        const anchor = document.createElement('a');
        anchor.className = 'in';
        // if (item.link) {
        //     anchor.href = item.link;
        //     anchor.target = item.target || '_blank';
        //     anchor.rel = item.rel || 'noopener noreferrer';
        // }

        const imgWrap = document.createElement('div');
        imgWrap.className = 'img';

        const resize = document.createElement('div');
        resize.className = 'resize s1';

        const re = document.createElement('p');
        re.className = 're imgfix';

        const img = document.createElement('img');
        img.src = item.image;
        if (item.alt) {
            img.alt = item.alt;
        }

        re.appendChild(img);
        resize.appendChild(re);
        imgWrap.appendChild(resize);

        const content = document.createElement('div');
        content.className = 'con';

        const title = document.createElement('p');
        title.className = 'tt';
        title.textContent = item.title;

        content.appendChild(title);
        anchor.appendChild(imgWrap);
        anchor.appendChild(content);
        slide.appendChild(anchor);

        return slide;
    }

    function createSideProject(item) {
        const listItem = document.createElement('li');
        listItem.className = 'flex vc';

        const imageBox = document.createElement('p');
        imageBox.className = 'img';
        if (item.image) {
            imageBox.style.backgroundImage = `url(${item.image})`;
            imageBox.style.backgroundSize = item.backgroundSize || 'cover';
            imageBox.style.backgroundPosition = item.backgroundPosition || 'center';
            imageBox.setAttribute('role', 'presentation');
        }

        const textBox = document.createElement('div');
        textBox.className = 't_box';

        const title = document.createElement('p');
        title.className = 'tit';
        title.textContent = item.title;

        const description = document.createElement('p');
        description.className = 'txt';
        description.textContent = item.description;

        textBox.appendChild(title);
        textBox.appendChild(description);

        listItem.appendChild(imageBox);
        listItem.appendChild(textBox);

        return listItem;
    }

    function createSkill(item) {
        const listItem = document.createElement('li');

        const imageWrap = document.createElement('div');
        imageWrap.className = 'img';

        const resize = document.createElement('div');
        resize.className = 'resize';

        const re = document.createElement('div');
        re.className = 're imgfix round';

        const img = document.createElement('img');
        img.src = item.image;
        if (item.alt) {
            img.alt = item.alt;
        }

        re.appendChild(img);
        resize.appendChild(re);
        imageWrap.appendChild(resize);

        const content = document.createElement('div');
        content.className = 'con';

        const title = document.createElement('p');
        title.className = 't2';
        title.textContent = item.name;

        const graph = document.createElement('div');
        graph.className = `graph ${item.graphClass || ''}`.trim();

        const bar = document.createElement('span');
        bar.style.width = `${item.percentage}%`;
        bar.textContent = `${item.percentage}%`;

        graph.appendChild(bar);
        content.appendChild(title);
        content.appendChild(graph);

        listItem.appendChild(imageWrap);
        listItem.appendChild(content);

        return listItem;
    }

    function renderPortfolio(items) {
        const wrapper = document.querySelector('.mainGallery .swiper-wrapper');
        if (!wrapper) {
            return;
        }
        wrapper.innerHTML = '';
        items.forEach((item, idx) => {
            const slide = createPortfolioSlide(item);
            slide.dataset.index = String(idx);
            wrapper.appendChild(slide);
        });

        // cache items and attach handlers
        galleryItems = items || [];
        attachGalleryClickHandler(items);
    }

    function attachGalleryClickHandler(items) {
        const wrapper = document.querySelector('.mainGallery .swiper-wrapper');
        const modal = document.getElementById('galleryModal');
        if (!wrapper || !modal) return;

        // one-time delegation binding
        if (wrapper._hasGalleryHandler) return;
        wrapper._hasGalleryHandler = true;

        wrapper.addEventListener('click', function (e) {
            const el = e.target.closest('.swiper-slide');
            if (!el) return;
            const idx = parseInt(el.dataset.index, 10);
            if (Number.isNaN(idx)) return;
            openGalleryModalByIndex(idx);
        });

        // Close via data-action attribute (overlay, close button) and nav actions
        modal.addEventListener('click', function (e) {
            const act = e.target.getAttribute && e.target.getAttribute('data-action');
            if (!act) return;
            if (act === 'close') {
                closeGalleryModal();
            } else if (act === 'prev') {
                navigateGallery(-1);
            } else if (act === 'next') {
                navigateGallery(1);
            }
        });

        // Keyboard: ESC to close, arrows for prev/next when modal open
        document.addEventListener('keydown', function (e) {
            if (!modal.classList.contains('on')) return;
            if (e.key === 'Escape') {
                closeGalleryModal();
            } else if (e.key === 'ArrowLeft') {
                navigateGallery(-1);
            } else if (e.key === 'ArrowRight') {
                navigateGallery(1);
            }
        });
    }

    function openGalleryModalByIndex(idx) {
        if (!Array.isArray(galleryItems) || galleryItems.length === 0) return;
        const bounded = ((idx % galleryItems.length) + galleryItems.length) % galleryItems.length;
        galleryCurrentIndex = bounded;
        openGalleryModal(galleryItems[bounded]);
    }

    function navigateGallery(delta) {
        if (!Array.isArray(galleryItems) || galleryItems.length === 0) return;
        let next = galleryCurrentIndex + delta;
        next = ((next % galleryItems.length) + galleryItems.length) % galleryItems.length;
        openGalleryModalByIndex(next);
    }

    function openGalleryModal(item) {
        const modal = document.getElementById('galleryModal');
        if (!modal || !item) return;
        // try to set current index if item exists in cached items
        try {
            const idx = galleryItems.indexOf(item);
            if (idx >= 0) galleryCurrentIndex = idx;
        } catch (e) { /* ignore */ }
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('on');
        // populate
        const imgEl = modal.querySelector('.modalMedia .img img');
        const titleEl = modal.querySelector('.modalContent .t1');
        const linkEl = modal.querySelector('.modalLink');
        const infoEl = modal.querySelector('.modalContent .info');

        if (imgEl) {
            imgEl.src = item.image || '';
            imgEl.alt = item.alt || item.title || '';
        }
        if (titleEl) titleEl.textContent = item.title || '';
        if (linkEl) {
            if (item.link) {
                linkEl.href = item.link;
                linkEl.style.display = '';
            } else {
                linkEl.style.display = 'none';
            }
        }

        // populate info text if provided else hide
        if (infoEl) {
            infoEl.innerHTML = '';
            if (item.info && Array.isArray(item.info)) {
                item.info.forEach((p) => {
                    const el = document.createElement('p');
                    el.className = 'tt';
                    el.textContent = p;
                    infoEl.appendChild(el);
                });
            } else {
                // fallback placeholder
                const el = document.createElement('p');
                el.className = 'tt';
                el.textContent = item.description || '';
                infoEl.appendChild(el);
            }
        }

        // trap focus minimally: move focus to close button
        const closeBtn = modal.querySelector('.modalClose');
        if (closeBtn) closeBtn.focus();
    }

    function closeGalleryModal() {
        const modal = document.getElementById('galleryModal');
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('on');
    }

    function renderSideProjects(items) {
        const list = document.querySelector('.side_list');
        if (!list) {
            return;
        }
        list.innerHTML = '';
        items.forEach((item) => {
            list.appendChild(createSideProject(item));
        });
    }

    function renderSkills(items) {
        const list = document.querySelector('.skill_list');
        if (!list) {
            return;
        }
        list.innerHTML = '';
        items.forEach((item) => {
            list.appendChild(createSkill(item));
        });
    }

    async function loadContent() {
        const data = await fetchContentData();
        if (!data) {
            return null;
        }

        if (Array.isArray(data.portfolioItems)) {
            renderPortfolio(data.portfolioItems);
        }

        if (Array.isArray(data.sideProjects)) {
            renderSideProjects(data.sideProjects);
        }

        if (Array.isArray(data.skills)) {
            renderSkills(data.skills);
        }

        document.dispatchEvent(new CustomEvent('content:ready', { detail: data }));
        return data;
    }

    window.ContentManager = {
        loadContent: loadContent
    };
})();
