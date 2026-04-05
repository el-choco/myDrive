import { v2 as webdav } from "webdav-server";
import { Readable, Writable, PassThrough } from "stream";
import mongoose from "mongoose";
import MongoFile from "../../models/file-model";
import Folder from "../../models/folder-model";
import User from "../../models/user-model";
import crypto from "crypto";
import MongoFileService from "../file-service/file-service";
import FolderService from "../folder-service/folder-service";
import { v4 as uuid } from "uuid";
import { getStorageActions } from "../chunk-service/actions/helper-actions";
import { createGenericParams } from "../chunk-service/utils/storageHelper";

const storageActions = getStorageActions();

class MongoFSSerializer implements webdav.FileSystemSerializer {
  uid(): string {
    return "MongoFSSerializer_1.0.0";
  }
  serialize(fs: webdav.FileSystem, callback: webdav.ReturnCallback<any>): void {
    callback(null as any, {});
  }
  unserialize(
    serializedData: any,
    callback: webdav.ReturnCallback<webdav.FileSystem>
  ): void {
    callback(null as any, new MongoFileSystem());
  }
}

export class MongoFileSystem extends webdav.FileSystem {
  private localLockManager: webdav.ILockManager;
  private localPropertyManager: webdav.IPropertyManager;

  constructor() {
    super(new MongoFSSerializer());
    this.localLockManager = new webdav.LocalLockManager();
    this.localPropertyManager = new webdav.LocalPropertyManager();
  }

  protected _lockManager(
    path: webdav.Path,
    ctx: webdav.LockManagerInfo,
    callback: webdav.ReturnCallback<webdav.ILockManager>
  ): void {
    callback(null as any, this.localLockManager);
  }

  protected _propertyManager(
    path: webdav.Path,
    ctx: webdav.PropertyManagerInfo,
    callback: webdav.ReturnCallback<webdav.IPropertyManager>
  ): void {
    callback(null as any, this.localPropertyManager);
  }

  async resolvePath(ownerId: string, path: webdav.Path): Promise<any> {
    if (path.isRoot()) {
      return { type: "folder", id: "/" };
    }

    let currentParent = "/";
    let currentItem: any = null;
    let type: "folder" | "file" = "folder";

    for (let i = 0; i < path.paths.length; i++) {
      const name = path.paths[i];
      const isLast = i === path.paths.length - 1;

      const folder = await Folder.findOne({
        owner: ownerId,
        parent: currentParent,
        name: name,
        trashed: null,
      });

      if (folder) {
        currentParent = folder._id.toString();
        currentItem = folder;
        type = "folder";
        continue;
      }

      if (isLast) {
        const file = await MongoFile.findOne({
          "metadata.owner": ownerId,
          "metadata.parent": currentParent,
          filename: name,
          "metadata.trashed": null,
        });

        if (file) {
          currentItem = file;
          type = "file";
          continue;
        }
      }

      return null;
    }

    return { type, item: currentItem, id: currentItem._id.toString() };
  }

  protected _fastExistCheck(
    ctx: webdav.RequestContext,
    path: webdav.Path,
    callback: (exists: boolean) => void
  ): void {
    const uid = ctx.user ? ctx.user.uid : "";
    this.resolvePath(uid, path)
      .then((res) => callback(!!res))
      .catch(() => callback(false));
  }

  protected _type(
    path: webdav.Path,
    ctx: webdav.TypeInfo,
    callback: webdav.ReturnCallback<webdav.ResourceType>
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";
    this.resolvePath(uid, path)
      .then((res) => {
        if (!res) return callback(webdav.Errors.ResourceNotFound);
        callback(
          null as any,
          res.type === "folder"
            ? webdav.ResourceType.Directory
            : webdav.ResourceType.File
        );
      })
      .catch((e) => callback(e as Error));
  }

  protected _readDir(
    path: webdav.Path,
    ctx: webdav.ReadDirInfo,
    callback: webdav.ReturnCallback<string[] | webdav.Path[]>
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";
    this.resolvePath(uid, path)
      .then(async (res) => {
        if (!res || res.type === "file")
          return callback(webdav.Errors.ResourceNotFound);

        const parentId = res.id;
        const folders = await Folder.find({
          owner: uid,
          parent: parentId,
          trashed: null,
        });
        const files = await MongoFile.find({
          "metadata.owner": uid,
          "metadata.parent": parentId,
          "metadata.trashed": null,
        });

        const names = [
          ...folders.map((f) => f.name),
          ...files.map((f) => f.filename),
        ];
        callback(null as any, names);
      })
      .catch((e) => callback(e as Error));
  }

  protected _size(
    path: webdav.Path,
    ctx: webdav.SizeInfo,
    callback: webdav.ReturnCallback<number>
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";
    this.resolvePath(uid, path)
      .then((res) => {
        if (!res) return callback(webdav.Errors.ResourceNotFound);
        if (res.type === "folder") return callback(null as any, 0);
        
        const size = (res.item && res.item.metadata && res.item.metadata.size) ? res.item.metadata.size : 0;
        callback(null as any, size);
      })
      .catch((e) => callback(e as Error));
  }

  protected _lastModifiedDate(
    path: webdav.Path,
    ctx: webdav.LastModifiedDateInfo,
    callback: webdav.ReturnCallback<number>
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";
    this.resolvePath(uid, path)
      .then((res) => {
        if (!res) return callback(webdav.Errors.ResourceNotFound);
        if (res.id === "/") return callback(null as any, Date.now());
        
        const date = res.type === "folder" ? res.item.updatedAt : res.item.uploadDate;
        const validDate = date ? new Date(date).getTime() : Date.now();
        
        callback(null as any, validDate);
      })
      .catch((e) => callback(e as Error));
  }

  protected _openReadStream(
    path: webdav.Path,
    ctx: webdav.OpenReadStreamInfo,
    callback: webdav.ReturnCallback<Readable>
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";
    
    this.resolvePath(uid, path)
      .then(async (res) => {
        if (!res || res.type !== "file") {
          return callback(webdav.Errors.ResourceNotFound);
        }

        const file = res.item;
        const user = await User.findById(uid);
        
        if (!user) return callback(webdav.Errors.ResourceNotFound);

        const password = user.getEncryptionKey();
        if (!password) return callback(new Error("Invalid Encryption Key"));

        const readStreamParams = createGenericParams({
          filePath: file.metadata.filePath,
          Key: file.metadata.s3ID,
        });
        
        const readStream = (storageActions as any).createReadStream(readStreamParams);

        const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();
        const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, file.metadata.IV);

        const outStream = readStream.pipe(decipher);

        callback(null as any, outStream as Readable);
      })
      .catch((e) => callback(e as Error));
  }

  // --- NEU: ERSTELLEN VON DATEIEN & ORDNERN ---
  protected _create(
    path: webdav.Path,
    ctx: webdav.CreateInfo,
    callback: webdav.SimpleCallback
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";
    if (!uid) return callback(new Error("Unauthorized") as any);

    if (ctx.type === webdav.ResourceType.Directory) {
      // Ordner erstellen (Rechtsklick -> Neuer Ordner in WinSCP)
      this.resolvePath(uid, path.getParent())
        .then(async (parentRes) => {
          if (!parentRes || parentRes.type !== "folder") {
            return callback(webdav.Errors.ResourceNotFound);
          }

          const folderName = path.paths[path.paths.length - 1];
          const parentListStr = parentRes.id !== "/"
            ? [...(parentRes.item.parentList || []), parentRes.id].toString()
            : "/";

          const newFolder = new Folder({
            name: folderName,
            owner: uid,
            parent: parentRes.id,
            parentList: parentListStr,
            color: "#000000",
            trashed: null,
          });

          await newFolder.save();
          callback();
        })
        .catch((e) => callback(e as Error));
    } else {
      // Datei wird erstellt. WebDAV holt sich jetzt das 'GO' von uns,
      // um direkt im Anschluss unseren Upload-Stream aufzurufen!
      callback();
    }
  }

  // --- NEU: DATEIEN & ORDNER LÖSCHEN ---
  protected _delete(
    path: webdav.Path,
    ctx: webdav.DeleteInfo,
    callback: webdav.SimpleCallback
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";
    
    this.resolvePath(uid, path)
      .then(async (res) => {
        if (!res) return callback(webdav.Errors.ResourceNotFound);

        try {
          // Wir setzen die Datei/den Ordner nativ in der DB auf trashed
          if (res.type === "file") {
            await MongoFile.findByIdAndUpdate(res.id, { "metadata.trashed": true });
          } else if (res.type === "folder") {
            await Folder.findByIdAndUpdate(res.id, { trashed: true });
          }
          callback();
        } catch (e) {
          callback(e as Error);
        }
      })
      .catch((e) => callback(e as Error));
  }

  protected _move(
    pathFrom: webdav.Path,
    pathTo: webdav.Path,
    ctx: webdav.MoveInfo,
    callback: webdav.ReturnCallback<boolean>
  ): void {
    const uid = ctx.context.user ? ctx.context.user.uid : "";

    Promise.all([
      this.resolvePath(uid, pathFrom),
      this.resolvePath(uid, pathTo.getParent())
    ])
      .then(async ([source, destParent]) => {
        if (!source || !destParent) return callback(webdav.Errors.ResourceNotFound);

        const oldName = pathFrom.paths[pathFrom.paths.length - 1];
        const newName = pathTo.paths[pathTo.paths.length - 1];
        const isRename = oldName !== newName;
        const isMove = pathFrom.getParent().toString() !== pathTo.getParent().toString();

        try {
          const fileService = new MongoFileService();
          const folderService = new FolderService();

          if (source.type === "file") {
            if (isRename) await fileService.renameFile(uid, source.id, newName);
            if (isMove) await fileService.moveFile(uid, source.id, destParent.id);
          } else if (source.type === "folder") {
            if (isRename) await folderService.renameFolder(uid, source.id, newName);
            if (isMove) await folderService.moveFolder(uid, source.id, destParent.id);
          }
          
          callback(null as any, true);
        } catch (e) {
          callback(e as Error);
        }
      })
      .catch((e) => callback(e as Error));
  }

  protected _openWriteStream(
    path: webdav.Path,
    ctx: webdav.OpenWriteStreamInfo,
    callback: webdav.ReturnCallback<Writable>
  ): void {
    console.log(`[WebDAV] Upload gestartet: ${path.toString()}`);

    const pt = new PassThrough();
    callback(null as any, pt);

    (async () => {
      try {
        const uid = ctx.context.user ? ctx.context.user.uid : "";
        const parentPath = path.getParent();
        const filename = path.paths[path.paths.length - 1];

        const parentRes = await this.resolvePath(uid, parentPath);
        if (!parentRes || parentRes.type !== "folder") {
          console.error("[WebDAV] Fehler: Parent-Ordner nicht gefunden.");
          return pt.end();
        }

        const user = await User.findById(uid);
        if (!user) {
          console.error("[WebDAV] Fehler: User nicht gefunden.");
          return pt.end();
        }

        const password = user.getEncryptionKey();
        if (!password) {
          console.error("[WebDAV] Fehler: Kein Encryption Key vorhanden.");
          return pt.end();
        }

        const IV = crypto.randomBytes(16);
        const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();
        const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, IV);

        const s3ID = uuid();
        const filePath = `webdav-${Date.now()}-${s3ID}`; 

        const writeStreamParams = createGenericParams({
          filePath: filePath,
          Key: s3ID,
        });

        let size = 0;
        pt.on("data", (chunk) => {
          size += chunk.length;
        });

        const encryptedStream = pt.pipe(cipher);

        const storageResult = (storageActions as any).createWriteStream(
          writeStreamParams,
          encryptedStream,
          filePath
        );

        const saveDb = async () => {
          try {
            let parentListStr = "/";
            if (parentRes.id !== "/") {
              const pList = parentRes.item.parentList || [];
              parentListStr = [...pList, parentRes.id].toString();
            }

            const newFile = new MongoFile({
              length: size,
              chunkSize: 261120,
              uploadDate: new Date(),
              filename: filename,
              metadata: {
                owner: uid,
                parent: parentRes.id,
                parentList: parentListStr,
                hasThumbnail: false,
                isVideo: false,
                size: size,
                IV: IV,
                filePath: filePath,
                s3ID: s3ID,
                personalFile: false,
                trashed: null,
                processingFile: null
              },
            });
            
            await newFile.save();
            console.log(`[WebDAV] ERFOLG! Datei ${filename} in der Datenbank gespeichert.`);
          } catch (dbErr) {
            console.error("[WebDAV] Datenbank Speicher-Fehler:", dbErr);
          }
        };

        if (storageResult && storageResult.writeStream) {
          encryptedStream.pipe(storageResult.writeStream);
          storageResult.writeStream.on("finish", saveDb);
          storageResult.writeStream.on("error", (err: any) => console.error("WriteStream Fehler:", err));
        } else if (storageResult && typeof storageResult.then === "function") {
          storageResult.then(saveDb).catch((err: any) => console.error("S3 Upload Fehler:", err));
        } else {
          encryptedStream.on("end", saveDb);
        }

        encryptedStream.on("error", (err) => console.error("Verschlüsselungs-Fehler:", err));

      } catch (globalError) {
        console.error("Kritischer Fehler im WebDAV Upload:", globalError);
        pt.end();
      }
    })();
  }
}