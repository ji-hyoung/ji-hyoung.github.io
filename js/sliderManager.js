(function () {
    class SliderManager {
        constructor() {
            this.reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
            if (this.reduceMotionQuery) {
                const listener = (event) => this.handleMotionPreferenceChange(event.matches);
                if (this.reduceMotionQuery.addEventListener) {
                    this.reduceMotionQuery.addEventListener('change', listener);
                } else if (this.reduceMotionQuery.addListener) {
                    this.reduceMotionQuery.addListener(listener);
                }
            }
        }

        prefersReducedMotion() {
            return Boolean(this.reduceMotionQuery && this.reduceMotionQuery.matches);
        }

        handleMotionPreferenceChange(matches) {
            if (matches) {
                if (window.mainSlider && window.mainSlider.autoplay) {
                    window.mainSlider.autoplay.stop();
                }
                if (window.mainSlider && window.mainSlider.params) {
                    window.mainSlider.params.autoplay = false;
                }
                if (window.mainGallery && window.mainGallery.autoplay) {
                    window.mainGallery.autoplay.stop();
                }
                if (window.mainGallery && window.mainGallery.params) {
                    window.mainGallery.params.autoplay = false;
                }
            } else {
                if (window.mainSlider && window.mainSlider.params) {
                    window.mainSlider.params.autoplay = { delay: 4000, disableOnInteraction: false };
                    if (window.mainSlider.autoplay) {
                        window.mainSlider.autoplay.start();
                    }
                }
                if (window.mainGallery && window.mainGallery.params) {
                    window.mainGallery.params.autoplay = { delay: 4000, disableOnInteraction: false };
                    if (window.mainGallery.autoplay) {
                        window.mainGallery.autoplay.start();
                    }
                }
            }
        }

        initMainVisual() {
            try {
                const reduceMotion = this.prefersReducedMotion();
                window.mainSlider = new Swiper('.mainVisual', {
                    slidesPerView: 'auto',
                    effect: 'fade',
                    fadeEffect: { crossFade: true },
                    speed: reduceMotion ? 0 : 500,
                    loop: true,
                    autoplay: reduceMotion ? false : { delay: 4000, disableOnInteraction: false },
                    pagination: { el: '.swiperBtn.visual .paging', clickable: true },
                    navigation: { nextEl: '.swiperBtn.visual.next', prevEl: '.swiperBtn.visual.prev' }
                });

                $('.swiperBtn.visual.pause').click(function () {
                    $(this).parent('.swiperPauseWrap').addClass('pause');
                    document.querySelector('.mainVisual').swiper.autoplay.stop();
                });
                $('.swiperBtn.visual.play').click(function () {
                    $(this).parent('.swiperPauseWrap').removeClass('pause');
                    document.querySelector('.mainVisual').swiper.autoplay.start();
                });
                if (reduceMotion && window.mainSlider && window.mainSlider.autoplay) {
                    window.mainSlider.autoplay.stop();
                }
            } catch (e) {
                console.warn('Swiper init failed:', e);
            }
        }

        initMainGalleryOnLoad() {
            $('.mainGallery').css('opacity', 0);
            const startGallery = () => {
                if (window.mainGallery && typeof window.mainGallery.destroy === 'function') {
                    window.mainGallery.destroy(true, true);
                }

                $('.mainGallery').css('opacity', 1);
                const reduceMotion = this.prefersReducedMotion();
                window.mainGallery = new Swiper('.mainGallery', {
                    // 기본적으로 데스크탑에서 3개 보이도록 설정
                    slidesPerView: 3,
                    effect: 'slide',
                    speed: reduceMotion ? 0 : 600,
                    // 화면 크기에 따라 간격/보이는 수를 조절하려면 breakpoints 사용
                    spaceBetween: 30,
                    breakpoints: {
                        // 0~500: 1개
                        0: {
                            slidesPerView: 1,
                            spaceBetween: 10
                        },
                        // 501~1024: 2개
                        501: {
                            slidesPerView: 2,
                            spaceBetween: 20
                        },
                        // 1025 이상: 3개
                        1025: {
                            slidesPerView: 3,
                            spaceBetween: 30
                        }
                    },
                    loop: $('.mainGallery').find('.swiper-slide').length > 3,
                    autoplay: reduceMotion ? false : { delay: 4000, disableOnInteraction: false },
                    pagination: { el: '.swiperBtn.gall .paging', clickable: true },
                    navigation: { nextEl: '.swiperBtn.gall.next', prevEl: '.swiperBtn.gall.prev' }
                });
                if (reduceMotion && window.mainGallery && window.mainGallery.autoplay) {
                    window.mainGallery.autoplay.stop();
                }
            };

            if (document.readyState === 'complete') {
                startGallery();
            } else {
                $(window).on('load', startGallery);
            }
        }
    }

    window.SliderManager = SliderManager;
})();
