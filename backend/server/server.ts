import express, { Request, Response, NextFunction } from "express";
import path from "path";
import userRouter from "../express-routers/user-router";
import fileRouter from "../express-routers/file-router";
import folderRouter from "../express-routers/folder-router";
import adminRouter from "../express-routers/admin-router"; // <-- NEU: Admin-Router importiert
import bodyParser from "body-parser";
import https from "https";
import fs from "fs";
import helmet from "helmet";
import busboy from "connect-busboy";
import compression from "compression";
import http from "http";
import cookieParser from "cookie-parser";
import env from "../enviroment/env";
import { middlewareErrorHandler } from "../middleware/utils/middleware-utils";
import cors from "cors";

import { v2 as webdav } from "webdav-server";
import { MongoWebDAVAuth } from "../services/webdav/MongoWebDAVAuth";
import { MongoFileSystem } from "../services/webdav/MongoFileSystem";

// --- GLOBALE FEHLERFÄNGER (verhindern stille Abstürze) ---
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[CRITICAL] Unhandled Rejection at:", promise, "reason:", reason);
});

const app = express();
const publicPath = path.join(__dirname, "..", "..", "dist-frontend");

// --- TOTALER REQUEST-LOGGER (Das Radar für Portainer) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  if (url.includes("/webdav") || url.includes("/file-service")) {
    console.log(`[INCOMING] ${method} ${url}`);
    
    res.on("finish", () => {
      if (res.statusCode >= 400) {
        console.error(`[ERROR] ${method} ${url} -> Status: ${res.statusCode}`);
      } else {
        console.log(`[OK] ${method} ${url} -> Status: ${res.statusCode}`);
      }
    });
  }
  next();
});

// --- WEBDAV SERVER ---
const webdavServer = new webdav.WebDAVServer({
  httpAuthentication: new MongoWebDAVAuth(),
  requireAuthentification: true // Ja, das schreibt die Library mit 'f' :D
});

// Wir mounten unseren MongoDB Übersetzer im Root-Verzeichnis (/)
webdavServer.setFileSystem('/', new MongoFileSystem(), (success?: boolean) => {
  console.log("WebDAV FileSystem mounted:", success);
});

// Verbindet den WebDAV Server mit Express
app.use(webdav.extensions.express('/webdav', webdavServer));
// ----------------------

let server: any;
let serverHttps: any;

if (process.env.SSL === "true") {
  const certPath = env.httpsCrtPath || "certificate.crt"
  const caPath = env.httpsCaPath || "certificate.ca-bundle"
  const keyPath = env.httpsKeyPath || "certificate.key"
  const cert = fs.readFileSync(certPath);
  const ca = fs.readFileSync(caPath);
  const key = fs.readFileSync(keyPath);

  const options = {
    cert,
    ca,
    key,
  };

  serverHttps = https.createServer(options, app);
}

server = http.createServer(app);

require("../db/connections/mongoose");

app.use(cors());
app.use(cookieParser(env.passwordCookie));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.static(publicPath, { index: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(
  busboy({
    highWaterMark: 2 * 1024 * 1024,
  })
);

// <-- NEU: adminRouter hier am Ende hinzugefügt
app.use(userRouter, fileRouter, folderRouter, adminRouter); 

app.use(middlewareErrorHandler);

if (process.env.NODE_ENV === "production") {
  app.get("*", (_: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

export default { server, serverHttps };