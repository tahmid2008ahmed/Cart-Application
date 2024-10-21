class ProductData {
  data = [];
  products = [];

  async getProductsWithCategories() {
    try {
      const response = await fetch(
        `http://localhost:3000/categories?_embed=products`
      );
      const categories = await response.json();
      this.data = [...this.data, ...categories];
      this.collectProduct(this.data);
      return this.data;
    } catch (error) {
      console.error("Error fetching categories with products:", error);
    }
  }

  collectProduct(categories) {
    this.products = [];
    categories.forEach((category) => {
      this.products.push(...category.products);
    });
  }

  findProduct(id) {
    return this.products.find((product) => product.id === id); // Correctly find the product by id
  }
}

const product = new ProductData();

// --------------------------------------------
class Cart {
  items = [];

  addProduct(product) {
    const existingProduct = this.items.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
  }

  removeProduct(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
  }

  getCartItems() {
    return this.items;
  }
}

const cart = new Cart();

// -------------------------------------------------
class UI {
  loadSelectors() {
    return {
      categoryContainerElm: document.querySelector(".category-container"),
      cartIconElm: document.querySelector(".cart-icon"),
      cartModalElm: document.getElementById("cartModal"),
      closeModalElm: document.querySelector(".close"),
      cartItemsElm: document.getElementById("cartItems"),
      cartCountElm: document.querySelector(".cart-count"),
    };
  }

  populateProductsToUI(categories) {
    const { categoryContainerElm } = this.loadSelectors();

    categories.forEach((category) => {
      const categorySection = document.createElement("section");
      categorySection.classList.add("category");

      const categoryHTML = `
            <h2 class="categoryName">${category.name}</h2>
            <hr />
            <br />
            <div class="product-grid row mb-5"></div>
          `;

      categorySection.innerHTML = categoryHTML;
      const productGridElm = categorySection.querySelector(".product-grid");

      category.products.forEach((product) => {
        const productHTML = `
              <div class="product-box">
                <img src="${product.image_url}" alt="${product.name}" />
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <h5>${product.price}</h5>
                <button class="cartButton" data-product-id="${product.id}">Add to Cart</button>
              </div>
            `;
        productGridElm.innerHTML += productHTML;
      });

      categoryContainerElm.appendChild(categorySection);
    });
  }

  updateCartCount() {
    const { cartCountElm } = this.loadSelectors();
    const cartItems = cart.getCartItems();

    const totalCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cartCountElm.textContent = totalCount;
  }

  addCartButtonListeners() {
    const buttons = document.querySelectorAll(".cartButton");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-product-id");
        const productData = product.findProduct(productId); // Get the product data

        if (productData) {
          cart.addProduct(productData); // Add product to the cart
          this.populateCartUI(); // Update cart UI
          this.updateCartCount(); // Update count
        }
      });
    });
  }

  populateCartUI() {
    const { cartItemsElm } = this.loadSelectors();
    const cartItems = cart.getCartItems();

    // Clear the cart items display
    cartItemsElm.innerHTML = "";

    if (cartItems.length === 0) {
      cartItemsElm.innerHTML =
        "<tr><td colspan='5'>Your cart is empty.</td></tr>";
    } else {
      cartItems.forEach((item) => {
        const cartItemHTML = `
          <tr>
            <td><img src="${item.image_url}" alt="${
          item.name
        }" style="width: 50px;"></td>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>
            <button class="quantity-btn minus" data-product-id="${
              item.id
            }">-</button>
            <span class="quantity">${item.quantity || 1}</span>
            <button class="quantity-btn plus" data-product-id="${
              item.id
            }">+</button>
          </td>
            <td><button class="removeButton" data-product-id="${
              item.id
            }">Remove</button></td>
          </tr>
        `;
        cartItemsElm.innerHTML += cartItemHTML;
      });

      // Attach listeners for the plus and minus buttons
      this.addCountQuantityButtonListeners();

      // Attach remove buttons event listeners
      this.addRemoveButtonListeners();
    }
  }

  addCountQuantityButtonListeners() {
    const minusButtons = document.querySelectorAll(".minus");
    const plusButtons = document.querySelectorAll(".plus");

    minusButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-product-id");
        const productInCart = cart
          .getCartItems()
          .find((item) => item.id === productId);

        if (productInCart && productInCart.quantity > 1) {
          productInCart.quantity--;
          this.populateCartUI();
          this.updateCartCount();
        }
      });
    });

    plusButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-product-id");
        const productInCart = cart
          .getCartItems()
          .find((item) => item.id === productId);

        if (productInCart) {
          productInCart.quantity++;
          this.populateCartUI();
          this.updateCartCount();
        }
      });
    });
  }

  addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll(".removeButton");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-product-id");
        cart.removeProduct(productId); // Remove the product from the cart
        this.populateCartUI(); // Refresh the cart UI
        this.updateCartCount(); // Update cart count
      });
    });
  }

  showCartModal() {
    const { cartModalElm } = this.loadSelectors();
    this.populateCartUI(); // Populate cart UI when showing the modal
    cartModalElm.style.display = "block";
  }

  closeCartModal() {
    const { cartModalElm } = this.loadSelectors();
    cartModalElm.style.display = "none";
  }

  init() {
    const { cartIconElm, closeModalElm } = this.loadSelectors();

    // Fetch products and populate UI
    product.getProductsWithCategories().then((data) => {
      this.populateProductsToUI(data);

      // Attach event listeners for "Add to Cart" buttons after products are loaded
      this.addCartButtonListeners();
    });

    // Show cart modal when cart icon is clicked
    cartIconElm.addEventListener("click", () => {
      this.showCartModal(); // Simply show the modal
    });

    // Close the modal when the close button is clicked
    closeModalElm.addEventListener("click", () => {
      this.closeCartModal();
    });

    // Close the modal if the user clicks outside the modal content
    window.addEventListener("click", (e) => {
      const { cartModalElm } = this.loadSelectors();
      if (e.target === cartModalElm) {
        this.closeCartModal();
      }
    });
  }
}

const ui = new UI();
ui.init();
