class Cart {
  items = [];

  addItem(product) {
    const existingItem = this.items.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.count += 1;
    } else {
      this.items.push({ ...product, count: 1 });
    }
    this.updateCartCount();
  }

  updateItemCount(id, newCount) {
    const item = this.items.find((item) => item.id === id);
    if (item) {
      item.count = newCount;
      this.updateCartCount();
    }
  }

  updateCartCount() {
    document.querySelector(".cart-count").textContent = this.items.reduce(
      (sum, item) => sum + item.count,
      0
    );
  }

  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.updateCartCount();
  }

  getCartItems() {
    return this.items;
  }
}

const cart = new Cart();
export { cart };
