import React, { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { resetMultiSelect, setMoveModal } from "../../reducers/selected";
import {
  deleteMultiAPI,
  restoreMultiAPI,
  trashMultiAPI,
} from "../../api/filesAPI";
import { useFiles, useQuickFiles } from "../../hooks/files";
import TrashIcon from "../../icons/TrashIcon";
import Moveicon from "../../icons/MoveIcon";
import {
  deleteItemsPopup,
  restoreItemsPopup,
  trashItemsPopup,
} from "../../popups/file";
import RestoreIcon from "../../icons/RestoreIcon";
import { useUtils } from "../../hooks/utils";
import { toast } from "react-toastify";
import DownloadIcon from "../../icons/DownloadIcon";
import { downloadZIPAPI } from "../../api/foldersAPI";
import CloseIcon from "../../icons/CloseIcon";
import { useLocation } from "react-router-dom";
import { useFolders } from "../../hooks/folders";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

const MultiSelectBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const multiSelectMap = useAppSelector(
    (state) => state.selected.multiSelectMap
  );
  const multiSelectCount = useAppSelector(
    (state) => state.selected.multiSelectCount
  );
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);
  const { t } = useTranslation();

  const { isTrash, isMedia } = useUtils();

  const location = useLocation();

  const closeMultiSelect = useCallback(() => {
    dispatch(resetMultiSelect());
  }, [dispatch]);

  useEffect(() => {
    closeMultiSelect();
  }, [location.pathname, closeMultiSelect]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        closeMultiSelect();
      }
    },
    [closeMultiSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const trashItems = async () => {
    try {
      const result = await trashItemsPopup();
      if (!result) return;

      const itemsToTrash = Object.values(multiSelectMap);
      await toast.promise(trashMultiAPI(itemsToTrash), {
        pending: t("toast.trashing"),
        success: t("toast.trashed"),
        error: t("toast.error_trashing"),
      });
      refetchFiles();
      refetchFolders();
      refetchQuickFiles();
      closeMultiSelect();
    } catch (e) {
      console.log("Error Trashing Items", e);
    }
  };

  const deleteItems = async () => {
    try {
      const result = await deleteItemsPopup();
      if (!result) return;

      const itesmsToDelete = Object.values(multiSelectMap);
      await toast.promise(deleteMultiAPI(itesmsToDelete), {
        pending: t("toast.deleting"),
        success: t("toast.deleted"),
        error: t("toast.error_deleting"),
      });
      refetchFiles();
      refetchFolders();
      refetchQuickFiles();
      closeMultiSelect();
    } catch (e) {
      console.log("Error Deleting Items", e);
    }
  };

  const restoreItems = async () => {
    const result = await restoreItemsPopup();
    if (!result) return;

    const itemsToRestore = Object.values(multiSelectMap);
    await toast.promise(restoreMultiAPI(itemsToRestore), {
      pending: t("toast.restoring"),
      success: t("toast.restored"),
      error: t("toast.error_restoring"),
    });
    refetchFiles();
    refetchFolders();
    refetchQuickFiles();
    closeMultiSelect();
  };

  const moveItems = () => {
    dispatch(setMoveModal({ type: "multi-select", file: null, folder: null }));
  };

  const downloadItems = () => {
    const folders = [];
    const files = [];

    for (const key of Object.keys(multiSelectMap)) {
      const item = multiSelectMap[key];
      if (item.type === "folder") {
        folders.push(item.id);
      } else {
        files.push(item.id);
      }
    }

    downloadZIPAPI(folders, files);
  };

  if (!multiSelectMode) return null;

  return (
    <div className="flex justify-center items-center w-full px-4 pointer-events-none mb-6">
      <div className="bg-[#e9eef6] rounded-full py-2 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-between min-w-[320px] max-w-[600px] pointer-events-auto border border-gray-100 transition-all duration-300 transform translate-y-0 opacity-100">
        
        <div className="flex items-center">
          <div 
            className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
            onClick={closeMultiSelect}
          >
            <CloseIcon className="w-5 h-5 text-[#5f6368]" />
          </div>
          <p className="ml-3 font-medium text-[#1f1f1f] text-[14px] select-none m-0">
            {t("multi_select.selected", { count: multiSelectCount })}
          </p>
        </div>

        <div className="flex items-center gap-1 ml-6">
          {!isTrash && (
            <>
              <div 
                className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
                onClick={trashItems}
                title={t("context_menu.trash")}
              >
                <TrashIcon className="w-5 h-5 text-[#5f6368]" />
              </div>
              {!isMedia && (
                <div 
                  className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
                  onClick={moveItems}
                  title={t("context_menu.move")}
                >
                  <Moveicon className="w-5 h-5 text-[#5f6368]" />
                </div>
              )}
              <div 
                className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
                onClick={downloadItems}
                title={t("context_menu.download")}
              >
                <DownloadIcon className="w-5 h-5 text-[#5f6368]" />
              </div>
            </>
          )}
          {isTrash && (
            <>
              <div 
                className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
                onClick={restoreItems}
                title={t("context_menu.restore")}
              >
                <RestoreIcon className="w-5 h-5 text-[#5f6368]" />
              </div>
              <div 
                className="p-2 rounded-full hover:bg-[#fce8e6] cursor-pointer transition-colors"
                onClick={deleteItems}
                title={t("context_menu.delete")}
              >
                <TrashIcon className="w-5 h-5 text-[#d93025]" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelectBar;