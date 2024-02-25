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

const mainDiv = document.getElementById("app") as HTMLDivElement;

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
        <h1 class="productTitle" id="${id}title">${title}</h1>
        <p>${description}</p>
        <h2>${price}</h2>
        <button class="toCart" id="${id}toCart">Add to Cart</button>
    </div>
    `;
};

const getAllProducts = async () => {
  const response = await safeFetch(
    "GET",
    "http://localhost:4000/api/products",
    ProductSchema.array()
  );
  if (!response.success) return;

  const products = response.data;

  const result = products.map((product) => productComponent(product)).join("");

  mainDiv.innerHTML = result;
};

window.addEventListener("load", getAllProducts);
