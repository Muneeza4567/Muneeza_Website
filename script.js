
const products = [
  {
    id: 1, name: "Cloud Nine Sneakers", category: "Sneakers",
    price: 3499, old: 3999, badge: "BESTSELLER", rating: "4.9",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=850&q=85"
  },
  {
    id: 2, name: "Blush Bow Slippers", category: "Slippers",
    price: 1899, old: 2299, badge: "SOFT FAVOURITE", rating: "4.8",
    image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=850&q=85"
  },
  {
    id: 3, name: "The Sunday Heels", category: "Heels",
    price: 4299, old: 4999, badge: "NEW IN", rating: "4.9",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=850&q=85"
  },
  {
    id: 4, name: "Sunkissed Sandals", category: "Sandals",
    price: 2499, old: null, badge: "EVERYDAY LOVE", rating: "4.7",
    image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=850&q=85"
  },
  {
    id: 5, name: "Weekend Runner", category: "Sneakers",
    price: 3199, old: null, badge: "JUST LANDED", rating: "4.8",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=850&q=85"
  },
  {
    id: 6, name: "Cloud Soft Slides", category: "Slippers",
    price: 1699, old: 1999, badge: "UNDER RS. 2K", rating: "4.6",
    image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=850&q=85"
  },
  {
    id: 7, name: "After Hours Heels", category: "Heels",
    price: 4599, old: null, badge: "OCCASION EDIT", rating: "4.9",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=850&q=85"
  },
  {
    id: 8, name: "Easy Does It Flats", category: "Sandals",
    price: 2199, old: null, badge: "DAILY ESSENTIAL", rating: "4.7",
    image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=850&q=85"
  }
];

const $ = selector => document.querySelector(selector);

const productGrid = $("#productGrid");
const emptyState = $("#emptyState");
const searchInput = $("#searchInput");
const toast = $("#toast");

let activeFilter = "All";
let searchTerm = "";
let cart = [];
let favourites = new Set();
let toastTimer;

function money(amount) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function renderProducts() {
  const shown = products.filter(product => {
    const matchesCategory =
      activeFilter === "All" ||
      product.category === activeFilter;

    const matchesSearch =
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = shown.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >

        <span class="product-badge">${product.badge}</span>

        <button
          class="heart ${favourites.has(product.id) ? "liked" : ""}"
          data-fav="${product.id}"
          aria-label="Add to favourites"
        >${favourites.has(product.id) ? "♥" : "♡"}</button>
      </div>

      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>

        <div class="price-row">
          <span class="price">${money(product.price)}</span>
          ${product.old
            ? `<span class="old-price">${money(product.old)}</span>`
            : ""}
        </div>

        <div class="rating">
          ★★★★★ <span>${product.rating} / 5</span>
        </div>

        <button class="add-btn" data-add="${product.id}">
          Add to bag +
        </button>
      </div>
    </article>
  `).join("");

  emptyState.hidden = shown.length !== 0;
}

function updateCounts() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);

  $("#cartCount").textContent = total;
  $("#favCount").textContent = favourites.size;
}

function renderCart() {
  const cartItems = $("#cartItems");

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        Your bag is waiting for something lovely. ♡
        <br><br>
        <a href="#shop" id="shopFromBag">Explore the collection ↗</a>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-line">
        <img src="${item.image}" alt="${item.name}">

        <div>
          <h3>${item.name}</h3>
          <p>${money(item.price)}</p>

          <div class="qty">
            <button
              data-qty="${item.id}"
              data-delta="-1"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.qty}</span>

            <button
              data-qty="${item.id}"
              data-delta="1"
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        <button class="remove" data-remove="${item.id}">
          Remove
        </button>
      </div>
    `).join("");
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  $("#subtotal").textContent = money(subtotal);

  updateCounts();
}

function openCart() {
  renderCart();

  $("#cartOverlay").classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  $("#cartOverlay").classList.remove("open");
  document.body.classList.remove("no-scroll");
}

// Add products to bag and manage favourites
productGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const favButton = event.target.closest("[data-fav]");

  if (addButton) {
    const product = products.find(
      item => item.id === Number(addButton.dataset.add)
    );

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }

    updateCounts();
    showToast(`${product.name} added to your bag ♡`);
  }

  if (favButton) {
    const id = Number(favButton.dataset.fav);

    if (favourites.has(id)) {
      favourites.delete(id);
      showToast("Removed from favourites");
    } else {
      favourites.add(id);
      showToast("Saved to your favourites ♡");
    }

    renderProducts();
    updateCounts();
  }
});

// Product category filters
document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(filter => {
      filter.classList.toggle("active", filter === button);
    });

    renderProducts();
  });
});

// Click a collection card to filter the shop
document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.category;
    searchTerm = "";
    searchInput.value = "";

    document.querySelectorAll(".filter").forEach(filter => {
      filter.classList.toggle(
        "active",
        filter.dataset.filter === activeFilter
      );
    });

    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });
});

// Search products
function runSearch() {
  searchTerm = searchInput.value.trim();
  activeFilter = "All";

  document.querySelectorAll(".filter").forEach(filter => {
    filter.classList.toggle(
      "active",
      filter.dataset.filter === "All"
    );
  });

  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
}

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") runSearch();
});

$("#searchBtn").addEventListener("click", () => {
  const searchBox = $("#searchBox");

  if (
    window.innerWidth <= 780 &&
    !searchBox.classList.contains("expanded")
  ) {
    searchBox.classList.add("expanded");
    searchInput.focus();
  } else {
    runSearch();
  }
});

// Shopping bag
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlayBg").addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

$("#cartItems").addEventListener("click", event => {
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (qtyButton) {
    const id = Number(qtyButton.dataset.qty);
    const delta = Number(qtyButton.dataset.delta);
    const item = cart.find(product => product.id === id);

    if (item) {
      item.qty += delta;

      if (item.qty <= 0) {
        cart = cart.filter(product => product.id !== id);
      }
    }

    renderCart();
  }

  if (removeButton) {
    const id = Number(removeButton.dataset.remove);

    cart = cart.filter(product => product.id !== id);
    renderCart();
  }

  if (event.target.closest("#shopFromBag")) {
    closeCart();
  }
});

// Demo checkout
$("#checkout").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your bag is empty. Find a pair you love ♡");
  } else {
    showToast("Demo store: real checkout is not connected yet.");
  }
});

// Favourites button
$("#favoritesBtn").addEventListener("click", () => {
  if (favourites.size === 0) {
    showToast("Tap a ♡ on a product to save your favourites.");
    return;
  }

  activeFilter = "All";
  searchTerm = "";
  searchInput.value = "";

  document.querySelectorAll(".filter").forEach(filter => {
    filter.classList.toggle(
      "active",
      filter.dataset.filter === "All"
    );
  });

  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });

  showToast(`${favourites.size} pair(s) saved to favourites ♡`);
});

// Newsletter demo
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  $("#newsletterMessage").textContent =
    "Thanks for joining our little circle ♡";

  $("#emailInput").value = "";
  showToast("Thanks for joining the Muneza list!");
});

// Responsive mobile navigation
$("#menuToggle").addEventListener("click", () => {
  const isOpen = $("#nav").classList.toggle("open");

  $("#menuToggle").setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  $("#menuToggle").textContent = isOpen ? "×" : "☰";
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    $("#nav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
    $("#menuToggle").textContent = "☰";
  });
});

// Back to top
window.addEventListener("scroll", () => {
  $("#backTop").classList.toggle("visible", window.scrollY > 450);
});

$("#backTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Set the current year and display the products
$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
