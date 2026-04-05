import bytes from "bytes";
import { memo, useMemo, useEffect, useState } from "react";
import classNames from "classnames";
import { getFileColor, getFileExtension } from "../../utils/files";
import { useAppSelector } from "../../hooks/store";
import CloseIcon from "../../icons/CloseIcon";
import FileDetailsIcon from "../../icons/FileDetailsIcon";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const RightSection = memo(() => {
  const selectedItem = useAppSelector((state) => state.selected.mainSection);
  const { t } = useTranslation();
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openDetails = () => setIsOpen(true);
    const closeDetails = () => setIsOpen(false);

    window.addEventListener("open-details", openDetails);
    window.addEventListener("close-details", closeDetails);

    return () => {
      window.removeEventListener("open-details", openDetails);
      window.removeEventListener("close-details", closeDetails);
    };
  }, []);

  const closeRightSection = () => {
    window.dispatchEvent(new Event("close-details"));
  };

  const formattedName = useMemo(() => {
    if (!selectedItem.id) return "";
    const name = selectedItem.file?.filename || selectedItem.folder?.name || "";
    const maxLength = 66;
    const ellipsis = "...";
    if (name.length <= maxLength) {
      return name;
    }
    const startLength = Math.ceil((maxLength - ellipsis.length) / 2);
    const endLength = Math.floor((maxLength - ellipsis.length) / 2);
    return `${name.slice(0, startLength)}${ellipsis}${name.slice(-endLength)}`;
  }, [selectedItem?.id, selectedItem?.file?.filename, selectedItem?.folder?.name]);

  const formattedDate = useMemo(() => {
    const date = selectedItem.file?.uploadDate || selectedItem.folder?.createdAt;
    return dayjs(date).format("MMM D, YYYY");
  }, [selectedItem?.file?.uploadDate, selectedItem.folder?.createdAt]);

  const fileSize = bytes(selectedItem.file?.length || 0);

  const fileExtension = (() => {
    if (!selectedItem?.file?.filename) return null;
    return getFileExtension(selectedItem.file.filename);
  })();

  const imageColor = (() => {
    if (selectedItem.file) return getFileColor(selectedItem.file.filename);
    return "#5f6368";
  })();

  const fileIconSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      {selectedItem.folder ? (
        <path fill="currentColor" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      ) : (
        <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" fill={imageColor} />
      )}
    </svg>
  );

  // Der goldene Trick: Wenn zu, gibt es null zurück und die Liste wächst auf 100%
  if (!isOpen) return null;

  return (
    <div className="!hidden desktopMode:!flex min-w-[320px] max-w-[320px] bg-transparent right-0 justify-center relative transition-all duration-300">
      <div className="w-full h-[calc(100vh-80px)] bg-white rounded-2xl border border-gray-200 overflow-hidden ml-4 mb-4 flex flex-col shadow-sm">
        {selectedItem.id === "" ? (
          <div className="flex flex-col justify-center items-center text-center h-full p-8 relative">
             <div 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
                onClick={closeRightSection}
              >
                <CloseIcon className="w-5 h-5 text-[#5f6368]" />
              </div>
            <FileDetailsIcon className="w-16 h-16 text-[#dadce0] mb-4" />
            <p className="text-[#5f6368] text-[14px]">
              {t("right_section.empty_state")}
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center flex-1 min-w-0 pr-4">
                <span className="w-6 h-6 mr-3 shrink-0 text-[#5f6368]">
                  {fileIconSvg}
                </span>
                <p className="m-0 text-[#1f1f1f] text-[16px] font-medium truncate">
                  {formattedName}
                </p>
              </div>
              <div 
                className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors shrink-0"
                onClick={closeRightSection}
              >
                <CloseIcon className="w-5 h-5 text-[#5f6368]" />
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-[#1f1f1f] text-[16px] font-medium mb-6 m-0">
                {t("right_section.info_title")}
              </h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                  <span className="text-[#5f6368] text-[12px] font-medium mb-1">
                    {t("right_section.type")}
                  </span>
                  <span className="text-[#3c4043] text-[14px]">
                    {selectedItem.file ? fileExtension : t("right_section.type_folder")}
                  </span>
                </div>

                {selectedItem.file && (
                  <div className="flex flex-col">
                    <span className="text-[#5f6368] text-[12px] font-medium mb-1">
                      {t("right_section.size")}
                    </span>
                    <span className="text-[#3c4043] text-[14px]">
                      {fileSize}
                    </span>
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-[#5f6368] text-[12px] font-medium mb-1">
                    {t("right_section.created")}
                  </span>
                  <span className="text-[#3c4043] text-[14px]">
                    {formattedDate}
                  </span>
                </div>

                {selectedItem.file && (
                  <div className="flex flex-col">
                    <span className="text-[#5f6368] text-[12px] font-medium mb-1">
                      {t("right_section.access")}
                    </span>
                    <span className="text-[#3c4043] text-[14px]">
                      {selectedItem.file?.metadata.link 
                        ? t("right_section.access_public") 
                        : t("right_section.access_private")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default RightSection;