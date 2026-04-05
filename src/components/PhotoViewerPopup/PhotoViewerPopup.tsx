import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { deleteVideoTokenAPI, getVideoTokenAPI } from "../../api/filesAPI";
import CloseIcon from "../../icons/CloseIcon";
import ActionsIcon from "../../icons/ActionsIcon";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import {
  resetPopupSelect,
  setMainSelect,
  setPopupSelect,
} from "../../reducers/selected";
import CircleLeftIcon from "../../icons/CircleLeftIcon";
import CircleRightIcon from "../../icons/CircleRightIcon";
import { useFiles, useQuickFiles } from "../../hooks/files";
import { FileInterface } from "../../types/file";
import { InfiniteData } from "react-query";
import { getFileColor } from "../../utils/files";
import Spinner from "../Spinner/Spinner";
import { toast } from "react-toastify";
import getBackendURL from "../../utils/getBackendURL";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface PhotoViewerPopupProps {
  file: FileInterface;
}

const PhotoViewerPopup: React.FC<PhotoViewerPopupProps> = memo((props) => {
  const { file } = props;
  const [video, setVideo] = useState("");
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(
    file.metadata.hasThumbnail && !file.metadata.isVideo
  );
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const type = useAppSelector((state) => state.selected.popupModal.type)!;
  const thumbnailURL = `${getBackendURL()}/file-service/full-thumbnail/${
    file._id
  }`;
  const finalLastPageLoaded = useRef(false);
  const loadingNextPage = useRef(false);
  const { data: quickFiles } = useQuickFiles(false);
  const { data: files, fetchNextPage } = useFiles(false);
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

  const imageColor = getFileColor(file.filename);

  const getVideo = useCallback(async () => {
    try {
      setIsVideoLoading(true);
      setVideo("");
      await getVideoTokenAPI();
      const videoURL = `${getBackendURL()}/file-service/stream-video/${
        file._id
      }`;
      setVideo(videoURL);
      setIsVideoLoading(false);
    } catch (e) {
      console.log("Error getting video", e);
      toast.error(t("toast.error_getting_video"));
    }
  }, [file._id, t]);

  const cleanUpVideo = useCallback(async () => {
    if (!file.metadata.isVideo || !videoRef.current) return;

    deleteVideoTokenAPI();

    videoRef.current.pause();
    videoRef.current.src = "";
    setVideo("");
  }, [file._id, deleteVideoTokenAPI]);

  const findPrevFilesItem = (newFiles?: InfiniteData<FileInterface[]>) => {
    if (newFiles) {
      if (!newFiles?.pages) return 0;
      const filesFiltered = newFiles.pages
        .flat()
        .filter(
          (currentFile) =>
            currentFile.metadata.hasThumbnail || currentFile.metadata.isVideo
        );
      const index = filesFiltered.findIndex(
        (currentFile) => currentFile._id === file._id
      );
      const prevItem = filesFiltered[index - 1];
      return prevItem;
    } else {
      if (!files?.pages) return 0;
      const filesFiltered = files.pages
        .flat()
        .filter(
          (currentFile) =>
            currentFile.metadata.hasThumbnail || currentFile.metadata.isVideo
        );
      const index = filesFiltered.findIndex(
        (currentFile) => currentFile._id === file._id
      );
      const prevItem = filesFiltered[index - 1];
      return prevItem;
    }
  };

  const goToPreviousItem = async () => {
    if (type === "quick-item") {
      if (!quickFiles?.length) return 0;
      const filteredQuickFiles = quickFiles.filter(
        (currentFile) =>
          currentFile.metadata.hasThumbnail || currentFile.metadata.isVideo
      );
      const index = filteredQuickFiles.findIndex(
        (currentFile) => currentFile._id === file._id
      );
      const prevItem = filteredQuickFiles[index - 1];
      if (prevItem) {
        dispatch(setPopupSelect({ type: "quick-item", file: prevItem }));
        dispatch(
          setMainSelect({
            file: prevItem,
            id: prevItem._id,
            type: "file",
            folder: null,
          })
        );
      }
    } else {
      if (!files?.pages) return 0;
      const prevItem = findPrevFilesItem();
      if (prevItem) {
        dispatch(setPopupSelect({ type: "file", file: prevItem }));
        dispatch(
          setMainSelect({
            file: prevItem,
            id: prevItem._id,
            type: "file",
            folder: null,
          })
        );
      }
    }
  };

  const findNextFilesItem = (newFiles?: InfiniteData<FileInterface[]>) => {
    if (newFiles) {
      if (!newFiles?.pages) return 0;
      const filesFiltered = newFiles.pages
        .flat()
        .filter(
          (currentFile) =>
            currentFile.metadata.hasThumbnail || currentFile.metadata.isVideo
        );
      const index = filesFiltered.findIndex(
        (currentFile) => currentFile._id === file._id
      );
      const nextItem = filesFiltered[index + 1];
      return nextItem;
    } else {
      if (!files?.pages) return 0;
      const filesFiltered = files.pages
        .flat()
        .filter(
          (currentFile) =>
            currentFile.metadata.hasThumbnail || currentFile.metadata.isVideo
        );
      const index = filesFiltered.findIndex(
        (currentFile) => currentFile._id === file._id
      );
      const nextItem = filesFiltered[index + 1];
      return nextItem;
    }
  };

  const goToNextItem = async () => {
    if (type === "quick-item") {
      if (!quickFiles?.length) return;
      const filteredQuickFiles = quickFiles.filter(
        (currentFile) =>
          currentFile.metadata.hasThumbnail || currentFile.metadata.isVideo
      );
      const index = filteredQuickFiles.findIndex(
        (currentFile) => currentFile._id === file._id
      );
      const nextItem = filteredQuickFiles[index + 1];
      if (nextItem) {
        dispatch(setPopupSelect({ type: "quick-item", file: nextItem }));
        dispatch(
          setMainSelect({
            file: nextItem,
            id: nextItem._id,
            type: "file",
            folder: null,
          })
        );
      }
    } else {
      if (!files?.pages) return;
      const nextItem = findNextFilesItem();
      if (nextItem) {
        dispatch(setPopupSelect({ type: "file", file: nextItem }));
        dispatch(
          setMainSelect({
            file: nextItem,
            id: nextItem._id,
            type: "file",
            folder: null,
          })
        );
      } else if (!finalLastPageLoaded.current && !loadingNextPage.current) {
        loadingNextPage.current = true;
        const newFilesResponse = await fetchNextPage();
        if (!newFilesResponse.data?.pages) return;
        const fetchedNextItem = findNextFilesItem(newFilesResponse.data);
        if (fetchedNextItem) {
          dispatch(setPopupSelect({ type: "file", file: fetchedNextItem }));
          dispatch(
            setMainSelect({
              file: fetchedNextItem,
              id: fetchedNextItem._id,
              type: "file",
              folder: null,
            })
          );
        } else {
          finalLastPageLoaded.current = true;
        }
        loadingNextPage.current = false;
      }
    }
  };

  const closePhotoViewer = () => {
    dispatch(resetPopupSelect());
  };

  const outterWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id !== "outer-wrapper") {
      return;
    }
    closePhotoViewer();
  };

  useEffect(() => {
    if (file.metadata.isVideo) {
      getVideo();
    }

    return () => {
      cleanUpVideo();
    };
  }, [file.metadata.isVideo, getVideo, cleanUpVideo]);

  useEffect(() => {
    const handleBack = () => {
      closePhotoViewer();
    };
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  return (
    <div
      id="outer-wrapper"
      className="w-screen dynamic-height bg-black/90 absolute top-0 left-0 right-0 bottom-0 z-[100] flex justify-center items-center flex-col backdrop-blur-sm"
      onClick={outterWrapperClick}
    >
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation}>
          <ContextMenu
            quickItemMode={false}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            file={file}
          />
        </div>
      )}

      <div
        className="absolute top-0 left-0 w-full flex justify-between p-4 bg-gradient-to-b from-black/50 to-transparent z-10"
        id="actions-wrapper"
      >
        <div className="flex items-center pl-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 mr-3 opacity-90 shrink-0"
          >
            <path
              d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
              fill={imageColor}
            />
          </svg>
          <p className="text-[16px] font-medium text-white text-ellipsis overflow-hidden max-w-[200px] md:max-w-[600px] whitespace-nowrap select-none m-0 drop-shadow-md">
            {file.filename}
          </p>
        </div>
        <div className="flex items-center gap-2 pr-2">
          <div 
            onClick={onContextMenu} 
            className="p-2 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
          >
            <ActionsIcon className="text-white w-5 h-5 drop-shadow-md" />
          </div>

          <div 
            onClick={closePhotoViewer} 
            className="p-2 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
          >
            <CloseIcon className="text-white w-5 h-5 drop-shadow-md" />
          </div>
        </div>
      </div>
      
      <CircleLeftIcon
        onClick={goToPreviousItem}
        className="bottom-6 sm:bottom-1/2 fixed left-4 sm:left-8 text-white/70 hover:text-white w-12 h-12 select-none cursor-pointer transition-colors z-10 drop-shadow-lg"
      />
      <CircleRightIcon
        onClick={goToNextItem}
        className="bottom-6 sm:bottom-1/2 fixed right-4 sm:right-8 text-white/70 hover:text-white w-12 h-12 select-none cursor-pointer transition-colors z-10 drop-shadow-lg"
      />
      
      <div className="max-w-[95vw] sm:max-w-[85vw] max-h-[85vh] flex justify-center items-center relative">
        {isThumbnailLoading && !thumbnailError && (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        {!file.metadata.isVideo && (
          <img
            src={thumbnailURL}
            className={classNames(
              "max-w-full max-h-[85vh] object-contain select-none drop-shadow-2xl transition-opacity duration-300",
              {
                "opacity-0": isThumbnailLoading,
                "opacity-100": !isThumbnailLoading
              }
            )}
            onLoad={() => setIsThumbnailLoading(false)}
            onError={() => setThumbnailError(true)}
            alt={file.filename}
          />
        )}
        {thumbnailError && (
          <div className="bg-[#1f1f1f] p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-[#5f6368] mb-4">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                <polyline points="21 15 16 10 5 21" strokeWidth="2" />
             </svg>
            <p className="text-center text-[14px] text-white/80 font-medium m-0">{t("photo_viewer.error_loading")}</p>
          </div>
        )}
        {file.metadata.isVideo && !isVideoLoading && (
          <video
            src={video}
            ref={videoRef}
            className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl rounded-lg"
            controls
            autoPlay
          ></video>
        )}
        {file.metadata.isVideo && isVideoLoading && (
           <div className="absolute inset-0 flex justify-center items-center">
             <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
           </div>
        )}
      </div>
    </div>
  );
});

export default PhotoViewerPopup;