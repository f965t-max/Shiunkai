/* =========================================================
   志雲会 共通スクリプト  script.js
   3D カルーセル（自動回転 / ボタン / タッチスワイプ）
   ※ カルーセルが無いページでは何もしない
   ========================================================= */

   document.addEventListener("DOMContentLoaded", () => {
    const stage = document.querySelector(".carousel-stage");
    const viewport = document.querySelector(".carousel-viewport");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    // カルーセルが無いページ（katsudou など）では処理を止める
    if (!stage || !viewport) return;

    const STEP = 90;        // 1 枚分の回転角
    const INTERVAL = 4000;  // 自動回転の間隔(ms)
    let angle = 0;
    let autoTimer = null;

    const render = () => {
        stage.style.transform = `rotateY(${angle}deg)`;
    };

    // dir: -1 = 次へ（時計回り） / +1 = 前へ
    const rotate = (dir) => {
        angle += dir * STEP;
        render();
    };

    const startAuto = () => {
        stopAuto();
        autoTimer = setInterval(() => rotate(-1), INTERVAL);
    };

    const stopAuto = () => {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
    };

    // ─── ボタン操作 ───
    nextBtn?.addEventListener("click", () => { rotate(-1); startAuto(); });
    prevBtn?.addEventListener("click", () => { rotate(1); startAuto(); });

    // ─── PC: ホバー中は停止 ───
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
            rotate(dx < 0 ? -1 : 1); // 左へスワイプ→次 / 右へスワイプ→前
        }
        startAuto();
    }, { passive: true });

    // ─── 初期起動 ───
    startAuto();
});

const menuBtn = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

/* =========================================================
   スクロール連動型アニメーション（Intersection Observer）
   ========================================================= */
   document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 画面内に入ったら active クラスをつけて動かす
                entry.target.classList.add("active");
                // 一度表示されたら監視を解除（何度もパタパタ動かさない場合）
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // ブラウザの画面全体を基準にする
        rootMargin: "0px 0px -15% 0px", // 画面の下側から15%入ったところで発動
        threshold: 0 // 要素が1pxでも入ったら反応
    });

    revealElements.forEach(el => revealObserver.observe(el));
});