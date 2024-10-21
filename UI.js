import { product } from "./ProductData"; // Import product data if needed
import { cart } from "./Cart"; // Still import cart for modal handling

class UI {
  loadSelectors() {
    return {
      categoryContainerElm: document.querySelector(".category-container"),
      cartIconElm: document.querySelector(".cart-icon"),
      cartModalElm: document.getElementById("cartModal"),
      closeModalElm: document.querySelector(".close"),
      cartItemsElm: document.getElementById("cartItems"),
    };
  }

  populateProductsToUI(categories) {
    const { categoryContainerElm } = this.loadSelectors();
    categories.forEach((category) => {
      const categorySection = document.createElement("section");
      categorySection.classList.add("category");

      const categoryHTML = `
          <h2>${category.name}</h2>
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

  showCartModal() {
    const { cartModalElm, cartItemsElm } = this.loadSelectors();
    const cartItems = cart.getCartItems();

    cartItemsElm.innerHTML = ""; // Clear previous items

    if (cartItems.length === 0) {
      cartItemsElm.innerHTML =
        "<tr><td colspan='5'>Your cart is empty.</td></tr>";
    } else {
      cartItems.forEach((item, index) => {
        const cartRow = `
          <tr>
            <td>${index + 1}</td>
            <td><img src="${item.image_url}" /> ${item.name}</td>
            <td>${item.price}</td>
            <td>
              <button class="removeItem" data-product-id="${
                item.id
              }">Delete</button>
            </td>
          </tr>
        `;
        cartItemsElm.innerHTML += cartRow;
      });
    }

    cartModalElm.style.display = "block"; // Show the modal
  }

  closeCartModal() {
    const { cartModalElm } = this.loadSelectors();
    cartModalElm.style.display = "none"; // Hide the modal
  }

  init() {
    const { cartIconElm, closeModalElm } = this.loadSelectors();

    // Fetch products only to populate UI (optional)
    product.getProductsWithCategories().then((data) => {
      this.populateProductsToUI(data);
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
export { ui };
