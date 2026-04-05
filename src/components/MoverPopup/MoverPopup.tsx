import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { useFolders, useMoveFolders } from "../../hooks/folders";
import { FolderInterface } from "../../types/folders";
import CloseIcon from "../../icons/CloseIcon";
import { resetMoveModal } from "../../reducers/selected";
import debounce from "lodash/debounce";
import Spinner from "../Spinner/Spinner";
import HomeIconOutline from "../../icons/HomeIconOutline";
import ArrowBackIcon from "../../icons/ArrowBackIcon";
import classNames from "classnames";
import FolderIcon from "../../icons/FolderIcon";
import { toast } from "react-toastify";
import { moveFileAPI, moveMultiAPI } from "../../api/filesAPI";
import { useFiles } from "../../hooks/files";
import { moveFolderAPI } from "../../api/foldersAPI";
import { useTranslation } from "react-i18next";

const MoverPopup = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [parent, setParent] = useState<FolderInterface | null>(null);
  const [parentList, setParentList] = useState<FolderInterface[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderInterface | null>(
    null
  );
  const [animate, setAnimate] = useState(false);
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const multiSelectMap = useAppSelector(
    (state) => state.selected.multiSelectMap
  );
  const [isLoadingMove, setIsLoadingMove] = useState(false);
  const file = useAppSelector((state) => state.selected.moveModal.file);
  const folder = useAppSelector((state) => state.selected.moveModal.folder);
  const dispatch = useAppDispatch();
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchFolders } = useFolders(false);
  const { t } = useTranslation();
  const lastSelected = useRef({
    timestamp: 0,
    folderID: "",
  });

  // HIER IST DER FIX: Wir senden nur echte Ordner-IDs an das Backend!
  const foldersToMove = useMemo(() => {
    if (multiSelectMode) {
      const folderIds: string[] = [];
      Object.values(multiSelectMap).forEach((item) => {
        if (item.type === "folder") {
          folderIds.push(item.id);
        }
      });
      return folderIds;
    } else if (folder) {
      return [folder._id];
    }
    return []; // Dateien haben keine Unterordner, wir müssen nichts ausblenden!
  }, [multiSelectMode, multiSelectMap, folder]);

  const { data: folderList, isLoading: isLoadingFolders } = useMoveFolders(
    parent?._id || "/",
    debouncedSearch,
    foldersToMove
  );

  const debouncedSetSearchText = useMemo(
    () => debounce(setDebouncedSearch, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchText(search);
    return () => {
      debouncedSetSearchText.cancel();
    };
  }, [search, debouncedSetSearchText]);

  const onFolderClick = (folderClickItem: FolderInterface) => {
    const currentDate = Date.now();

    if (
      lastSelected.current.folderID === folderClickItem._id &&
      currentDate - lastSelected.current.timestamp < 1500
    ) {
      setSearch("");
      setDebouncedSearch("");
      setParentList([...parentList, folderClickItem]);
      setParent(folderClickItem);
      setSelectedFolder(null);
    } else {
      setSelectedFolder(folderClickItem);
    }

    lastSelected.current.timestamp = Date.now();
    lastSelected.current.folderID = folderClickItem._id;
  };

  const onBackClick = () => {
    if (!parent) return;
    setSearch("");
    setDebouncedSearch("");
    const newParentList = parentList.slice(0, parentList.length - 1);
    if (newParentList.length === 0) {
      setParent(null);
      setParentList([]);
    } else {
      setParentList(newParentList);
      setParent(newParentList[newParentList.length - 1]);
    }
  };

  const moveText = (() => {
    if (selectedFolder?._id && selectedFolder?.name) {
      return t("mover_popup.move_to_name", { name: selectedFolder.name });
    } else if (!parent) {
      return t("mover_popup.move_to_home");
    } else {
      const lastParent = parentList[parentList.length - 1];
      return t("mover_popup.move_to_name", { name: lastParent.name });
    }
  })();

  const headerText = (() => {
    if (parent) {
      return parent.name;
    } else {
      return t("mover_popup.home");
    }
  })();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const onHomeClick = () => {
    setSearch("");
    setDebouncedSearch("");
    setParent(null);
    setParentList([]);
    setSelectedFolder(null);
  };

  const onMoveClick = async () => {
    setIsLoadingMove(true);
    const moveTo = selectedFolder?._id
      ? selectedFolder?._id
      : parent?._id || "/";
    try {
      if (multiSelectMode) {
        const itemsToMove = Object.values(multiSelectMap);
        await toast.promise(moveMultiAPI(itemsToMove, moveTo), {
          pending: t("toast.moving_items"),
          success: t("toast.items_moved"),
          error: t("toast.error_moving_items"),
        });
        refetchFiles();
        refetchFolders();
        dispatch(resetMoveModal());
      } else if (file) {
        await toast.promise(moveFileAPI(file._id, moveTo), {
          pending: t("toast.moving_file"),
          success: t("toast.file_moved"),
          error: t("toast.error_moving_file"),
        });
        refetchFiles();
        dispatch(resetMoveModal());
      } else if (folder) {
        await toast.promise(moveFolderAPI(folder._id, moveTo), {
          pending: t("toast.moving_folder"),
          success: t("toast.folder_moved"),
          error: t("toast.error_moving_folder"),
        });
        refetchFolders();
        dispatch(resetMoveModal());
      }
    } catch (e) {
      console.log("move error", e);
    } finally {
      setIsLoadingMove(false);
    }
  };

  const onTitleClick = () => {
    setSelectedFolder(parentList[parentList.length - 1]);
  };

  const closeModal = () => {
    setAnimate(false);
    setTimeout(() => dispatch(resetMoveModal()), 200);
  };

  const wrapperClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.id !== "outer-wrapper") return;
    closeModal();
  };

  const showLoading = isLoadingFolders;
  const noFolders = !isLoadingFolders && (!folderList || folderList.length === 0);

  return (
    <div
      className="w-screen dynamic-height bg-black/40 backdrop-blur-sm absolute top-0 left-0 right-0 bottom-0 z-[60] flex justify-center items-center flex-col transition-opacity duration-200"
      id="outer-wrapper"
      onClick={wrapperClick}
    >
      <div
        className={classNames(
          "bg-white w-full max-w-[440px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out transform",
          animate ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div 
              className={classNames(
                "p-2 rounded-full transition-colors mr-1",
                parent ? "hover:bg-black/5 cursor-pointer" : "opacity-30 cursor-not-allowed"
              )}
              onClick={onBackClick}
            >
              <ArrowBackIcon className="w-5 h-5 text-[#5f6368]" />
            </div>
            <p
              className="text-[#1f1f1f] text-[18px] font-medium max-w-[200px] truncate select-none cursor-pointer hover:bg-black/5 px-2 py-1 rounded-md transition-colors m-0"
              onClick={onTitleClick}
            >
              {headerText}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
              onClick={onHomeClick}
              title={t("mover_popup.home")}
            >
              <HomeIconOutline className="w-5 h-5 text-[#5f6368]" />
            </div>
            <div 
              className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
              onClick={closeModal}
            >
              <CloseIcon className="w-5 h-5 text-[#5f6368]" />
            </div>
          </div>
        </div>

        {!multiSelectMode && (
          <div className="px-4 pt-4">
            <input
              className="w-full h-10 px-4 bg-[#f1f3f4] text-[#3c4043] rounded-full text-[14px] outline-none placeholder:text-[#5f6368] focus:bg-white focus:shadow-[0_1px_1px_0_rgba(65,69,73,0.3),0_1px_3px_1px_rgba(65,69,73,0.15)] transition-all"
              placeholder={t("mover_popup.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col overflow-y-auto h-[260px] p-2 mt-2">
          {noFolders && (
             <div className="flex items-center justify-center h-full text-[#5f6368] text-[14px]">
               {t("mover_popup.no_folders")}
             </div>
          )}
          {!noFolders && !showLoading && (
            <React.Fragment>
              {folderList?.map((folderItem: FolderInterface) => (
                <div
                  className={classNames(
                    "px-4 py-3 rounded-xl flex flex-row items-center cursor-pointer transition-colors mb-1",
                    {
                      "bg-[#c2e7ff] text-[#001d35]": selectedFolder?._id === folderItem._id,
                      "hover:bg-[#f1f3f4] text-[#3c4043]": selectedFolder?._id !== folderItem._id,
                    }
                  )}
                  key={folderItem._id}
                  onClick={() => onFolderClick(folderItem)}
                >
                  <FolderIcon
                    className={classNames("w-5 h-5 mr-3 select-none", {
                      "text-[#001d35]": selectedFolder?._id === folderItem._id,
                      "text-[#5f6368]": selectedFolder?._id !== folderItem._id,
                    })}
                  />
                  <p className="max-w-[85%] truncate select-none text-[14px] font-medium m-0">
                    {folderItem.name}
                  </p>
                </div>
              ))}
            </React.Fragment>
          )}
          {showLoading && (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-[#f8f9fa] flex items-center justify-between rounded-b-2xl">
           <p className="text-[13px] text-[#5f6368] truncate pr-4 m-0 flex-1 select-none">
            {moveText}
          </p>
          <button
            className={classNames(
              "bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2 rounded-full text-[14px] font-medium transition-colors shrink-0 outline-none",
              {
                "opacity-50 cursor-not-allowed": isLoadingMove,
              }
            )}
            onClick={onMoveClick}
            disabled={isLoadingMove}
          >
            {t("mover_popup.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoverPopup;