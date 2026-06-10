/* =========================================================
   志雲会 共通スクリプト  script.js
   2D カルーセル（自動回転 / ボタン / タッチスワイプ）
   ========================================================= */

   document.addEventListener("DOMContentLoaded", () => {
    const stage = document.querySelector(".carousel-stage");
    const viewport = document.querySelector(".carousel-viewport");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const cards = document.querySelectorAll(".carousel-card");

    // カルーセルが無いページ（katsudou など）では処理をスキップ
    if (!stage || !viewport || cards.length === 0) return;

    const INTERVAL = 4000;  // 自動回転の間隔(ms)
    let currentIndex = 0;
    const totalCards = cards.length;
    let autoTimer = null;

    // ─── スライド位置を更新する関数 ───
    const updateCarousel = () => {
        // カード1枚分の幅（100%）× インデックス分だけ左にずらす
        const offset = -currentIndex * 100;
        stage.style.transform = `translateX(${offset}%)`;
    };

    // ─── インデックス操作 ───
    const nextSlide = () => {
        if (currentIndex < totalCards - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // 最後のカードなら最初に戻る
        }
        updateCarousel();
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalCards - 1; // 最初のカードなら最後に行く
        }
        updateCarousel();
    };

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
});


/* =========================================================
   スマホ用ナビゲーションメニュー
   ========================================================= */
const menuBtn = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
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