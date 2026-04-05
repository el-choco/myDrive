import { ObjectId } from "mongodb";
import { FileListQueryType } from "../types/file-types";
import { FolderListQueryType } from "../types/folder-types";

export interface FileQueryInterface {
  "metadata.owner": ObjectId | string;
  "metadata.parent"?: string;
  filename?: any;
  uploadDate?: any;
  "metadata.personalFile"?: boolean | null;
  "metadata.trashed"?: boolean | null;
  "metadata.hasThumbnail"?: boolean | null;
  "metadata.isVideo"?: boolean | null;
  "metadata.processingFile"?: boolean | null;
  _id?: any;
}

export const createFileQuery = ({
  userID,
  search,
  parent,
  startAtDate,
  startAtName,
  trashMode,
  mediaMode,
  sortBy,
  mediaFilter,
  typeFilter, // <-- Neu
  dateFilter, // <-- Neu
}: FileListQueryType & { typeFilter?: string; dateFilter?: string }) => {
  const query: FileQueryInterface = { "metadata.owner": userID };

  if (!mediaMode && (!search || search === "")) {
    query["metadata.parent"] = parent;
  }

  // --- FILENAME / TYPE LOGIK ---
  let filenameConditions: any = {};

  if (search && search !== "") {
    filenameConditions.$regex = new RegExp(search, "i");
  }

  if (typeFilter && typeFilter !== "all") {
    if (typeFilter === "folders") {
      query._id = new ObjectId("000000000000000000000000"); // Ordner gesucht = 0 Dateien!
    } else if (typeFilter === "docs") {
      filenameConditions.$regex = /\.(doc|docx|txt|rtf|odt|csv)$/i;
    } else if (typeFilter === "images") {
      query["metadata.hasThumbnail"] = true;
    } else if (typeFilter === "pdfs") {
      filenameConditions.$regex = /\.pdf$/i;
    }
  }

  if (sortBy === "alp_desc" && startAtName) {
    filenameConditions.$lt = startAtName;
  } else if (sortBy === "alp_asc" && startAtName) {
    filenameConditions.$gt = startAtName;
  }

  if (Object.keys(filenameConditions).length > 0) {
    query.filename = filenameConditions;
  }


  // --- DATUM / UPLOADDATE LOGIK ---
  let dateConditions: any = {};

  if (sortBy === "date_desc" && startAtDate) {
    dateConditions.$lt = new Date(startAtDate);
  } else if (sortBy === "date_asc" && startAtDate) {
    dateConditions.$gt = new Date(startAtDate);
  }

  if (dateFilter && dateFilter !== "all") {
    const now = new Date();
    if (dateFilter === "today") {
      now.setHours(0, 0, 0, 0);
    } else if (dateFilter === "week") {
      now.setDate(now.getDate() - 7);
    } else if (dateFilter === "month") {
      now.setDate(now.getDate() - 30);
    } else if (dateFilter === "year") {
      now.setFullYear(now.getFullYear(), 0, 1);
      now.setHours(0, 0, 0, 0);
    }
    dateConditions.$gte = now;
  }

  if (Object.keys(dateConditions).length > 0) {
    query.uploadDate = dateConditions;
  }


  if (trashMode) {
    query["metadata.trashed"] = true;
  } else {
    query["metadata.trashed"] = null;
  }

  if (mediaMode) {
    query["metadata.hasThumbnail"] = true;

    if (mediaFilter === "photos") {
      query["metadata.isVideo"] = false;
    } else if (mediaFilter === "videos") {
      query["metadata.isVideo"] = true;
    }
  }

  query["metadata.processingFile"] = null;

  return query;
};


export interface FolderQueryInterface {
  owner: ObjectId | string;
  parent?: string;
  name?: any;
  trashed?: boolean | null;
  createdAt?: any;
  _id?: any;
}

export const createFolderQuery = ({
  userID,
  search,
  parent,
  trashMode,
  typeFilter, // <-- Neu
  dateFilter, // <-- Neu
}: FolderListQueryType & { typeFilter?: string; dateFilter?: string }) => {
  const query: FolderQueryInterface = { owner: userID };

  if (search && search !== "") {
    query["name"] = new RegExp(search, "i");
  } else {
    query["parent"] = parent;
  }

  if (trashMode) {
    query["trashed"] = true;
  } else {
    query["trashed"] = null;
  }

  // --- TYP FILTER ---
  // Wenn ein Dateityp wie 'docs', 'pdfs' oder 'images' gesucht wird, verstecken wir die Ordner!
  if (typeFilter && typeFilter !== "all" && typeFilter !== "folders") {
    query._id = new ObjectId("000000000000000000000000"); 
  }

  // --- DATUM FILTER ---
  if (dateFilter && dateFilter !== "all") {
    const now = new Date();
    if (dateFilter === "today") now.setHours(0, 0, 0, 0);
    else if (dateFilter === "week") now.setDate(now.getDate() - 7);
    else if (dateFilter === "month") now.setDate(now.getDate() - 30);
    else if (dateFilter === "year") {
      now.setFullYear(now.getFullYear(), 0, 1);
      now.setHours(0, 0, 0, 0);
    }
    query.createdAt = { $gte: now }; // Ordner nutzen oft createdAt statt uploadDate
  }

  return query;
};