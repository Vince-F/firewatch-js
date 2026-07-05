import express from "express";
import bodyParser from "body-parser";
import serveStatic from "serve-static";

const app = express();
app.use(bodyParser.json());
app.use(serveStatic("public"));
app.use("/js", serveStatic("../dist"));
const PORT = 3000;

app.post("/testWithUrl", (req, res) => {
  console.log("Test with URL:", req.body);
  res.sendStatus(204);
});

app.post("/testWithSendUrl", (req, res) => {
  console.log("Test with send URL:", req.body);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
