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
    return products;
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

//GET REQUEST

server.get("/api/products", async (req, res) => {
  const products = await readFile("products");
  if (!products) return res.sendStatus(500);

  res.json(products);
});

server.listen(4000);
