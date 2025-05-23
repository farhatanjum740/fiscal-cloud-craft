
// This script improves page loading performance
document.addEventListener('DOMContentLoaded', function() {
  // Mark when the first contentful paint happens
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FCP:', entry.startTime);
      console.log('FCP metric:', entry);
    }
  });
  observer.observe({type: 'paint', buffered: true});
  
  // Preconnect to important domains
  const links = [
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true}
  ];
  
  links.forEach(linkData => {
    const link = document.createElement('link');
    for (const [key, value] of Object.entries(linkData)) {
      if (value !== undefined) {
        link.setAttribute(key, value);
      }
    }
    document.head.appendChild(link);
  });
});

// Register service worker for improved performance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful');
    }).catch(err => {
      console.log('ServiceWorker registration failed', err);
    });
  });
}
