import express from "express";
import bodyParser from "body-parser";
import xmlParser from "body-parser-xml";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { errorResponse, successResponse } from "./helpers/response";
import { isCelebrateError } from "celebrate";
import { validateTransactionObject } from "./helpers/validation";
import computeTpssFee from "./helpers/tpssCompute";
import json2xml from "json2xml";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());
xmlParser(bodyParser);
app.use(bodyParser.xml());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  if (req.query.format && req.query.format.toLowerCase() === "xml") {
    const xmlResponse = "<message>Welcome to LannisterPay TPSS API</message>";
    res.set("Content-Type", "text/xml");
    return res.status(200).send(xmlResponse);
  }
  return res.status(200).json({
    message: "Welcome to LannisterPay TPSS API",
  });
});

app.post(
  "/split-payments/compute",
  validateTransactionObject,
  async (req, res) => {
    console.log('validated', req.validatedBody)
    const result = computeTpssFee(req.validatedBody ?? req.body);

    const isXMLRequested = req.query.format && req.query.format.toLowerCase() === 'xml';

    if (isXMLRequested) {
      const xmlResponse = json2xml(result);

      res.set("Content-Type", "text/xml");
      return res.status(200).send(xmlResponse);
    } else {
      return successResponse(res, result);
    }
  }
);

app.use("*", (req, res) => {
  return errorResponse(res, "Route / Method not supported", 404);
});

app.use((error, _req, res, next) => {
  if (isCelebrateError(error)) {
    const errorMessage =
      error.details.get("body") ||
      error.details.get("query") ||
      error.details.get("params");

    const message = errorMessage?.message.replace(/"/g, "");
    return errorResponse(res, message);
  }
  next();
});

export default app;
