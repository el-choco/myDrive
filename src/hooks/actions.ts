import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import {
  deleteFileAPI,
  downloadFileAPI,
  renameFileAPI,
  restoreFileAPI,
  trashFileAPI,
} from "../api/filesAPI";
import { FileInterface } from "../types/file";
import { FolderInterface } from "../types/folders";
import { useFiles, useQuickFiles } from "./files";
import { useFolder, useFolders } from "./folders";
import { useAppDispatch } from "./store";
import {
  resetSelected,
  setMoveModal,
  setMultiSelectMode,
  setShareModal,
} from "../reducers/selected";
import {
  deleteFolderAPI,
  downloadZIPAPI,
  renameFolder,
  restoreFolderAPI,
  trashFolderAPI,
} from "../api/foldersAPI";

type UseActionsProps = {
  quickItemMode?: boolean;
};

export const useActions = ({ quickItemMode }: UseActionsProps) => {
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);
  const { refetch: refetchFolder } = useFolder(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const reloadItems = () => {
    refetchFiles();
    refetchQuickFiles();
    refetchFolders();
    refetchFolder();
    dispatch(resetSelected());
  };

  const getSwalOptions = (title: string, isDanger: boolean = false) => ({
    title,
    showCancelButton: true,
    cancelButtonText: t("general.cancel"),
    buttonsStyling: false,
    customClass: {
      popup: 'drive-popup',
      title: 'drive-title',
      htmlContainer: 'drive-html',
      input: 'drive-input',
      actions: 'drive-actions',
      cancelButton: 'drive-cancel',
      confirmButton: isDanger ? 'drive-confirm drive-confirm-danger' : 'drive-confirm'
    }
  });

  const renameItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    const defaultName = file ? file.filename : folder ? folder.name : '';
    
    const { value: newName } = await Swal.fire({
      ...getSwalOptions(t("context_menu.rename")),
      input: 'text',
      inputPlaceholder: t("general.rename_prompt"),
      inputValue: defaultName,
      confirmButtonText: t("settings.btn_okay"),
      inputValidator: (value) => {
        if (!value) return 'You need to write something!';
      }
    });

    if (!newName || newName === defaultName) return;

    try {
      if (file) {
        await toast.promise(renameFileAPI(file._id, newName), {
          pending: t("toast.renaming"),
          success: t("toast.renamed"),
          error: t("toast.error_renaming"),
        });
      } else if (folder) {
        await toast.promise(renameFolder(folder._id, newName), {
          pending: t("toast.renaming"),
          success: t("toast.renamed"),
          error: t("toast.error_renaming"),
        });
      }
      reloadItems();
    } catch (e) {
      console.log("Error renaming item", e);
    }
  };

  const trashItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    const { isConfirmed } = await Swal.fire({
      ...getSwalOptions(t("context_menu.trash")),
      text: t("trash.warning"),
      icon: "warning",
      confirmButtonText: t("context_menu.trash"),
    });

    if (!isConfirmed) return;

    try {
      if (file) {
        await toast.promise(trashFileAPI(file._id), {
          pending: t("toast.trashing"),
          success: t("toast.trashed"),
          error: t("toast.error_trashing"),
        });
      } else if (folder) {
        await toast.promise(trashFolderAPI(folder._id), {
          pending: t("toast.trashing"),
          success: t("toast.trashed"),
          error: t("toast.error_trashing"),
        });
      }
      reloadItems();
    } catch (e) {
      console.log("Error trashing item", e);
    }
  };

  const deleteItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    const { isConfirmed } = await Swal.fire({
      ...getSwalOptions(t("context_menu.delete"), true),
      text: t("trash.delete_warning"),
      icon: "error",
      confirmButtonText: t("context_menu.delete"),
    });

    if (!isConfirmed) return;

    try {
      if (file) {
        await toast.promise(deleteFileAPI(file._id), {
          pending: t("toast.deleting"),
          success: t("toast.deleted"),
          error: t("toast.error_deleting"),
        });
      } else if (folder) {
        await toast.promise(deleteFolderAPI(folder._id), {
          pending: t("toast.deleting"),
          success: t("toast.deleted"),
          error: t("toast.error_deleting"),
        });
      }
      reloadItems();
    } catch (e) {
      console.log("Error deleting item", e);
    }
  };

  const restoreItem = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    try {
      if (file) {
        await toast.promise(restoreFileAPI(file._id), {
          pending: t("toast.restoring"),
          success: t("toast.restored"),
          error: t("toast.error_restoring"),
        });
      } else if (folder) {
        await toast.promise(restoreFolderAPI(folder._id), {
          pending: t("toast.restoring"),
          success: t("toast.restored"),
          error: t("toast.error_restoring"),
        });
      }
      reloadItems();
    } catch (e) {
      console.log("Error restoring item", e);
    }
  };

  const openMoveItemModal = async (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (file) {
      dispatch(setMoveModal({ type: "file", file, folder: null }));
    } else if (folder) {
      dispatch(setMoveModal({ type: "folder", file: null, folder }));
    }
  };

  const openShareItemModal = (file?: FileInterface | null) => {
    dispatch(setShareModal(file!));
  };

  const downloadItem = (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (file) downloadFileAPI(file._id);
    if (folder) downloadZIPAPI([folder._id], []);
  };

  const selectItemMultiSelect = (
    file?: FileInterface | null,
    folder?: FolderInterface | null
  ) => {
    if (folder) {
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
    } else if (file) {
      dispatch(
        setMultiSelectMode([
          {
            type: quickItemMode ? "quick-item" : "file",
            id: file._id,
            file: file,
            folder: null,
          },
        ])
      );
    }
  };

  return {
    renameItem,
    trashItem,
    deleteItem,
    restoreItem,
    openMoveItemModal,
    openShareItemModal,
    downloadItem,
    selectItemMultiSelect,
  };
};