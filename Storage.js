class Storage {
  static saveCart(cartItems) {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }

  static loadCart() {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  }

  static clearCart() {
    localStorage.removeItem("cartItems");
  }
}

const storage = new Storage();
export { storage, Storage };
