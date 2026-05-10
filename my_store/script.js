async function loadHeaderFooter() {
  try {
    const headerRes = await fetch('components/header.html');
    const headerHtml = await headerRes.text();
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) headerPlaceholder.innerHTML = headerHtml;
    
    const footerRes = await fetch('components/footer.html');
    const footerHtml = await footerRes.text();
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;
    
    // Re-attach event listeners after header loads
    initHeaderEvents();
  } catch (err) {
    console.error('Error loading header/footer:', err);
  }
}

function initHeaderEvents() {
  // Hamburger
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.onclick = (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    };
  }

  // Mobile search panel toggle
  const searchIcon = document.getElementById('mobileSearchIcon');
  const mobileSearchBar = document.getElementById('mobileSearchBar');
  const closeSearch = document.getElementById('closeMobileSearch');
  
  if (searchIcon && mobileSearchBar) {
    searchIcon.onclick = (e) => {
      e.stopPropagation();
      mobileSearchBar.classList.toggle('active');
      if (mobileSearchBar.classList.contains('active')) {
        const mobileInput = document.getElementById('globalSearchMobile');
        if (mobileInput) mobileInput.focus();
      }
      if (navLinks) navLinks.classList.remove('active');
    };
  }
  if (closeSearch && mobileSearchBar) {
    closeSearch.onclick = () => mobileSearchBar.classList.remove('active');
  }

  // Close mobile menu on outside click
  document.addEventListener('click', function(event) {
    if (navLinks && navLinks.classList.contains('active')) {
      if (!hamburger?.contains(event.target) && !navLinks.contains(event.target)) {
        navLinks.classList.remove('active');
      }
    }
  });

  // Cart icon
  const cartIcon = document.getElementById('cartIconHeader');
  if (cartIcon) {
    cartIcon.onclick = () => {
      const sidebar = document.getElementById('cartSidebar');
      const overlay = document.getElementById('cartOverlay');
      if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.style.display = 'block';
      }
    };
  }

  // ========== SEARCH ==========
  function performSearch(query) {
    if (!query || !query.trim()) return;
    window.location.href = `search.html?q=${encodeURIComponent(query.trim())}`;
  }

  const desktopInput = document.getElementById('globalSearchDesktop');
  const desktopBtn = document.getElementById('desktopSearchBtn');
  if (desktopInput) {
    desktopInput.onkeypress = (e) => { if (e.key === 'Enter') performSearch(desktopInput.value); };
  }
  if (desktopBtn) {
    desktopBtn.onclick = () => performSearch(desktopInput?.value);
  }

  const mobileInput = document.getElementById('globalSearchMobile');
  if (mobileInput) {
    mobileInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
        performSearch(mobileInput.value);
        const bar = document.getElementById('mobileSearchBar');
        if (bar) bar.classList.remove('active');
      }
    };
  }
}

// Attach cart button listeners (for dynamic product cards)
window.attachCartButtonListeners = function() {
  document.querySelectorAll('.btn-add-cart, .btn-add-cart-lg').forEach(btn => {
    btn.removeEventListener('click', window._cartGlobalHandler);
    const handler = (e) => {
      const id = btn.dataset.id, name = btn.dataset.name, price = parseFloat(btn.dataset.price), image = btn.dataset.img;
      if (window.addToCart) window.addToCart({ id, name, price, image, quantity: 1 });
    };
    btn.addEventListener('click', handler);
    window._cartGlobalHandler = handler;
  });
};

// For products.html (if you still want local filter)
function applySearchParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery && window.location.pathname.includes('products.html')) {
    setTimeout(() => {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = searchQuery;
        searchInput.dispatchEvent(new Event('input'));
      }
    }, 500);
  }
}

if (window.location.pathname.includes('products.html')) {
  document.addEventListener('DOMContentLoaded', applySearchParam);
}