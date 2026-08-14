(function () {
  'use strict';

  var productionHosts = ['akshundogra.com', 'www.akshundogra.com'];
  if (productionHosts.indexOf(window.location.hostname) === -1) return;

  var language = document.documentElement.lang === 'de' ? 'de' : 'en';
  var caseStudies = [
    'circuit',
    'chief-of-staff-agents',
    'intent-signal-automation',
    'abm-page-automation',
    'llm-geo-visibility',
    'performance-marketing'
  ];

  function track(eventName, data) {
    if (!window.umami || typeof window.umami.track !== 'function') return;
    window.umami.track(eventName, Object.assign({ language: language }, data || {}));
  }

  function locationFor(element) {
    if (element.closest('nav')) return 'navigation';
    if (element.closest('#hero')) return 'hero';
    if (element.closest('#youtube')) return 'youtube-section';
    if (element.closest('#projects')) return 'projects';
    if (element.closest('.resume-cta')) return 'resume';
    if (element.closest('.cta-strip')) return 'mid-page-cta';
    if (element.closest('#final-cta')) return 'footer';
    return 'page';
  }

  function onClick(selector, callback) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.addEventListener('click', function () {
        callback(element);
      });
    });
  }

  function initializeClickTracking() {
    onClick('a[href$=".pdf"], a[download][href*=".pdf"]', function (link) {
      var file = link.getAttribute('href').split('/').pop();
      track('resume-download', { file: file, location: locationFor(link) });
    });

    onClick('a[href^="https://hire.akshundogra.com"]', function (link) {
      var destination = new URL(link.href).pathname || '/';
      track('see-how-i-work', { destination: destination, location: locationFor(link) });
    });

    onClick('a[href^="mailto:"]', function (link) {
      track('contact-click', { method: 'email', location: locationFor(link) });
    });

    onClick('.cs-tab[data-cstab]', function (button) {
      var index = Number(button.getAttribute('data-cstab'));
      track('case-study-view', { caseStudy: caseStudies[index] || 'unknown' });
    });

    onClick('.lang-switcher', function () {
      track('language-switch', { from: language, to: language === 'de' ? 'en' : 'de' });
    });

    onClick('a[href*="linkedin.com"], a[href*="youtube.com"], a[href*="github.com"]', function (link) {
      var hostname = new URL(link.href).hostname;
      var platform = hostname.indexOf('linkedin') !== -1
        ? 'linkedin'
        : hostname.indexOf('youtube') !== -1
          ? 'youtube'
          : 'github';
      track('social-click', { platform: platform, location: locationFor(link) });
    });

    onClick('nav a[href^="#"], .hero-actions a[href^="#"]', function (link) {
      track('section-navigation', {
        destination: link.getAttribute('href').replace('#', '') || 'top',
        location: locationFor(link)
      });
    });
  }

  function initializeScrollTracking() {
    var milestones = [25, 50, 75, 90];
    var recorded = {};
    var ticking = false;

    function measureScrollDepth() {
      var documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      var scrollableHeight = documentHeight - window.innerHeight;
      var depth = scrollableHeight > 0
        ? Math.round((window.scrollY / scrollableHeight) * 100)
        : 100;

      milestones.forEach(function (milestone) {
        if (depth >= milestone && !recorded[milestone]) {
          recorded[milestone] = true;
          track('scroll-depth', { percent: milestone });
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measureScrollDepth);
    }, { passive: true });

    measureScrollDepth();
  }

  function initializeReadingTimeTracking() {
    var milestones = [30, 60, 120];
    var visibleSeconds = 0;

    window.setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      visibleSeconds += 1;
      if (milestones.indexOf(visibleSeconds) !== -1) {
        track('reading-time', { seconds: visibleSeconds });
      }
    }, 1000);
  }

  function initializeTracking() {
    initializeClickTracking();
    initializeScrollTracking();
    initializeReadingTimeTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTracking, { once: true });
  } else {
    initializeTracking();
  }
})();
