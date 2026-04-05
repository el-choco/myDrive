import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { downloadFileAPI } from "../../api/filesAPI";
import CloseIcon from "../../icons/CloseIcon";
import ActionsIcon from "../../icons/ActionsIcon";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import { resetPopupSelect } from "../../reducers/selected";
import { getFileColor } from "../../utils/files";
import bytes from "bytes";
import dayjs from "dayjs";
import LockIcon from "../../icons/LockIcon";
import OneIcon from "../../icons/OneIcon";
import PublicIcon from "../../icons/PublicIcon";
import StorageIcon from "../../icons/StorageIcon";
import CalendarIcon from "../../icons/CalendarIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import { toast } from "react-toastify";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const FileInfoPopup = () => {
  const file = useAppSelector((state) => state.selected.popupModal.file)!;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();
  const [animate, setAnimate] = useState(false);

  const imageColor = getFileColor(file.filename);

  const formattedDate = useMemo(
    () => dayjs(file.uploadDate).format("MMM D, YYYY"),
    [file.uploadDate]
  );

  const fileSize = bytes(file.metadata.size);

  const closePhotoViewer = () => {
    setAnimate(false);
    setTimeout(() => dispatch(resetPopupSelect()), 200);
  };

  const downloadItem = () => {
    downloadFileAPI(file._id);
  };

  const outterWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLDivElement).id !== "outer-wrapper" ||
      contextMenuState.selected
    ) {
      return;
    }
    setAnimate(false);
    setTimeout(() => dispatch(resetPopupSelect()), 200);
  };

  const permissionText = (() => {
    if (file.metadata.linkType === "one") {
      return t("share_popup.type_temporary");
    } else if (file.metadata.linkType === "public") {
      return t("share_popup.type_public");
    } else {
      return t("share_popup.type_private");
    }
  })();

  const copyName = () => {
    navigator.clipboard.writeText(file.filename);
    toast.success(t("toast.link_copied")); // Using copied generic toast
  };

  useEffect(() => {
    setAnimate(true);
  }, []);

  useEffect(() => {
    const handleBack = () => {
      dispatch(resetPopupSelect());
    };
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  const fileIconSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-full h-full"
    >
      <path
        d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
        fill={imageColor}
      />
    </svg>
  );

  return (
    <div
      className="w-screen dynamic-height bg-black/40 backdrop-blur-sm absolute top-0 left-0 right-0 bottom-0 z-[60] flex justify-center items-center flex-col transition-opacity duration-200"
      id="outer-wrapper"
      onClick={outterWrapperClick}
    >
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation} className="z-[70]">
          <ContextMenu
            quickItemMode={false}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            file={file}
          />
        </div>
      )}
      
      <div
        className={classNames(
          "bg-white w-full max-w-[480px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out transform",
          animate ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100">
          <div className="flex items-center flex-1 min-w-0 pr-4">
             <div className="flex flex-col w-full">
                <p className="text-[#1f1f1f] text-[18px] font-medium m-0 truncate">
                   {file.filename}
                </p>
                <div className="flex items-center mt-1">
                  <span className="w-4 h-4 mr-1.5 opacity-80 shrink-0">
                    {fileIconSvg}
                  </span>
                  <p className="text-[#5f6368] text-[13px] truncate m-0 font-medium">
                     {t("right_section.info_title")}
                  </p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div 
              onClick={onContextMenu}
              className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
            >
              <ActionsIcon className="w-5 h-5 text-[#5f6368]" />
            </div>
            <div 
              className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
              onClick={closePhotoViewer}
            >
              <CloseIcon className="w-5 h-5 text-[#5f6368]" />
            </div>
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
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded-full text-[14px] font-medium transition-colors flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
              onClick={downloadItem}
            >
              <DownloadIcon className="w-5 h-5" />
              <span>{t("context_menu.download")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInfoPopup;