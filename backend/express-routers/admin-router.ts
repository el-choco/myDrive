import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// Greift auf die .env im Hauptverzeichnis des Backends zu
const envPath = path.join(process.cwd(), ".env");

// 1. Lade alle aktuellen .env Werte
router.get("/api/admin/env", (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(envPath)) {
      return res.status(404).json({ error: ".env Datei nicht gefunden" });
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    const envVars: any = {};
    
    // Liest die Datei Zeile für Zeile aus
    envContent.split("\n").forEach(line => {
      const match = line.match(/^([^#\s]+)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2].trim();
      }
    });
    
    res.json(envVars);
  } catch (e) {
    console.error("Error reading .env:", e);
    res.status(500).json({ error: "Fehler beim Lesen der .env Datei" });
  }
});

// 2. Überschreibe die .env Werte
router.put("/api/admin/env", (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(envPath)) {
      return res.status(404).json({ error: ".env Datei nicht gefunden" });
    }

    let envContent = fs.readFileSync(envPath, "utf8");
    const updates = req.body;
    
    for (const [key, value] of Object.entries(updates)) {
      // Sucht nach dem Key (z.B. STORAGE_LIMIT_GB=...)
      const regex = new RegExp(`^${key}=.*`, "m");
      if (regex.test(envContent)) {
        // Überschreibt den existierenden Wert
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        // Wenn der Wert noch gar nicht existiert, hängen wir ihn unten an
        envContent += `\n${key}=${value}`;
      }
    }
    
    // Schreibt die Datei sicher zurück
    fs.writeFileSync(envPath, envContent);
    res.json({ success: true });
  } catch (e) {
    console.error("Error writing .env:", e);
    res.status(500).json({ error: "Fehler beim Schreiben der .env Datei" });
  }
});

export default router;