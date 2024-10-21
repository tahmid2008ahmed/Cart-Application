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
    categories.forEach((category) => {
      this.products.push(...category.products);
    });
  }

  findProduct(id) {
    return this.products.find((product) => product.id === id);
  }
}

const product = new ProductData();
export { product };
