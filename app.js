// Variables
const elements = {
  cartBtn: document.querySelector(".cart-btn"),
  closeCartBtn: document.querySelector(".close-cart"),
  clearCartBtn: document.querySelector(".clear-cart"),
  cartDOM: document.querySelector(".cart"),
  cartOverlay: document.querySelector(".cart-overlay"),
  cartItems: document.querySelector(".cart-items"),
  cartTotal: document.querySelector(".cart-total"),
  cartContent: document.querySelector(".cart-content"),
  productsDOM: document.querySelector(".list-products"),
};

// Cart
let cart = [];

// Buttons
let buttonsDOM = [];

// Getting the products
class Products {
  async getProducts() {
    try {
      const result = await fetch("products.json");
      const data = await result.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

// Displaying the products
class UI {
  displayProducts(products) {
    let firstProductHTML = "";
    let restProductsHTML = "";

    products.forEach((product, index) => {
      const productHTML = `
        <!-- Single product -->
        <article class="product">
          <div class="img-container">
            <img src="${product.image}" alt="product" class="product-img" />
            <button class="bag-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              Adicionar ao carrinho
            </button>
          </div>
          <h3>${product.name}</h3>
          <h4>${product.detail}</h4>
          <h4>$${product.price}</h4>
          <p class="product-info" style="display: none;">${product.detail}</p>
        </article>
        <!-- End of single product -->`;

      if (index === 0) {
        firstProductHTML = productHTML;
      } else {
        restProductsHTML += productHTML;
      }
    });

    // Adiciona o primeiro produto em uma div separada
    elements.productsDOM.innerHTML = `
      <div class="products-center">
        ${firstProductHTML}
      </div>
      <div class="products-center">
        ${restProductsHTML}
      </div>`;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "Produto Adicionado";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "Produto Adicionado";
        event.target.disabled = true;
        // Get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // Add product to cart
        cart = [...cart, cartItem];
        // Save cart in local storage
        Storage.saveCart(cart);
        // Set cart values
        this.setCartValues(cart);
        // Display cart item
        this.addCartItem(cartItem);
        // Show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    elements.cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    elements.cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} />
            <div>
              <h4>${item.name}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remover</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
    elements.cartContent.appendChild(div);
  }
  showCart() {
    elements.cartOverlay.classList.add("transparentBcg");
    elements.cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    elements.cartBtn.addEventListener("click", this.showCart.bind(this));
    elements.closeCartBtn.addEventListener("click", this.hideCart.bind(this));
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    elements.cartOverlay.classList.remove("transparentBcg");
    elements.cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    // Clear cart button
    elements.clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // Cart functionality
    elements.cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        elements.cartContent.removeChild(
          removeItem.parentElement.parentElement
        );
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          elements.cartContent.removeChild(
            lowerAmount.parentElement.parentElement
          );
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));

    while (elements.cartContent.children.length > 0) {
      elements.cartContent.removeChild(elements.cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Adicionar ao carrinho`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// Local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // Setup app
  ui.setupAPP();
  // Get all products
  products
    .getProducts()
    .then((products) => {
      // Display products
      ui.displayProducts(products);
      // Save products to local storage
      Storage.saveProducts(products);
    })
    .then(() => {
      // Set up buttons for the cart
      ui.getBagButtons();
      // Set up cart logic
      ui.cartLogic();
    });
});

// Add event listener to show product details on click
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("details-btn")) {
    const productId = event.target.dataset.id;
    const productInfo = document.querySelector(`[data-id="${productId}"] .product-info`);
    const productDetails = productInfo.innerText;

    // Create HTML elements for the popup
    const popup = document.createElement("div");
    popup.classList.add("popup");
    const content = document.createElement("div");
    content.classList.add("popup-content");
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "&times;";
    const details = document.createElement("p");
    details.textContent = productDetails;

    // Append elements to the popup
    content.appendChild(closeBtn);
    content.appendChild(details);
    popup.appendChild(content);
    document.body.appendChild(popup);

    // Add event listener to close the popup
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(popup);
    });
  }
});
