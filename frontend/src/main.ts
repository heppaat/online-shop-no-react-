import "./style.css";
import { safeFetch } from "./http";
import { z } from "zod";

const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  originalPrice: z.number(),
  description: z.string(),
  image: z.string(),
  counter: z.number(),
  ordered: z.number(),
});

type productType = {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  counter: number;
  ordered: number;
};

//BUTTON COMPONENT
const addButton = (id: string, text: string) => {
  return `<button id="${id}">${text}</button>`;
};

//MAINDIV
const mainDiv = document.getElementById("app") as HTMLDivElement;

//GLOBAL VARIABLE for all Products from getAllProducts function
let allProducts: productType[];

//GLOBAL VARIABLE for all CartItems from getAllCartItems function
let allCartItems: productType[];

const productComponent = ({
  id,
  title,
  price,
  description,
  image,
}: productType) => {
  return `
    <div class="product">
        <img src="${image}" alt="Image">
        <h1 class="productTitle" id="${id}">${title}</h1>
        <p>${description}</p>
        <h2>${price}</h2>
        <button class="toCart" id="${id}toCart">Add to Cart</button>
    </div>
    `;
};

const cartComponent = ({
  id,
  title,
  price,
  description,
  image,
  counter,
}: productType) => {
  return `<div class="cartItem">
        <img src="${image}" alt="Image">
        <h1 class="productTitle" id="${id}">${title}</h1>
        <p>${description}</p>
        <h2>Price: ${price} EUR</h2>
        <h2>In your Cart: ${counter}</h2>
        <button class="plus" id="${id}plus">PLUS</button>
        <button class="minus" id="${id}minus">MINUS</button>
    </div>`;
};

const getAllProducts = async () => {
  const response = await safeFetch(
    "GET",
    "http://localhost:4000/api/products",
    ProductSchema.array()
  );
  if (!response.success) return;

  allProducts = response.data;

  const result = allProducts
    .map((product) => productComponent(product))
    .join("");

  mainDiv.innerHTML = result;
  const yourCartButton = document.getElementById("cart") as HTMLButtonElement;
  if (!yourCartButton) {
    mainDiv.insertAdjacentHTML(
      "beforebegin",
      addButton("cart", "See Your Cart")
    );
  }

  listenerToSeeYourCart();
  listenerToAddToCart();
};

const getAllCartItems = async () => {
  const response = await safeFetch(
    "GET",
    "http://localhost:4000/api/cart",
    ProductSchema.array()
  );

  if (!response.success) return;

  allCartItems = response.data;

  const result = allCartItems.map((item) => cartComponent(item)).join("");

  mainDiv.innerHTML = result;
  const yourCartButton = document.getElementById("cart") as HTMLButtonElement;
  if (yourCartButton) {
    yourCartButton.remove();
  }
  const backToHomePageButton = document.getElementById(
    "homePage"
  ) as HTMLButtonElement;
  if (!backToHomePageButton) {
    mainDiv.insertAdjacentHTML(
      "beforebegin",
      addButton("homePage", "Back To Homepage")
    );
  }
  listenerToBackToHomePage();
  listenerToAddPlusToCart();
  listenerToDeleteFromCart();
};

const postToCart = async (id: string) => {
  const productToBag = allProducts.find((product) => product.id === +id);

  const response = await safeFetch(
    "POST",
    "http://localhost:4000/api/cart",
    ProductSchema,
    productToBag
  );
  if (!response.success) return;
};

const deleteFromCart = async (id: string) => {
  const response = await safeFetch(
    "DELETE",
    `http://localhost:4000/api/cart/${id}`,
    ProductSchema
  );
  if (!response.success) {
    return;
  }
};

const listenerToAddToCart = () => {
  const toCartButtons = document.getElementsByClassName("toCart");
  for (let i = 0; i < toCartButtons.length; i++) {
    const button = toCartButtons[i];
    button.addEventListener("click", async () => {
      await postToCart(button.id.split("toCart")[0]);
    });
  }
};

const listenerToAddPlusToCart = () => {
  const plusButtons = document.getElementsByClassName("plus");
  for (let i = 0; i < plusButtons.length; i++) {
    const button = plusButtons[i];
    button.addEventListener("click", async () => {
      await postToCart(button.id.split("plus")[0]);
      getAllCartItems();
    });
  }
};

const listenerToDeleteFromCart = () => {
  const minusButtons = document.getElementsByClassName("minus");
  for (let i = 0; i < minusButtons.length; i++) {
    const button = minusButtons[i];
    button.addEventListener("click", async () => {
      await deleteFromCart(button.id.split("minus")[0]);
      getAllCartItems();
    });
  }
};

const listenerToSeeYourCart = () => {
  const yourCartButton = document.getElementById("cart") as HTMLButtonElement;
  yourCartButton.addEventListener("click", () => {
    getAllCartItems();
  });
};

const listenerToBackToHomePage = () => {
  const backToHomePageButton = document.getElementById(
    "homePage"
  ) as HTMLButtonElement;
  backToHomePageButton.addEventListener("click", async () => {
    const backToHomePageButton = document.getElementById(
      "homePage"
    ) as HTMLButtonElement;
    await getAllProducts();
    backToHomePageButton.remove();
  });
};

window.addEventListener("load", getAllProducts);
