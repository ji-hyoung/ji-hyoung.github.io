(function () {
    class SliderManager {
        initMainVisual() {
            try {
                window.mainSlider = new Swiper('.mainVisual', {
                    slidesPerView: 'auto',
                    effect: 'fade',
                    fadeEffect: { crossFade: true },
                    speed: 500,
                    loop: true,
                    autoplay: { delay: 4000, disableOnInteraction: false },
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
                window.mainGallery = new Swiper('.mainGallery', {
                    slidesPerView: '3',
                    effect: 'slide',
                    speed: 600,
                    spaceBetween: 30,
                    loop: $('.mainGallery').find('.swiper-slide').length > 3,
                    autoplay: { delay: 4000, disableOnInteraction: false },
                    pagination: { el: '.swiperBtn.gall .paging', clickable: true },
                    navigation: { nextEl: '.swiperBtn.gall.next', prevEl: '.swiperBtn.gall.prev' }
                });
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
