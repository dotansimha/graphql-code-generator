if (window && window.location && window.location.pathname.endsWith('/') && window.location.pathname !== '/') {
  window.location.pathname = window.location.pathname.substr(0, window.location.pathname.length - 1);
}