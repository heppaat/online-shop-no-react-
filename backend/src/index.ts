import express from "express";
import { z } from "zod";
import cors from "cors";
import fs from "fs/promises";

const server = express();

server.use(cors());
//header has content type (application json), express knows that the body has to be parsed as json
server.use(express.json());
