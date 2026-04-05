import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  downloadPublicFileAPI,
  getPublicFileInfoAPI,
} from "../../api/filesAPI";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "../Spinner/Spinner";
import dayjs from "dayjs";
import { getFileColor, getFileExtension } from "../../utils/files";
import { FileInterface } from "../../types/file";
import bytes from "bytes";
import LockIcon from "../../icons/LockIcon";
import OneIcon from "../../icons/OneIcon";
import StorageIcon from "../../icons/StorageIcon";
import CalendarIcon from "../../icons/CalendarIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import PublicIcon from "../../icons/PublicIcon";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

const PublicDownloadPage = () => {
  const [file, setFile] = useState<FileInterface | null>(null);
  const params = useParams();
  const { t } = useTranslation();

  const getFile = useCallback(async () => {
    try {
      const id = params.id!;
      const tempToken = params.tempToken!;
      const fileResponse = await getPublicFileInfoAPI(id, tempToken);
      setFile(fileResponse);
    } catch (e) {
      console.log("Error getting publicfile info", e);
      toast.error(t("toast.error_getting_public"));
    }
  }, [params.id, params.tempToken, t]);

  const downloadItem = () => {
    const id = params.id!;
    const tempToken = params.tempToken!;
    downloadPublicFileAPI(id, tempToken);
  };

  const permissionText = (() => {
    if (!file) return "";
    if (file.metadata.linkType === "one") {
      return t("share_popup.type_temporary");
    } else if (file.metadata.linkType === "public") {
      return t("share_popup.type_public");
    } else {
      return t("share_popup.type_private");
    }
  })();

  const copyName = () => {
    navigator.clipboard.writeText(file!.filename);
    toast.success(t("toast.link_copied"));
  };

  useEffect(() => {
    getFile();
  }, [getFile]);

  // Google Drive Logo
  const driveLogoSvg = (
    <svg className="w-9 h-9 object-contain" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.42 28.58L24.58 12.5H40L30.84 28.58H15.42Z" fill="#FFC107"/>
      <path d="M0 28.58L9.16 12.5L16.84 25.84L7.68 41.92L0 28.58Z" fill="#1976D2"/>
      <path d="M15.42 28.58H30.84L23.16 41.92H7.68L15.42 28.58Z" fill="#4CAF50"/>
      <path d="M24.58 12.5L15.42 28.58L23.16 41.92L40 12.5H24.58Z" fill="#FFC107" fillOpacity="0.4"/>
      <path d="M0 28.58L7.68 41.92L23.16 41.92L9.16 12.5L0 28.58Z" fill="#1976D2" fillOpacity="0.4"/>
      <path d="M7.68 41.92L23.16 41.92L30.84 28.58L15.42 28.58L7.68 41.92Z" fill="#4CAF50" fillOpacity="0.4"/>
      <path d="M15.42 28.58L24.58 12.5L9.16 12.5L0 28.58L15.42 28.58Z" fill="#FFC107"/>
      <path d="M24.58 12.5H40L30.84 28.58H15.42L24.58 12.5Z" fill="#4CAF50"/>
      <path d="M30.84 28.58L23.16 41.92H7.68L15.42 28.58H30.84Z" fill="#1976D2"/>
    </svg>
  );

  if (!file) {
    return (
      <div className="w-screen dynamic-height flex justify-center items-center bg-[#f0f4f9]">
        <Spinner />
        <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
      </div>
    );
  }

  const fileExtension = getFileExtension(file.filename, 3);
  const imageColor = getFileColor(file.filename);
  const formattedDate = dayjs(file.uploadDate).format("MMM D, YYYY");
  const fileSize = bytes(file.metadata.size);

  const fileIconSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" fill={imageColor} />
    </svg>
  );

  return (
    <div className="bg-[#f0f4f9] w-screen min-h-screen flex flex-col font-sans relative">
      <div className="w-full p-4 flex items-center bg-white shadow-sm border-b border-gray-200">
         <div className="flex items-center gap-2">
           {driveLogoSvg}
           <span className="text-[#5f6368] text-[22px] tracking-tight">Drive</span>
         </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex flex-col">
          
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
             <div className="flex items-center flex-1 min-w-0 pr-4">
               <span className="w-8 h-8 shrink-0 mr-3">
                 {fileIconSvg}
               </span>
               <h2 className="m-0 text-[18px] font-medium text-[#1f1f1f] truncate">
                 {file.filename}
               </h2>
             </div>
          </div>

          <div className="p-6">
            <div className="flex items-center bg-[#f1f3f4] rounded-full p-1 pl-4 mb-6 border border-transparent hover:border-gray-300 transition-colors focus-within:border-[#1a73e8] focus-within:bg-white focus-within:shadow-sm overflow-hidden h-[44px]">
              <input
                className="bg-transparent border-none outline-none text-[#3c4043] text-[13px] w-full h-full"
                value={file.filename}
                readOnly
              />
              <button
                className="px-4 py-1.5 rounded-full text-[13px] font-medium bg-white text-[#1a73e8] hover:bg-[#f8f9fa] shadow-sm cursor-pointer shrink-0 outline-none border-none ml-2 mr-1"
                onClick={copyName}
              >
                {t("share_popup.copy_link").replace("Link", t("files.col_name"))}
              </button>
            </div>

            <p className="text-[14px] font-medium text-[#3c4043] mb-4 m-0">{t("download_page.file_details")}</p>
            
            <div className="flex flex-col gap-4 px-2">
              <div className="flex items-center">
                <div className="w-8 flex justify-center shrink-0">
                  {!file.metadata.linkType && <LockIcon className="w-5 h-5 text-[#5f6368]" />}
                  {file.metadata.linkType === "one" && <OneIcon className="w-5 h-5 text-[#5f6368]" />}
                  {file.metadata.linkType === "public" && <PublicIcon className="w-5 h-5 text-[#5f6368]" />}
                </div>
                <p className="m-0 text-[#3c4043] text-[14px]">{permissionText}</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 flex justify-center shrink-0">
                  <StorageIcon className="w-5 h-5 text-[#5f6368]" />
                </div>
                <p className="m-0 text-[#3c4043] text-[14px]">{fileSize}</p>
              </div>

              <div className="flex items-center">
                <div className="w-8 flex justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5 text-[#5f6368]" />
                </div>
                <p className="m-0 text-[#3c4043] text-[14px]">{formattedDate}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-2.5 rounded-full text-[14px] font-medium transition-colors flex items-center justify-center gap-2 outline-none border-none cursor-pointer shadow-md"
                onClick={downloadItem}
              >
                <DownloadIcon className="w-5 h-5" />
                <span>{t("context_menu.download")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default PublicDownloadPage;