import express from "express";
import { z } from "zod";
import cors from "cors";
import fs from "fs/promises";

const server = express();

server.use(cors());
//header has content type (application json), express knows that the body has to be parsed as json
server.use(express.json());

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

type Product = z.infer<typeof ProductSchema>;

const readFile = async (filename: string) => {
  try {
    const data = await fs.readFile(
      `${__dirname}/../database/${filename}.json`,
      "utf-8"
    );
    const products = JSON.parse(data);
    return products as Product[];
  } catch (error) {
    return null;
  }
};

const writeFile = async (filename: string, data: any) => {
  try {
    const fileContent = JSON.stringify(data, null, 2);
    await fs.writeFile(
      `${__dirname}/../database/${filename}.json`,
      fileContent
    );
    return true;
  } catch (error) {
    return false;
  }
};

//GET REQUESTS

server.get("/api/products", async (req, res) => {
  const products = await readFile("products");
  if (!products) return res.sendStatus(500);

  res.json(products);
});

server.get("/api/cart", async (req, res) => {
  const cartItems = await readFile("cart");
  if (!cartItems) return res.sendStatus(500);

  res.json(cartItems);
});

//POST REQUEST

server.post("/api/cart", async (req, res) => {
  const result = ProductSchema.safeParse(req.body);

  if (!result.success) return res.status(400).json(result.error.issues);

  const validatedProductToCart = result.data;

  const productsInCart = await readFile("cart");
  if (!productsInCart) return res.sendStatus(500);

  const checkExistInCart = productsInCart.find(
    (productInCart) => productInCart.id === validatedProductToCart.id
  );

  if (checkExistInCart) {
    checkExistInCart.counter++;
    checkExistInCart.price =
      checkExistInCart.price + checkExistInCart.originalPrice;

    const isSuccessFull = await writeFile("cart", productsInCart);
    if (!isSuccessFull) return res.sendStatus(500);
    res.json("already in cart, counter incremented");
  } else {
    validatedProductToCart.counter++;
    validatedProductToCart.originalPrice = validatedProductToCart.price;
    productsInCart.push(validatedProductToCart);
    const isSuccessFull = await writeFile("cart", productsInCart);

    if (!isSuccessFull) return res.sendStatus(500);
    res.json("added to cart");
  }
});

//DELETE REQUEST

server.delete("/api/cart/:id", async (req, res) => {
  const id = req.params.id;
  const result = z.coerce.number().safeParse(id);
  if (!result.success) return res.status(400).json(result.error.issues);

  const itemId = result.data;

  const productsInCart = await readFile("cart");
  if (!productsInCart) return res.sendStatus(500);

  const checkExistInCart = productsInCart.find(
    (element) => element.id === itemId
  );

  if (checkExistInCart) {
    if (checkExistInCart.counter > 1) {
      checkExistInCart.counter--;
      checkExistInCart.price =
        checkExistInCart.price - checkExistInCart.originalPrice;

      const isSuccessFull = await writeFile("cart", productsInCart);
      if (!isSuccessFull) return res.sendStatus(500);
      res.json("item in cart decremented");
    } else {
      const filteredItems = productsInCart.filter(
        (element) => element.id !== itemId
      );
      const isSuccessFull = await writeFile("cart", filteredItems);
      if (!isSuccessFull) return res.sendStatus(500);
      res.json("item deleted");
    }
  } else {
    return res.sendStatus(500);
  }
});

server.listen(4000);
