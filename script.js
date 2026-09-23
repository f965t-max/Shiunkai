/* =========================================================
   志雲会 共通スクリプト  script.js
   2D カルーセル（自動回転 / ボタン / タッチスワイプ）
   ========================================================= */

   document.addEventListener("DOMContentLoaded", () => {
    const stage = document.querySelector(".carousel-stage");
    const viewport = document.querySelector(".carousel-viewport");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const originalCards = Array.from(document.querySelectorAll(".carousel-card"));

    // カルーセルが無いページ（katsudou など）では処理をスキップ
    if (!stage || !viewport || originalCards.length === 0) return;

    const INTERVAL = 4000;  // 自動回転の間隔(ms)
    const totalCards = originalCards.length;

    // 両端にクローンを追加して、ループ時も同方向にスライドし続ける
    const firstClone = originalCards[0].cloneNode(true);
    const lastClone = originalCards[totalCards - 1].cloneNode(true);
    [firstClone, lastClone].forEach((clone) => {
        clone.removeAttribute("id");
        clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;
    });
    stage.insertBefore(lastClone, originalCards[0]);
    stage.appendChild(firstClone);

    let currentIndex = 1; // 先頭の本物カードから開始
    let isAnimating = false;
    let autoTimer = null;

    const setTransition = (enabled) => {
        stage.style.transition = enabled ? "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)" : "none";
    };

    const syncCardWidth = () => {
        const stageStyles = window.getComputedStyle(stage);
        const sidePadding = parseFloat(stageStyles.paddingLeft) || 0;
        const cardWidth = Math.max(0, viewport.getBoundingClientRect().width - sidePadding * 2);
        stage.style.setProperty("--carousel-card-width", `${cardWidth}px`);
    };

    const getSlideWidth = () => {
        const card = stage.querySelector(".carousel-card");
        if (!card) return viewport.getBoundingClientRect().width;

        const cardWidth = card.getBoundingClientRect().width;
        const stageStyles = window.getComputedStyle(stage);
        const gap = parseFloat(stageStyles.columnGap || stageStyles.gap) || 0;
        return cardWidth + gap;
    };

    const updateCarousel = () => {
        syncCardWidth();
        const slideWidth = getSlideWidth();
        stage.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
        stage.querySelectorAll(".carousel-card").forEach((card, index) => {
            card.style.pointerEvents = index === currentIndex ? "auto" : "none";
            card.classList.toggle("is-active", index === currentIndex);
        });
    };

    const resetLoopPosition = () => {
        if (currentIndex === 0) {
            setTransition(false);
            currentIndex = totalCards;
            updateCarousel();
            stage.offsetHeight;
            setTransition(true);
        } else if (currentIndex === totalCards + 1) {
            setTransition(false);
            currentIndex = 1;
            updateCarousel();
            stage.offsetHeight;
            setTransition(true);
        }
    };

    stage.addEventListener("transitionend", (e) => {
        if (e.target !== stage || e.propertyName !== "transform") return;
        isAnimating = false;
        resetLoopPosition();
    });

    const moveSlide = (direction) => {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex += direction;
        updateCarousel();
    };

    const nextSlide = () => moveSlide(1);
    const prevSlide = () => moveSlide(-1);

    // 初期位置（アニメーションなし）
    setTransition(false);
    updateCarousel();
    stage.offsetHeight;
    setTransition(true);

    // ─── 自動再生の制御 ───
    const startAuto = () => {
        stopAuto();
        autoTimer = setInterval(nextSlide, INTERVAL);
    };

    const stopAuto = () => {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
    };

    // ─── ボタン操作 ───
    nextBtn?.addEventListener("click", () => {
        nextSlide();
        startAuto(); // クリックされたらタイマーをリセット
    });

    prevBtn?.addEventListener("click", () => {
        prevSlide();
        startAuto(); // クリックされたらタイマーをリセット
    });

    // ─── PC: ホバー中は自動再生を停止 ───
    viewport.addEventListener("mouseenter", stopAuto);
    viewport.addEventListener("mouseleave", startAuto);

    // ─── モバイル: タッチスワイプ ───
    const SWIPE_THRESHOLD = 40; // この距離(px)以上で1枚送る
    let startX = 0;
    let startY = 0;
    let tracking = false;

    viewport.addEventListener("touchstart", (e) => {
        stopAuto();
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
    }, { passive: true });

    viewport.addEventListener("touchend", (e) => {
        if (!tracking) return;
        tracking = false;

        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;

        // 横方向の移動が縦より大きい＝意図的な横スワイプのときだけ反応
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            if (dx < 0) {
                nextSlide(); // 左へスワイプ → 次へ
            } else {
                prevSlide(); // 右へスワイプ → 前へ
            }
        }
        startAuto();
    }, { passive: true });

    // ─── 初期起動 ───
    startAuto();
    window.addEventListener("resize", () => {
        setTransition(false);
        updateCarousel();
        stage.offsetHeight;
        setTransition(true);
    });
});


/* =========================================================
   スマホ用ナビゲーションメニュー
   ========================================================= */
const menuBtn = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuBtn.classList.toggle('active');
        const expanded = menuBtn.classList.contains('active');
        menuBtn.setAttribute('aria-expanded', expanded);
    });
}


/* =========================================================
   スクロール連動型アニメーション（Intersection Observer）
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // 一度表示されたら監視を解除
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -15% 0px", // 画面の下側から15%入ったところで発動
        threshold: 0
    });

    revealElements.forEach(el => revealObserver.observe(el));
});


document.getElementById('back-to-top').addEventListener('click', function(e) {
    e.preventDefault(); // href="#" による瞬時の移動をキャンセル
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // スムーズにスクロールさせる
    });
});