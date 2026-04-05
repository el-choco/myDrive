import { useParams } from "react-router-dom";
import { createFolderAPI } from "../../api/foldersAPI";
import { useClickOutOfBounds } from "../../hooks/utils";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { useUploader } from "../../hooks/files";
import UploadFileIcon from "../../icons/UploadFileIcon";
import CreateFolderIcon from "../../icons/CreateFolderIcon";
import FolderUploadIcon from "../../icons/FolderUploadIcon";
import Swal from "sweetalert2";
import { useFolders } from "../../hooks/folders";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface AddNewDropdownProps {
  closeDropdown: () => void;
  isDropdownOpen: boolean;
}

const AddNewDropdown: React.FC<AddNewDropdownProps> = ({
  closeDropdown,
  isDropdownOpen,
}) => {
  const params = useParams();
  const { refetch: refetchFolders } = useFolders(false);
  const [supportsWebkitDirectory, setSupportsWebkitDirectory] = useState(false);
  const { wrapperRef } = useClickOutOfBounds(closeDropdown, true);
  const uploadRef: RefObject<HTMLInputElement> = useRef(null);
  const uploadFolderRef: RefObject<HTMLInputElement> = useRef(null);
  const { uploadFiles, uploadFolder } = useUploader();
  const { t } = useTranslation();

  const createFolder = async () => {
    closeDropdown();
    
    const { value: folderName } = await Swal.fire({
      title: t("dropdown.create_folder"),
      input: 'text',
      inputPlaceholder: t("dropdown.create_folder"),
      showCancelButton: true,
      confirmButtonText: t("dropdown.create_folder"),
      cancelButtonText: t("general.cancel"),
      buttonsStyling: false,
      customClass: {
        popup: 'drive-popup',
        title: 'drive-title',
        input: 'drive-input',
        actions: 'drive-actions',
        cancelButton: 'drive-cancel',
        confirmButton: 'drive-confirm'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    });

    if (folderName === undefined || folderName === null) {
      return;
    }

    await createFolderAPI(folderName, params.id);
    refetchFolders();
  };

  const handleUpload = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    closeDropdown();

    const files = uploadRef.current?.files;
    if (!files) return;

    uploadFiles(files);
  };

  const checkForWebkitDirectory = (items: FileList) => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i].webkitRelativePath) {
        return false;
      }
    }
    return true;
  };

  const handleFolderUpload = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    closeDropdown();

    const items = uploadFolderRef.current?.files;

    if (!items || !items.length) {
      Swal.fire({
        title: t("dropdown.no_items_selected_title"),
        icon: "error",
        confirmButtonColor: "#1a73e8",
        confirmButtonText: t("dropdown.okay_button"),
      });
      return;
    }

    const hasWebkitDirectory = checkForWebkitDirectory(items);

    if (!hasWebkitDirectory) {
      uploadFiles(items);
    } else {
      uploadFolder(items);
    }
  };

  const triggerFileUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  const triggerFolderUpload = () => {
    if (uploadFolderRef.current) {
      uploadFolderRef.current.click();
    }
  };

  useEffect(() => {
    if (uploadFolderRef.current) {
      setSupportsWebkitDirectory("webkitdirectory" in uploadFolderRef.current);
    }
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute bottom-0 top-full w-full text-[#3c4043]"
      id="add-new-dropdown"
    >
      <input
        className="hidden"
        ref={uploadRef}
        type="file"
        multiple={true}
        onChange={handleUpload}
      />
      <input
        className="hidden"
        ref={uploadFolderRef}
        type="file"
        {...{ webkitdirectory: "true" }}
        onChange={handleFolderUpload}
      />
      <ul
        className={classNames(
          "rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.15)] animate bg-white absolute z-50 mt-1 min-w-[220px] left-3",
          {
            "max-h-0 opacity-0 border-0 py-0": !isDropdownOpen,
            "max-h-[300px] opacity-100 border border-gray-200 py-2": isDropdownOpen,
          }
        )}
      >
        <li>
          <div>
            <a
              className="flex items-center justify-start px-5 py-2.5 no-underline text-sm bg-white hover:bg-[#f1f3f4] cursor-pointer"
              onClick={triggerFileUpload}
            >
              <UploadFileIcon className="w-5 h-5 mr-4 text-[#5f6368]" />
              <p className="text-sm m-0">{t("dropdown.upload_files")}</p>
            </a>
          </div>
        </li>
        <li>
          <a
            className="flex items-center justify-start px-5 py-2.5 no-underline text-sm bg-white hover:bg-[#f1f3f4] cursor-pointer"
            onClick={createFolder}
          >
            <CreateFolderIcon className="w-5 h-5 mr-4 text-[#5f6368]" />
            <p className="text-sm m-0">{t("dropdown.create_folder")}</p>
          </a>
        </li>
        {supportsWebkitDirectory && (
          <li>
            <a
              className="flex items-center justify-start px-5 py-2.5 no-underline text-sm bg-white hover:bg-[#f1f3f4] cursor-pointer"
              onClick={triggerFolderUpload}
            >
              <FolderUploadIcon className="w-5 h-5 mr-4 text-[#5f6368]" />
              <p className="text-sm m-0">{t("dropdown.upload_folder")}</p>
            </a>
        </li>
        )}
      </ul>
    </div>
  );
};

export default AddNewDropdown;