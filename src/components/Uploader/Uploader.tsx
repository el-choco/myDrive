import { useAppDispatch, useAppSelector } from "../../hooks/store";
import CloseIcon from "../../icons/CloseIcon";
import MinimizeIcon from "../../icons/MinimizeIcon";
import { resetUploads } from "../../reducers/uploader";
import { cancelAllFileUploads } from "../../utils/cancelTokenManager";
import UploadItem from "../UploadItem/UploadItem";
import { memo, useMemo, useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const Uploader = memo(() => {
  const [minimized, setMinimized] = useState(false);
  const uploads = useAppSelector((state) => state.uploader.uploads);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const toggleMinimize = () => {
    setMinimized((val) => !val);
  };

  const uploadTitle = useMemo(() => {
    const uploadedCount = uploads.filter((upload) => upload.completed).length;
    const currentlyUploadingCount = uploads.filter(
      (upload) => !upload.completed
    ).length;

    if (currentlyUploadingCount) {
      return t("uploader.uploading", { count: currentlyUploadingCount });
    } else {
      return t("uploader.uploaded", { count: uploadedCount });
    }
  }, [uploads, t]);

  const closeUploader = () => {
    cancelAllFileUploads();
    dispatch(resetUploads());
  };

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-0 sm:bottom-6 sm:right-6 z-50 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:rounded-xl w-full sm:w-[360px] border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex flex-row bg-white justify-between p-3 border-b border-gray-100 items-center">
        <p className="text-[#3c4043] font-medium text-[15px] ml-2 m-0">{uploadTitle}</p>
        <div className="flex flex-row items-center justify-center gap-1">
          <div 
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors"
            onClick={toggleMinimize}
          >
            <MinimizeIcon className="w-5 h-5 text-[#5f6368]" />
          </div>
          <div 
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors"
            onClick={closeUploader}
          >
            <CloseIcon className="w-5 h-5 text-[#5f6368]" />
          </div>
        </div>
      </div>
      <div 
        className={classNames(
          "overflow-y-auto transition-all duration-300 ease-in-out bg-white",
          minimized ? "max-h-0" : "max-h-[350px]"
        )}
      >
        {uploads.map((upload) => {
          return <UploadItem key={upload.id} {...upload} />;
        })}
      </div>
    </div>
  );
});

export default Uploader;