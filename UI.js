import { product } from "./ProductData.js";
import { cart } from "./Cart.js";
import { Storage } from "./Storage.js";

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

    console.log("Cart items:", cartItems); // Debugging

    const totalCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    console.log("Total item count in cart:", totalCount); // Debugging

    cartCountElm.textContent = totalCount;
  }

  addCartButtonListeners() {
    const buttons = document.querySelectorAll(".cartButton");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-product-id");
        const productData = product.findProduct(productId);

        if (productData) {
          cart.addProduct(productData);
          this.populateCartUI();
          this.updateCartCount();
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
      let totalCartPrice = 0;

      cartItems.forEach((item) => {
        const itemPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0;
        const itemTotalPrice = itemPrice * item.quantity;
        totalCartPrice += itemTotalPrice;

        const cartItemHTML = `
          <tr>
            <td><img src="${item.image_url}" alt="${
          item.name
        }" style="width: 50px;"></td>
            <td>${item.name}</td>
            <td>$${itemPrice}</td>
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

      const totalRowHTML = `
        <tr>
          <td colspan="2"></td>
          <td><strong>Total:</strong></td>
          <td colspan="2"><strong>$${totalCartPrice}</strong></td>
        </tr>
      `;
      cartItemsElm.innerHTML += totalRowHTML;

      this.addCountQuantityButtonListeners();
      this.addRemoveButtonListeners();
    }
  }

  addCountQuantityButtonListeners() {
    const { cartItemsElm } = this.loadSelectors();

    // Remove previous event listener if already added
    cartItemsElm.removeEventListener("click", this.handleCartQuantityChange);

    // Use a named function for event delegation and add a single event listener
    this.handleCartQuantityChange = (e) => {
      const target = e.target;

      // Minus button logic
      if (target.classList.contains("minus")) {
        const productId = target.getAttribute("data-product-id");
        const productInCart = cart
          .getCartItems()
          .find((item) => item.id == productId);

        if (productInCart && productInCart.quantity > 1) {
          productInCart.quantity--;
          Storage.saveCart(cart.getCartItems());
          this.populateCartUI();
          this.updateCartCount();
        } else if (productInCart && productInCart.quantity === 1) {
          cart.removeProduct(productId);
          Storage.saveCart(cart.getCartItems());
          this.populateCartUI();
          this.updateCartCount();
        }
      }

      // Plus button logic
      if (target.classList.contains("plus")) {
        const productId = target.getAttribute("data-product-id");
        const productInCart = cart
          .getCartItems()
          .find((item) => item.id == productId);

        if (productInCart) {
          productInCart.quantity++;
          Storage.saveCart(cart.getCartItems());
          this.populateCartUI();
          this.updateCartCount();
        }
      }
    };

    // Add the event listener for the first time
    cartItemsElm.addEventListener("click", this.handleCartQuantityChange);
  }

  addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll(".removeButton");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-product-id");
        cart.removeProduct(productId);
        this.populateCartUI();
        this.updateCartCount();
      });
    });
  }

  showCartModal() {
    const { cartModalElm } = this.loadSelectors();
    this.populateCartUI();
    cartModalElm.style.display = "block";
  }

  closeCartModal() {
    const { cartModalElm } = this.loadSelectors();
    cartModalElm.style.display = "none";
  }

  init() {
    const { cartIconElm, closeModalElm } = this.loadSelectors();

    document.addEventListener("DOMContentLoaded", () => {
      product.getProductsWithCategories().then((data) => {
        this.populateProductsToUI(data);

        this.addCartButtonListeners();
        this.updateCartCount();
      });

      this.updateCartCount();
    });

    // Show cart modal when cart icon is clicked
    cartIconElm.addEventListener("click", () => {
      this.showCartModal();
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
export { ui };
