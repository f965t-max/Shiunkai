/* =========================================================
   志雲会 共通スクリプト  script.js
   - ハンバーガーメニュー（全ページ共通）
   - 3D カルーセル（自動回転 / ボタン / タッチスワイプ）
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initCarousel();
});

/* ---- モバイル用ハンバーガーメニュー ---- */
function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("navde");
    if (!toggle || !menu) return;

    const setState = (open) => {
        menu.classList.toggle("is-open", open);
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    };

    toggle.addEventListener("click", () => {
        setState(!menu.classList.contains("is-open"));
    });

    // メニュー内のリンクをタップしたら自動で閉じる
    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setState(false));
    });
}

/* ---- 3D カルーセル ---- */
function initCarousel() {
    const stage = document.querySelector(".carousel-stage");
    const viewport = document.querySelector(".carousel-viewport");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    // カルーセルが無いページ（katsudou など）では何もしない
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

    // ─── ボタン操作（PC 用。モバイルでは CSS で非表示） ───
    nextBtn?.addEventListener("click", () => { rotate(-1); startAuto(); });
    prevBtn?.addEventListener("click", () => { rotate(1); startAuto(); });

    // ─── PC: ホバー中は停止 ───
    viewport.addEventListener("mouseenter", stopAuto);
    viewport.addEventListener("mouseleave", startAuto);

    // ─── モバイル: タッチスワイプ ───
    const SWIPE_THRESHOLD = 40; // この距離(px)以上で 1 枚送る
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

        // 横移動が縦より大きい＝意図的な横スワイプのときだけ反応
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            rotate(dx < 0 ? -1 : 1); // 左スワイプ→次 / 右スワイプ→前
        }
        startAuto();
    }, { passive: true });

    // ─── 初期起動 ───
    startAuto();
}
