(function () {
  'use strict';
  try {
    var lang = localStorage.getItem('lang') || 'ar';
    var isEn = lang === 'en';

    // Page title
    document.title = isEn ? 'PRISMA' : 'بريزما';

    // Splash screen
    var splashTitle = document.getElementById('splash-title');
    var splashSub = document.getElementById('splash-sub');
    if (splashTitle) splashTitle.textContent = isEn ? 'PRISMA' : 'بريزما';
    if (splashSub) splashSub.textContent = isEn ? 'Loading platform...' : 'جاري تحميل المنصة...';
  } catch (e) {
    // Silently fail — this is non-critical
  }
})();
