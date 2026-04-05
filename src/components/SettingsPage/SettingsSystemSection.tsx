import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import AlertIcon from "../../icons/AlertIcon";
import classNames from "classnames";
import axios from "axios";
import getBackendURL from "../../utils/getBackendURL";

const SettingsSystemSection = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Formular States
  const [storageLimit, setStorageLimit] = useState("50");
  const [blockAccountCreate, setBlockAccountCreate] = useState(false);
  const [videoThumbnails, setVideoThumbnails] = useState(true);
  const [secureCookies, setSecureCookies] = useState(false);
  
  // E-Mail States
  const [emailVerification, setEmailVerification] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [emailHost, setEmailHost] = useState("");
  const [emailApiKey, setEmailApiKey] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const res = await axios.get(`${getBackendURL()}/api/admin/env`, { withCredentials: true });
        const data = res.data;
        
        // Werte aus dem Backend in unsere States füllen
        setStorageLimit(data.STORAGE_LIMIT_GB || "50");
        setBlockAccountCreate(data.BLOCK_CREATE_ACCOUNT === "true");
        setVideoThumbnails(data.VIDEO_THUMBNAILS_ENABLED === "true");
        setSecureCookies(data.SECURE_COOKIES === "true");
        setEmailVerification(data.EMAIL_VERIFICATION === "true");
        setEmailAddress(data.EMAIL_ADDRESS || "");
        setEmailDomain(data.EMAIL_DOMAIN || "");
        setEmailHost(data.EMAIL_HOST || "");
        setEmailApiKey(data.EMAIL_API_KEY || "");
        setRemoteUrl(data.REMOTE_URL || "");
      } catch (e) {
        console.error("Error fetching env", e);
        toast.error("Fehler beim Laden der Systemeinstellungen.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchEnv();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Das JSON-Objekt, das wir an den Node.js Server senden
    const payload = {
      STORAGE_LIMIT_GB: storageLimit,
      BLOCK_CREATE_ACCOUNT: blockAccountCreate ? "true" : "false",
      VIDEO_THUMBNAILS_ENABLED: videoThumbnails ? "true" : "false",
      SECURE_COOKIES: secureCookies ? "true" : "false",
      EMAIL_VERIFICATION: emailVerification ? "true" : "false",
      EMAIL_ADDRESS: emailAddress,
      EMAIL_DOMAIN: emailDomain,
      EMAIL_HOST: emailHost,
      EMAIL_API_KEY: emailApiKey,
      REMOTE_URL: remoteUrl,
    };

    try {
      await axios.put(`${getBackendURL()}/api/admin/env`, payload, { withCredentials: true });
      toast.success(t("toast.settings_saved") || "Systemeinstellungen gespeichert!");
    } catch (e) {
      console.error("Error saving env", e);
      toast.error("Fehler beim Speichern der .env Datei.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="animate-fade-in p-4 text-[#5f6368]">{t("settings.loading_system") || "Lade Systemeinstellungen..."}</div>;
  }

  return (
    <div className="animate-fade-in">
      <h3 className="text-[18px] font-medium text-[#1f1f1f] mb-4 m-0">
        {t("settings.system_title") || "System & Umgebung (.env)"}
      </h3>

      <div className="bg-[#e8f0fe] p-4 rounded-xl text-sm text-[#1a73e8] mb-6 flex items-start select-none border border-[#d2e3fc]">
        <AlertIcon className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
        <p className="m-0 leading-5">
          {t("settings.system_warning") || "Änderungen hier überschreiben die .env Datei deines Servers. Damit diese wirksam werden, muss der Docker-Container (oder Node-Prozess) nach dem Speichern einmal neu gestartet werden."}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* BLOCK 1: Speicher & Zugriff */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <div className="px-6 py-4 bg-[#f8f9fa] border-b border-gray-200">
            <h4 className="m-0 text-[15px] font-medium text-[#1f1f1f]">{t("settings.sys_group_access") || "Speicherplatz & Zugriff"}</h4>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[14px] font-medium text-[#3c4043] mb-1">
                {t("settings.sys_storage_limit") || "Standard-Speicherlimit (GB)"}
              </label>
              <p className="text-[12px] text-[#5f6368] mb-3 m-0">
                {t("settings.sys_storage_desc") || "Speicherplatz, den neue Nutzer standardmäßig erhalten."}
              </p>
              <input
                type="number"
                min="1"
                value={storageLimit}
                onChange={(e) => setStorageLimit(e.target.value)}
                className="w-full max-w-[250px] border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md py-2 px-3 text-[#3c4043] text-[14px] outline-none transition-shadow"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-[14px] font-medium text-[#3c4043] m-0 mb-1">{t("settings.sys_block_register") || "Registrierung sperren"}</p>
                <p className="text-[12px] text-[#5f6368] m-0 max-w-[400px]">
                  {t("settings.sys_block_desc") || "Verhindert, dass neue Nutzer Konten erstellen können (BLOCK_CREATE_ACCOUNT)."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={blockAccountCreate} onChange={() => setBlockAccountCreate(!blockAccountCreate)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* BLOCK 2: E-Mail Setup */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <div className="px-6 py-4 bg-[#f8f9fa] border-b border-gray-200 flex justify-between items-center">
            <h4 className="m-0 text-[15px] font-medium text-[#1f1f1f]">{t("settings.sys_group_email") || "E-Mail Verifizierung"}</h4>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailVerification} onChange={() => setEmailVerification(!emailVerification)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
            </label>
          </div>
          
          <div className={classNames("p-6 grid gap-5 md:grid-cols-2", !emailVerification && "opacity-50 pointer-events-none")}>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4043] mb-1">Absender E-Mail (EMAIL_ADDRESS)</label>
              <input type="text" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} className="w-full border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md py-2 px-3 text-[#3c4043] text-[14px] outline-none" placeholder="noreply@mydrive.com" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4043] mb-1">E-Mail Domain (EMAIL_DOMAIN)</label>
              <input type="text" value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} className="w-full border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md py-2 px-3 text-[#3c4043] text-[14px] outline-none" placeholder="mydrive.com" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4043] mb-1">E-Mail Host (EMAIL_HOST)</label>
              <input type="text" value={emailHost} onChange={(e) => setEmailHost(e.target.value)} className="w-full border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md py-2 px-3 text-[#3c4043] text-[14px] outline-none" placeholder="smtp.mailgun.org" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4043] mb-1">API Key / Passwort (EMAIL_API_KEY)</label>
              <input type="password" value={emailApiKey} onChange={(e) => setEmailApiKey(e.target.value)} className="w-full border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md py-2 px-3 text-[#3c4043] text-[14px] outline-none" placeholder="••••••••••••••••" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-[#3c4043] mb-1">Remote URL (für Links in der E-Mail)</label>
              <input type="text" value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)} className="w-full border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md py-2 px-3 text-[#3c4043] text-[14px] outline-none" placeholder="https://cloud.meinedomain.de" />
            </div>
          </div>
        </div>

        {/* BLOCK 3: Sicherheit & Features */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <div className="px-6 py-4 bg-[#f8f9fa] border-b border-gray-200">
            <h4 className="m-0 text-[15px] font-medium text-[#1f1f1f]">{t("settings.sys_group_features") || "Sicherheit & Features"}</h4>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#3c4043] m-0 mb-1">Secure Cookies (HTTPS)</p>
                <p className="text-[12px] text-[#5f6368] m-0 max-w-[400px]">Zwingt Cookies dazu, nur über verschlüsselte Verbindungen gesendet zu werden.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={secureCookies} onChange={() => setSecureCookies(!secureCookies)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <p className="text-[14px] font-medium text-[#3c4043] m-0 mb-1">Video Thumbnails (FFmpeg benötigt)</p>
                <p className="text-[12px] text-[#5f6368] m-0 max-w-[400px]">Generiert automatisch Vorschaubilder für hochgeladene Videos.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={videoThumbnails} onChange={() => setVideoThumbnails(!videoThumbnails)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-8">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-2.5 rounded-full font-medium text-[14px] transition-colors outline-none border-none disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? "..." : t("settings.btn_save") || "Speichern"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsSystemSection;