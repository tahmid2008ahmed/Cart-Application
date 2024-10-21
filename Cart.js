import { storage, Storage } from "./Storage.js";
class Cart {
  items = [];

  constructor() {
    this.items = Storage.loadCart();
    Storage.saveCart(this.items);
  }

  addProduct(product) {
    const existingProduct = this.items.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }

    Storage.saveCart(this.items);
  }

  removeProduct(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    Storage.saveCart(this.items);
  }

  getCartItems() {
    return this.items;
  }

  clearCart() {
    this.items = [];
    Storage.clearCart();
  }
}

const cart = new Cart();
export { cart };
