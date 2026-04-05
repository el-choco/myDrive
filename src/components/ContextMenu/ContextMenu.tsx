import React, { memo, useEffect, useState } from "react";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import TrashIcon from "../../icons/TrashIcon";
import MultiSelectIcon from "../../icons/MultiSelectIcon";
import RenameIcon from "../../icons/RenameIcon";
import ShareIcon from "../../icons/ShareIcon";
import DownloadIcon from "../../icons/DownloadIcon";
import MoveIcon from "../../icons/MoveIcon";
import RestoreIcon from "../../icons/RestoreIcon";
import { FileInterface } from "../../types/file";
import { useNavigate } from "react-router-dom";
import { useActions } from "../../hooks/actions";
import { FolderInterface } from "../../types/folders";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../hooks/store";
import { setMainSelect } from "../../reducers/selected";

export interface ContextMenuProps {
  closeContext: () => void;
  contextSelected: {
    selected: boolean;
    X: number;
    Y: number;
  };
  folderMode?: boolean;
  quickItemMode?: boolean;
  parentBarMode?: boolean;
  file?: FileInterface | null;
  folder?: FolderInterface | null;
  stopPropagation?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = memo((props) => {
  const [fixedCoords, setFixedCoords] = useState({
    X: 0,
    Y: 0,
    set: false,
  });
  const [animate, setAnimate] = useState(false);
  const {
    closeContext,
    contextSelected,
    folderMode,
    file,
    quickItemMode,
    stopPropagation,
    folder,
    parentBarMode,
  } = props;
  const { wrapperRef } = useClickOutOfBounds(closeContext);
  const { isTrash, isMedia } = useUtils();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    renameItem,
    trashItem,
    deleteItem,
    restoreItem,
    openMoveItemModal,
    openShareItemModal,
    downloadItem,
    selectItemMultiSelect,
  } = useActions({ quickItemMode });

  useEffect(() => {
    if (!wrapperRef.current) return;

    const modalWidth = wrapperRef.current.clientWidth;
    const modalHeight = wrapperRef.current.clientHeight;

    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

    let X = contextSelected.X;
    let Y = contextSelected.Y;

    if (X + modalWidth > windowWidth) {
      X = windowWidth - modalWidth - 10;
    }

    if (Y + modalHeight > windowHeight) {
      Y = windowHeight - modalHeight - 10;
    }

    setFixedCoords({
      X,
      Y,
      set: true,
    });
  }, [wrapperRef, contextSelected.X, contextSelected.Y]);

  const onAction = async (
    action:
      | "rename"
      | "trash"
      | "delete"
      | "restore"
      | "move"
      | "share"
      | "download"
      | "multi-select"
      | "details"
  ) => {
    closeContext();
    switch (action) {
      case "details":
        if (file) {
          dispatch(setMainSelect({ file, id: file._id, type: "file", folder: null }));
        } else if (folder) {
          dispatch(setMainSelect({ file: null, id: folder._id, type: "folder", folder }));
        }
        // Hiermit öffnen wir die RightSection (Details Leiste)!
        window.dispatchEvent(new Event("open-details"));
        break;
      case "rename":
        await renameItem(file, folder);
        break;
      case "trash":
        await trashItem(file, folder);
        break;
      case "delete":
        await deleteItem(file, folder);
        break;
      case "restore":
        await restoreItem(file, folder);
        break;
      case "move":
        await openMoveItemModal(file, folder);
        break;
      case "share":
        openShareItemModal(file);
        break;
      case "download":
        downloadItem(file, folder);
        break;
      case "multi-select":
        selectItemMultiSelect(file, folder);
    }

    if (
      folder &&
      parentBarMode &&
      ["trash", "delete", "restore"].includes(action)
    ) {
      if (folder.parent === "/") {
        navigate("/trash");
      } else {
        navigate(`/folder-trash/${folder.parent}`);
      }
    }
  };

  useEffect(() => {
    setAnimate(true);
  }, []);

  const outterWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if ((e.target as HTMLDivElement).id !== "context-wrapper") {
      return;
    }
    closeContext();
  };

  const menuItemClass = "flex flex-row items-center px-4 py-2.5 hover:bg-[#f1f3f4] cursor-pointer transition-colors text-[#3c4043]";
  const iconClass = "w-5 h-5 mr-4 text-[#5f6368]";
  const textClass = "m-0 text-[14px]";

  return (
    <div
      id="context-wrapper"
      className="w-screen dynamic-height absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col"
      onClick={outterWrapperClick}
    >
      <div
        onClick={stopPropagation}
        ref={wrapperRef}
        className={classNames(
          "fixed min-w-[260px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-xl py-2 z-50 animate-movement",
          {
            "opacity-0 scale-95": !animate,
            "opacity-100 scale-100": animate,
          }
        )}
        style={
          fixedCoords.set
            ? {
                left: `${fixedCoords.X}px`,
                top: `${fixedCoords.Y}px`,
              }
            : {}
        }
      >
        <div className="flex flex-col">
          {!parentBarMode && (
            <div onClick={() => onAction("multi-select")} className={menuItemClass}>
              <MultiSelectIcon className={iconClass} />
              <p className={textClass}>{t("context_menu.multi_select")}</p>
            </div>
          )}
          {!isTrash && !isMedia && (
            <div onClick={() => onAction("rename")} className={menuItemClass}>
              <RenameIcon className={iconClass} />
              <p className={textClass}>{t("context_menu.rename")}</p>
            </div>
          )}
          {!folderMode && !isTrash && (
            <div onClick={() => onAction("share")} className={menuItemClass}>
              <ShareIcon className={iconClass} />
              <p className={textClass}>{t("context_menu.share")}</p>
            </div>
          )}
          
          {!isTrash && (
            <div className="w-full h-px bg-[#dadce0] my-1"></div>
          )}

          {!isTrash && (
            <div onClick={() => onAction("download")} className={menuItemClass}>
              <DownloadIcon className={iconClass} />
              <p className={textClass}>{t("context_menu.download")}</p>
            </div>
          )}
          {!isTrash && !isMedia && (
            <div onClick={() => onAction("move")} className={menuItemClass}>
              <MoveIcon className={iconClass} />
              <p className={textClass}>{t("context_menu.move")}</p>
            </div>
          )}
          
          <div onClick={() => onAction("details")} className={menuItemClass}>
            <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
               <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            <p className={textClass}>{t("context_menu.details")}</p>
          </div>
          
          {!isTrash && (
            <div className="w-full h-px bg-[#dadce0] my-1"></div>
          )}

          {!isTrash && (
            <div onClick={() => onAction("trash")} className={menuItemClass}>
              <TrashIcon className={iconClass} />
              <p className={textClass}>{t("context_menu.trash")}</p>
            </div>
          )}
          {isTrash && (
            <div onClick={() => onAction("restore")} className={menuItemClass}>
              <RestoreIcon className={iconClass} />
              <p className={textClass}>{t("context_menu.restore")}</p>
            </div>
          )}
          {isTrash && (
            <div onClick={() => onAction("delete")} className="flex flex-row items-center px-4 py-2.5 hover:bg-[#fce8e6] cursor-pointer transition-colors text-[#d93025]">
              <TrashIcon className="w-5 h-5 mr-4 text-[#d93025]" />
              <p className={textClass}>{t("context_menu.delete")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ContextMenu;