let cart = [];

function loadCart() {
  const saved = localStorage.getItem('classStoreCart');
  if (saved) cart = JSON.parse(saved);
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('classStoreCart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...item, quantity: 1 });
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateQuantity(id, delta) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx !== -1) {
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    saveCart();
  }
}

// Use event delegation to avoid duplicate listeners
function attachCartItemEvents() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  // Remove old listeners by replacing the container's inner HTML? No, we use event delegation on parent.
  // Better: attach one listener on container for dynamic buttons
  container.removeEventListener('click', cartItemClickHandler);
  container.addEventListener('click', cartItemClickHandler);
}

function cartItemClickHandler(e) {
  const btn = e.target.closest('.qty-btn, .remove-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  if (btn.classList.contains('qty-btn')) {
    const delta = parseInt(btn.dataset.delta);
    updateQuantity(id, delta);
  } else if (btn.classList.contains('remove-btn')) {
    removeFromCart(id);
  }
}

function updateCartUI() {
  const container = document.getElementById('cartItemsContainer');
  const totalSpan = document.getElementById('cartTotalAmount');
  const badge = document.getElementById('cartCountBadge');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    totalSpan.innerText = '₦0';
    if (badge) badge.innerText = '0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `<div class="cart-item">
      <img src="${item.image}" width="50">
      <div><strong>${item.name}</strong><br>₦${item.price.toLocaleString()}</div>
      <div>
        <button class="qty-btn" data-id="${item.id}" data-delta="-1">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
        <button class="remove-btn" data-id="${item.id}">🗑️</button>
      </div>
    </div>`;
  }).join('');

  totalSpan.innerText = `₦${total.toLocaleString()}`;
  if (badge) badge.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Attach event delegation (only once)
  attachCartItemEvents();
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert('Cart is empty. Add products first.');
    return;
  }
  let message = "Order Details:\n";
  cart.forEach(item => {
    message += `- ${item.name} x ${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}\n`;
  });
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  message += `\nTotal: ₦${total.toLocaleString()}`;
  const waUrl = `https://wa.me/2348012345678?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

function initCartEvents() {
  loadCart();

  const cartBtn = document.getElementById('floatingCartBtn');
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const closeBtn = document.getElementById('closeCartBtn');
  const checkoutBtn = document.getElementById('checkoutWhatsAppBtn');

  const openCart = () => {
    if (sidebar && overlay) {
      sidebar.classList.add('open');
      overlay.style.display = 'block';
    }
  };
  const closeCart = () => {
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    }
  };

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);
  if (checkoutBtn) checkoutBtn.addEventListener('click', checkoutWhatsApp);

  // Handle header cart icon (reliably, even if loaded later)
  const attachHeaderCart = () => {
    const headerCart = document.getElementById('cartIconHeader');
    if (headerCart) {
      headerCart.removeEventListener('click', openCart);
      headerCart.addEventListener('click', openCart);
    }
  };
  attachHeaderCart();
  // If header loads dynamically (e.g., via fetch), re-run after a short delay or use MutationObserver
  setTimeout(attachHeaderCart, 500); // fallback for dynamic load
}

// Expose globally
window.addToCart = addToCart;
window.initCartEvents = initCartEvents;