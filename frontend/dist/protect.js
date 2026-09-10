// Protection Script - Travel Lombok Airport
(function() {
  'use strict';

  // Disable right-click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable copy, cut, paste
  document.addEventListener('copy',  function(e) { e.preventDefault(); });
  document.addEventListener('cut',   function(e) { e.preventDefault(); });
  document.addEventListener('paste', function(e) { e.preventDefault(); });

  // Disable text selection via keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+A, Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+U (view source), Ctrl+S, Ctrl+P
    if (e.ctrlKey && ['a','c','x','v','u','s','p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      return false;
    }
    // F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      return false;
    }
  });

  // Disable drag and select
  document.addEventListener('selectstart', function(e) {
    // Allow selection inside input and textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
  });

  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });

  // CSS-based protection
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(style);

})();
