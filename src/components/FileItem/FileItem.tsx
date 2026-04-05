import capitalize from "../../utils/capitalize";
import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useContextMenu } from "../../hooks/contextMenu";
import classNames from "classnames";
import { getFileColor, getFileExtension } from "../../utils/files";
import bytes from "bytes";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { setMainSelect, setMultiSelectMode } from "../../reducers/selected";
import PlayButtonIcon from "../../icons/PlayIcon";
import { setPopupSelect } from "../../reducers/selected";
import { FileInterface } from "../../types/file";
import getBackendURL from "../../utils/getBackendURL";
import dayjs from "dayjs";
import { getUserDetailedAPI } from "../../api/userAPI";
import { useTranslation } from "react-i18next";

interface FileItemProps {
  file: FileInterface;
}

const FileItem: React.FC<FileItemProps> = memo((props) => {
  const { file } = props;
  const elementSelected = useAppSelector((state) => {
    if (state.selected.mainSection.type !== "file") return false;
    return state.selected.mainSection.id === file._id;
  });
  const elementMultiSelected = useAppSelector((state) => {
    if (!state.selected.multiSelectMode) return false;
    const selected = state.selected.multiSelectMap[file._id];
    return selected && selected.type === "file";
  });
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const listView = useAppSelector((state) => state.general.listView);
  const thumbnailURL = `${getBackendURL()}/file-service/thumbnail/${
    file.metadata.thumbnailID
  }`;
  const hasThumbnail = file.metadata.hasThumbnail;
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const dispatch = useAppDispatch();
  const lastSelected = useRef(0);
  const { t } = useTranslation();
  const [userInitials, setUserInitials] = useState("U");

  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();
  const fileExtension = getFileExtension(file.filename, listView ? 3 : 4);

  const imageColor = getFileColor(file.filename);

  const formattedFilename = capitalize(file.filename);

  const formattedCreatedDate = useMemo(
    () => dayjs(file.uploadDate).format("MMM D, YYYY"),
    [file.uploadDate]
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserDetailedAPI();
        if (user && user.email) {
          setUserInitials(user.email.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const fileClick = (e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement, MouseEvent>) => {
    const multiSelectKey = e.metaKey || e.ctrlKey;

    if (multiSelectMode || multiSelectKey) {
      dispatch(
        setMultiSelectMode([
          {
            type: "file",
            id: file._id,
            file: file,
            folder: null,
          },
        ])
      );
      return;
    }

    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(
        setMainSelect({ file, id: file._id, type: "file", folder: null })
      );
      lastSelected.current = Date.now();
      return;
    }

    if (currentDate - lastSelected.current < 1500) {
      dispatch(setPopupSelect({ type: "file", file }));
    }

    lastSelected.current = Date.now();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement | HTMLTableRowElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "file", id: file._id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const fileIconSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-full h-full shrink-0"
    >
      <path
        d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
        fill={imageColor}
      />
    </svg>
  );

  const ownerAvatar = (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center bg-transparent">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#5f6368]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
      <p className={classNames(
        "m-0 text-[14px]",
        (elementSelected || elementMultiSelected) ? "text-[#001d35]" : "text-[#1f1f1f]"
      )}>{t("folders.owner_me")}</p>
    </div>
  );

  if (listView) {
    return (
      <tr
        draggable={true}
        onDragStart={handleDragStart}
        className={classNames(
          "text-[14px] font-normal border-b border-gray-100 cursor-pointer transition-colors duration-200 group",
          (elementSelected || elementMultiSelected)
            ? "bg-[#c2e7ff] hover:bg-[#b5e0ff]"
            : "bg-white hover:bg-[#f1f3f4]"
        )}
        onClick={fileClick}
        onContextMenu={onContextMenu}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <td className="p-3 pl-4 rounded-l-full overflow-hidden">
          <div className="flex items-center w-full">
            <span className="inline-flex items-center justify-center mr-3 w-6 h-6 shrink-0">
              {fileIconSvg}
            </span>
            <p className={classNames(
              "m-0 truncate font-medium",
              (elementSelected || elementMultiSelected) ? "text-[#001d35]" : "text-[#1f1f1f]"
            )}>
              {formattedFilename}
            </p>
          </div>
        </td>
        
        <td className="p-3 hidden md:table-cell">
           {ownerAvatar}
        </td>

        <td className="p-3 hidden fileListShowDetails:table-cell">
          <p className={classNames(
            "text-sm whitespace-nowrap m-0",
            (elementSelected || elementMultiSelected) ? "text-[#001d35] opacity-80" : "text-[#5f6368]"
          )}>
            {formattedCreatedDate}
          </p>
        </td>

        <td className="p-3 hidden fileListShowDetails:table-cell">
          <p className={classNames(
            "text-sm m-0",
            (elementSelected || elementMultiSelected) ? "text-[#001d35] opacity-80" : "text-[#5f6368]"
          )}>
            {bytes(props.file.length)}
          </p>
        </td>
        
        <td className="p-3 rounded-r-full">
          <div className="flex justify-end items-center pr-2">
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
              className="p-2 rounded-full hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100"
              onClick={onContextMenu}
            >
              <svg className={classNames(
                  "w-5 h-5",
                  (elementSelected || elementMultiSelected) ? "text-[#001d35]" : "text-[#5f6368]"
                )} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
          </div>
        </td>
      </tr>
    );
  } else {
    return (
      <div
        draggable={true}
        onDragStart={handleDragStart}
        className={classNames(
          "rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col h-[200px] border",
          (elementSelected || elementMultiSelected)
            ? "border-transparent bg-[#c2e7ff] hover:bg-[#b5e0ff]"
            : "border-[#dadce0] bg-[#f8f9fa] hover:bg-[#f1f3f4]"
        )}
        onClick={fileClick}
        onContextMenu={onContextMenu}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
        
        <div className="w-full h-[140px] bg-[#f1f3f4] relative flex items-center justify-center overflow-hidden border-b border-[#dadce0]">
          {hasThumbnail && (
            <>
              <img
                className={classNames(
                  "object-cover w-full h-full disable-force-touch transition-opacity duration-300",
                  thumbnailLoaded ? "opacity-100" : "opacity-0"
                )}
                src={thumbnailURL}
                onLoad={() => setThumbnailLoaded(true)}
                alt={file.filename}
              />
              {file.metadata.isVideo && thumbnailLoaded && (
                <div className="absolute inset-0 flex justify-center items-center bg-black/20">
                  <PlayButtonIcon className="w-12 h-12 text-white opacity-90 drop-shadow-md" />
                </div>
              )}
            </>
          )}
          {(!hasThumbnail || !thumbnailLoaded) && (
            <div className="w-16 h-16 opacity-80">
              {fileIconSvg}
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col justify-center h-[60px] bg-transparent">
          <div className="flex items-center w-full">
            <span className="w-5 h-5 shrink-0 mr-2 opacity-90">
               {fileIconSvg}
            </span>
            <p
              className={classNames(
                "m-0 text-[13px] font-medium truncate",
                (elementSelected || elementMultiSelected)
                  ? "text-[#001d35]"
                  : "text-[#3c4043]"
              )}
            >
              {formattedFilename}
            </p>
          </div>
          <div className="flex items-center mt-1 pl-7">
            <p
              className={classNames(
                "m-0 text-[11px] truncate",
                (elementSelected || elementMultiSelected)
                  ? "text-[#001d35] opacity-70"
                  : "text-[#5f6368]"
              )}
            >
              {formattedCreatedDate} • {bytes(props.file.length)}
            </p>
          </div>
        </div>
      </div>
    );
  }
});

export default FileItem;