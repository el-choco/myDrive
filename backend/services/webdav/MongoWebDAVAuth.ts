import { v2 as webdav } from "webdav-server";
import User from "../../models/user-model";
import bcrypt from "bcryptjs";

export class MongoWebDAVAuth implements webdav.HTTPAuthentication {
  
  // Sagt dem Client (Windows/Nextcloud), dass er das Passwort-Fenster zeigen soll
  askForAuthentication(ctx: webdav.HTTPRequestContext): { [headerName: string]: string } {
    return {
      "WWW-Authenticate": 'Basic realm="MyDrive WebDAV"'
    };
  }

  // Prüft die E-Mail und das Passwort in der MongoDB
  async getUser(
    ctx: webdav.HTTPRequestContext,
    callback: (error: Error, user?: webdav.IUser) => void
  ) {
    const authHeader = ctx.request.headers.authorization;
    if (!authHeader) return callback(webdav.Errors.BadAuthentication);

    const match = /^Basic\s+(.*)$/i.exec(authHeader);
    if (!match) return callback(webdav.Errors.BadAuthentication);

    // Entschlüsselt "email:passwort"
    const [email, password] = Buffer.from(match[1], "base64")
      .toString("utf8")
      .split(":");

    try {
      // Nutzer in MongoDB suchen
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return callback(webdav.Errors.BadAuthentication);

      // Passwort prüfen
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return callback(webdav.Errors.BadAuthentication);

// WebDAV-kompatibles User-Objekt erstellen
      const wUser: webdav.IUser = {
          uid: user._id.toString(),
          username: user.email, // <--- DAS HAT GEFEHLT
          isAdministrator: false
      };

      callback(null as any, wUser);
    } catch (e) {
      callback(e as Error);
    }
  }
}