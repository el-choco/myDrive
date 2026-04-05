import React, { memo, useRef, useEffect, useState } from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useContextMenu } from "../../hooks/contextMenu";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import {
  addNavigationMap,
  setMainSelect,
  setMultiSelectMode,
} from "../../reducers/selected";
import { useUtils } from "../../hooks/utils";
import { FolderInterface } from "../../types/folders";
import dayjs from "dayjs";
import ClockIcon from "../../icons/ClockIcon";
import { useTranslation } from "react-i18next";
import { getUserDetailedAPI } from "../../api/userAPI";
import { moveFileAPI } from "../../api/filesAPI";
import { moveFolderAPI } from "../../api/foldersAPI";
import { toast } from "react-toastify";
import { useFiles } from "../../hooks/files";
import { useFolders } from "../../hooks/folders";

interface FolderItemProps {
  folder: FolderInterface;
  scrollDivRef: React.RefObject<HTMLDivElement>;
}

const FolderItem: React.FC<FolderItemProps> = memo((props) => {
  const { folder, scrollDivRef } = props;
  const elementSelected = useAppSelector((state) => {
    if (state.selected.mainSection.type !== "folder") return false;
    return state.selected.mainSection.id === folder._id;
  });
  const elementMultiSelected = useAppSelector((state) => {
    if (!state.selected.multiSelectMode) return false;
    return state.selected.multiSelectMap[folder._id];
  });
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const singleClickFolders = useAppSelector(
    (state) => state.general.singleClickFolders
  );
  const listView = useAppSelector((state) => state.general.listView);
  const { isTrash } = useUtils();
  const lastSelected = useRef(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [userInitials, setUserInitials] = useState("U");
  const [isDragOver, setIsDragOver] = useState(false);
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);

  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();

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

  const folderClick = (e: React.MouseEvent<HTMLDivElement | HTMLTableRowElement, MouseEvent>) => {
    const multiSelectKey = e.metaKey || e.ctrlKey;
    if (multiSelectMode || multiSelectKey) {
      dispatch(
        setMultiSelectMode([
          {
            type: "folder",
            id: folder._id,
            file: null,
            folder: folder,
          },
        ])
      );
      return;
    }
    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(
        setMainSelect({
          file: null,
          id: folder._id,
          type: "folder",
          folder: folder,
        })
      );
      lastSelected.current = Date.now();

      if (!singleClickFolders) return;
    }

    if (singleClickFolders || currentDate - lastSelected.current < 1500) {
      dispatch(
        addNavigationMap({
          url: window.location.pathname,
          scrollTop: scrollDivRef.current?.scrollTop || 0,
        })
      );
      if (isTrash) {
        navigate(`/folder-trash/${folder._id}`);
      } else {
        navigate(`/folder/${folder._id}`);
      }
    }

    lastSelected.current = Date.now();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement | HTMLTableRowElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "folder", id: folder._id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement | HTMLTableRowElement>) => {
    e.preventDefault();
    if (isTrash) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement | HTMLTableRowElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement | HTMLTableRowElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (isTrash) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.id === folder._id) return; // Verhindert das Verschieben in sich selbst

      if (data.type === "file") {
        await toast.promise(moveFileAPI(data.id, folder._id), {
          pending: t("toast.moving_file"),
          success: t("toast.file_moved"),
          error: t("toast.error_moving_file"),
        });
        refetchFiles();
      } else if (data.type === "folder") {
        await toast.promise(moveFolderAPI(data.id, folder._id), {
          pending: t("toast.moving_folder"),
          success: t("toast.folder_moved"),
          error: t("toast.error_moving_folder"),
        });
        refetchFolders();
      }
    } catch (err) {
      console.log("Drag drop non-internal element ignored", err);
    }
  };

  const folderIconSvg = (
    <svg className="w-full h-full shrink-0" viewBox="0 0 512 512">
      <path fill="currentColor" d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"></path>
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={classNames(
          "text-[14px] font-normal border-b border-gray-100 cursor-pointer transition-colors duration-200 group",
          (elementSelected || elementMultiSelected)
            ? "bg-[#c2e7ff] hover:bg-[#b5e0ff]"
            : isDragOver ? "bg-[#e8eaed]" : "bg-white hover:bg-[#f1f3f4]"
        )}
        onClick={folderClick}
        onContextMenu={onContextMenu}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <td className="p-3 pl-4 rounded-l-full overflow-hidden">
          <div className="flex items-center w-full">
            <span className={classNames(
              "inline-flex items-center justify-center mr-3 w-6 h-6 shrink-0",
              (elementSelected || elementMultiSelected) ? "text-[#001d35]" : "text-[#5f6368]"
            )}>
              {folderIconSvg}
            </span>
            <p className={classNames(
              "m-0 truncate font-medium",
              (elementSelected || elementMultiSelected) ? "text-[#001d35]" : "text-[#1f1f1f]"
            )}>
              {folder.name}
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
            {dayjs(folder.createdAt).format("MMM D, YYYY")}
          </p>
        </td>
        
        <td className="p-3 hidden fileListShowDetails:table-cell">
           <p className={classNames(
            "text-sm m-0",
            (elementSelected || elementMultiSelected) ? "text-[#001d35] opacity-80" : "text-[#5f6368]"
          )}>
            —
          </p>
        </td>

        <td className="p-3 rounded-r-full">
          <div className="flex justify-end items-center pr-2">
            {contextMenuState.selected && (
              <div onClick={clickStopPropagation}>
                <ContextMenu
                  folderMode={true}
                  quickItemMode={folder.parent !== "/"}
                  contextSelected={contextMenuState}
                  closeContext={closeContextMenu}
                  folder={folder}
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
  }

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={classNames(
        "p-4 rounded-2xl overflow-hidden cursor-pointer transition-colors duration-200 flex flex-col justify-between h-full min-h-[110px] border border-transparent",
        {
          "bg-[#c2e7ff] hover:bg-[#b5e0ff] text-[#001d35]": elementSelected || elementMultiSelected,
          "bg-[#e8eaed] text-[#1f1f1f] border-[#dadce0]": isDragOver && !(elementSelected || elementMultiSelected),
          "bg-[#f1f3f4] hover:bg-[#e4e7eb] text-[#1f1f1f]": !isDragOver && !(elementSelected || elementMultiSelected),
        }
      )}
      onClick={folderClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation}>
          <ContextMenu
            folderMode={true}
            quickItemMode={folder.parent !== "/"}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            folder={folder}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className={classNames(
            "w-6 h-6",
            elementSelected || elementMultiSelected
              ? "text-[#001d35]"
              : "text-[#5f6368]"
          )}>
          {folderIconSvg}
        </div>
      </div>
      <div className="w-full">
        <p
          className={classNames(
            "m-0 text-[14px] font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
            elementSelected || elementMultiSelected
              ? "text-[#001d35]"
              : "text-[#1f1f1f]"
          )}
        >
          {folder.name}
        </p>
        <div className="flex flex-row items-center mt-1">
          <ClockIcon className="h-3 w-3 mr-1 opacity-70" />
          <p
            className={classNames(
              "m-0 font-normal max-w-full whitespace-nowrap text-[12px]",
              elementSelected || elementMultiSelected
                ? "text-[#001d35] opacity-80"
                : "text-[#5f6368]"
            )}
          >
            {dayjs(folder.createdAt).format("MMM D, YYYY")}
          </p>
        </div>
      </div>
    </div>
  );
});

export default FolderItem;