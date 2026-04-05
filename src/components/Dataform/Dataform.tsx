import Folders from "../Folders/Folders";
import { useFiles, useQuickFiles, useUploader } from "../../hooks/files";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";
import Files from "../Files/Files";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import Spinner from "../Spinner/Spinner";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import classNames from "classnames";
import { useDragAndDrop, useClickOutOfBounds, useUtils } from "../../hooks/utils";
import MultiSelectBar from "../MultiSelectBar/MultiSelectBar";
import { useFolder, useFolders } from "../../hooks/folders";
import { removeNavigationMap } from "../../reducers/selected";
import AlertIcon from "../../icons/AlertIcon";
import { useTranslation } from "react-i18next";
import { setSortBy, setTypeFilter, setDateFilter } from "../../reducers/filter";
import { toggleListView } from "../../reducers/general";
import ParentBar from "../ParentBar/ParentBar";

const DataForm = memo(
  ({ scrollDivRef }: { scrollDivRef: React.RefObject<HTMLDivElement> }) => {
    const {
      fetchNextPage: filesFetchNextPage,
      isFetchingNextPage: isFetchingNextPageState,
      data: fileList,
      isLoading: isLoadingFiles,
    } = useFiles();
    const { isLoading: isLoadingFolder } = useFolder(true);
    const { data: allFolders, isLoading: isLoadingFolders } = useFolders();
    const { isLoading: isLoadingQuickItems } = useQuickFiles();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { sentinelRef, reachedIntersect } = useInfiniteScroll();
    const [initialLoad, setInitialLoad] = useState(true);
    const params = useParams();
    const { uploadFiles } = useUploader();
    const isFetchingNextPage = useRef(false);
    const prevPathname = useRef("");
    const location = useLocation();
    const navigationMap = useAppSelector((state) => state.selected.navigationMap[location.pathname]);
    const sortBy = useAppSelector((state) => state.filter.sortBy);
    const listView = useAppSelector((state) => state.general.listView);
    const { isTrash, isSearch, isHome } = useUtils();
    const { t } = useTranslation();

    const [openFilter, setOpenFilter] = useState<"type" | "people" | "modified" | "title" | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { wrapperRef: filterWrapperRef } = useClickOutOfBounds(() => setOpenFilter(null));

    const isLoading = isLoadingFiles || isLoadingFolders || isLoadingQuickItems || isLoadingFolder;

    useEffect(() => {
      if (initialLoad) {
        setInitialLoad(false);
        return;
      } else if (!fileList || isFetchingNextPage.current) return;
      
      if (reachedIntersect && !isLoadingFiles) {
        isFetchingNextPage.current = true;
        filesFetchNextPage().then(() => {
          isFetchingNextPage.current = false;
        });
      }
    }, [reachedIntersect, initialLoad, isLoadingFiles]);

    useEffect(() => {
      if (!isLoading && navigationMap) {
        scrollDivRef.current?.scrollTo(0, navigationMap.scrollTop);
        dispatch(removeNavigationMap(location.pathname));
        prevPathname.current = location.pathname;
      } else if (!isLoading && prevPathname.current !== location.pathname) {
        scrollDivRef.current?.scrollTo(0, 0);
        prevPathname.current = location.pathname;
      }
    }, [isLoading, navigationMap, location.pathname]);

    const addFile = useCallback((files: FileList) => uploadFiles(files), [params.id]);
    const { isDraggingFile, onDragDropEvent, onDragEvent, onDragEnterEvent, stopDrag } = useDragAndDrop(addFile);

    const switchOrderSortBy = () => {
      let newSortBy = "";
      switch (sortBy) {
        case "date_asc": newSortBy = "date_desc"; break;
        case "date_desc": newSortBy = "date_asc"; break;
        case "alp_asc": newSortBy = "alp_desc"; break;
        case "alp_desc": newSortBy = "alp_asc"; break;
        default: newSortBy = "date_desc"; break;
      }
      dispatch(setSortBy(newSortBy));
    };

    const changeListViewMode = () => dispatch(toggleListView());

    const title = (() => {
      if (isTrash) return t("folders.title_trash");
      if (isSearch) return t("folders.title_search");
      if (isHome) return t("parent_bar.home");
      return t("folders.title_default");
    })();

    const handleFilterSelect = (filterCategory: "type" | "modified", key: string | null, displayName: string | null) => {
      if (filterCategory === "type") {
        setSelectedType(displayName);
        dispatch(setTypeFilter(key || "all"));
      }
      if (filterCategory === "modified") {
        setSelectedDate(displayName);
        dispatch(setDateFilter(key || "all"));
      }
      setOpenFilter(null);
    };

    const navigateToFolder = (folderId: string) => {
      setOpenFilter(null);
      navigate(`/folder/${folderId}`);
    };

    return (
      <div
        className={classNames("w-full px-4 desktopMode:px-8 py-6 overflow-y-scroll relative", { "opacity-50": isDraggingFile })}
        onDrop={onDragDropEvent}
        onDragOver={onDragEvent}
        onDragLeave={onDragEvent}
        onDragEnter={onDragEnterEvent}
        onMouseLeave={stopDrag}
        ref={scrollDivRef}
      >
        {!isLoading && (
          <div className="max-w-[1600px] mx-auto">
            <div className="fixed bottom-0 flex justify-center items-center right-0 left-0 z-10 pointer-events-none">
              <MultiSelectBar />
            </div>

            {isTrash && (
              <div className="bg-[#f1f3f4] p-4 rounded-xl text-sm text-[#3c4043] mb-6 flex items-center select-none">
                <AlertIcon className="w-5 h-5 mr-3 text-[#5f6368]" />
                <span>{t("trash.warning")}</span>
              </div>
            )}

            <div className="block mb-4">
              {!isHome && <ParentBar />}
            </div>

            {/* HIER IST DER FIX: Der wrapperRef umschließt nun den Titel UND die Filter! */}
            <div ref={filterWrapperRef}>
              <div className="flex flex-row justify-between items-center w-full mb-4 relative">
                <div className="relative">
                  <h2 
                    className="m-0 text-[22px] font-normal text-[#1f1f1f] flex items-center gap-2 cursor-pointer hover:bg-black/5 px-2 py-1 -ml-2 rounded transition-colors select-none"
                    onMouseDown={() => isHome && setOpenFilter(openFilter === "title" ? null : "title")}
                  >
                    {title}
                    {isHome && (
                      <svg className={classNames("w-5 h-5 mt-1 transition-transform", { "rotate-180": openFilter === "title" })} viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                    )}
                  </h2>

                  {openFilter === "title" && isHome && (
                    <div className="absolute top-10 left-0 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded-lg py-2 w-64 z-50 animate-fade-in max-h-80 overflow-y-auto">
                      {allFolders && allFolders.length > 0 ? (
                        allFolders.map(folder => (
                          <div 
                            key={folder._id} 
                            className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer flex items-center gap-3"
                            onMouseDown={() => navigateToFolder(folder._id)}
                          >
                            <svg className="w-5 h-5 text-[#5f6368]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                            </svg>
                            <span className="truncate">{folder.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2.5 text-[14px] text-[#5f6368] italic">
                          {t("folders.title_no_folders")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-row items-center gap-3">
                  <ul className="flex items-center list-none m-0 p-0 border border-[#747775] rounded-full overflow-hidden h-[36px]">
                    <li 
                      className={classNames(
                        "px-4 cursor-pointer transition-colors flex items-center justify-center h-full",
                        !listView ? "bg-[#c2e7ff]" : "bg-white hover:bg-[#f1f3f4]"
                      )}
                      onClick={!listView ? undefined : changeListViewMode}
                    >
                      <div className="flex items-center gap-1.5">
                        {!listView && <svg className="w-3.5 h-3.5 text-[#001d35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                        <svg className={classNames("w-4 h-4", !listView ? "text-[#001d35]" : "text-[#444746]")} viewBox="0 0 512 512">
                          <path fill="currentColor" d="M296 32h192c13.255 0 24 10.745 24 24v160c0 13.255-10.745 24-24 24H296c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24zm-80 0H24C10.745 32 0 42.745 0 56v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24zM0 296v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V296c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm296 184h192c13.255 0 24-10.745 24-24V296c0-13.255-10.745-24-24-24H296c-13.255 0-24 10.745-24 24v160c0 13.255 10.745 24 24 24z"></path>
                        </svg>
                      </div>
                    </li>
                    <div className="w-[1px] h-full bg-[#747775]"></div>
                    <li 
                      className={classNames(
                        "px-4 cursor-pointer transition-colors flex items-center justify-center h-full",
                        listView ? "bg-[#c2e7ff]" : "bg-white hover:bg-[#f1f3f4]"
                      )}
                      onClick={listView ? undefined : changeListViewMode}
                    >
                      <div className="flex items-center gap-1.5">
                        {listView && <svg className="w-3.5 h-3.5 text-[#001d35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                        <svg className={classNames("w-4 h-4", listView ? "text-[#001d35]" : "text-[#444746]")} viewBox="0 0 512 512">
                          <path fill="currentColor" d="M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path>
                        </svg>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {isHome && (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
                    
                    <div 
                      className={classNames(
                        "flex items-center gap-1 px-3 py-1.5 border rounded-lg text-[14px] font-medium cursor-pointer transition-colors whitespace-nowrap",
                        selectedType ? "bg-[#c2e7ff] border-[#c2e7ff] text-[#001d35]" : "border-[#747775] text-[#444746] hover:bg-[#f1f3f4]"
                      )}
                      onMouseDown={() => setOpenFilter(openFilter === "type" ? null : "type")}
                    >
                      <span>{selectedType ? selectedType : t("filters.type")}</span>
                      {selectedType ? (
                        <svg className="w-4 h-4 ml-1 hover:text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" onMouseDown={(e) => { e.stopPropagation(); handleFilterSelect("type", null, null); }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                      )}
                    </div>

                    <div className="flex items-center gap-1 px-3 py-1.5 border border-[#747775] rounded-lg text-[14px] text-[#444746] font-medium cursor-pointer hover:bg-[#f1f3f4] transition-colors whitespace-nowrap">
                      <span>{t("filters.people")}</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                    </div>

                    <div 
                      className={classNames(
                        "flex items-center gap-1 px-3 py-1.5 border rounded-lg text-[14px] font-medium cursor-pointer transition-colors whitespace-nowrap",
                        selectedDate ? "bg-[#c2e7ff] border-[#c2e7ff] text-[#001d35]" : "border-[#747775] text-[#444746] hover:bg-[#f1f3f4]"
                      )}
                      onMouseDown={() => setOpenFilter(openFilter === "modified" ? null : "modified")}
                    >
                      <span>{selectedDate ? selectedDate : t("filters.modified")}</span>
                      {selectedDate ? (
                        <svg className="w-4 h-4 ml-1 hover:text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" onMouseDown={(e) => { e.stopPropagation(); handleFilterSelect("modified", null, null); }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                      )}
                    </div>
                  </div>

                  {openFilter === "type" && (
                    <div className="absolute top-10 left-0 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded-lg py-2 w-56 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("type", "docs", t("filters.type_docs"))}>{t("filters.type_docs")}</div>
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("type", "images", t("filters.type_images"))}>{t("filters.type_images")}</div>
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("type", "folders", t("filters.type_folders"))}>{t("filters.type_folders")}</div>
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("type", "pdfs", t("filters.type_pdfs"))}>{t("filters.type_pdfs")}</div>
                    </div>
                  )}

                  {openFilter === "modified" && (
                    <div className="absolute top-10 left-32 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded-lg py-2 w-56 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("modified", "today", t("filters.modified_today"))}>{t("filters.modified_today")}</div>
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("modified", "week", t("filters.modified_week"))}>{t("filters.modified_week")}</div>
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("modified", "month", t("filters.modified_month"))}>{t("filters.modified_month")}</div>
                      <div className="px-4 py-2.5 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer" onMouseDown={() => handleFilterSelect("modified", "year", t("filters.modified_year"))}>{t("filters.modified_year")}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {listView ? (
              <div className="w-full pb-8">
                <table className="w-full min-w-[700px] border-collapse table-fixed">
                  <thead>
                    <tr>
                      <th className="text-left border-b border-[#dadce0] pb-3 pl-4 w-[40%]">
                        <div className="flex items-center gap-1 cursor-pointer hover:bg-black/5 w-fit px-2 py-1 rounded transition-colors" onClick={switchOrderSortBy}>
                          <p className="text-[#5f6368] text-[14px] font-medium m-0">{t("files.col_name")}</p>
                          <div className="bg-[#e8eaed] rounded-full p-0.5">
                            <svg className="w-3.5 h-3.5 text-[#1f1f1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={sortBy === "date_desc" || sortBy === "alp_desc" ? { transform: "scaleY(-1)" } : {}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                          </div>
                        </div>
                      </th>
                      <th className="text-left hidden md:table-cell border-b border-[#dadce0] pb-3 w-[20%]">
                         <p className="text-[#5f6368] text-[14px] font-medium m-0">{t("files.col_owner")}</p>
                      </th>
                      <th className="text-left hidden fileListShowDetails:table-cell border-b border-[#dadce0] pb-3 w-[20%]">
                        <p className="text-[#5f6368] text-[14px] font-medium m-0">{t("files.col_created")}</p>
                      </th>
                      <th className="text-left hidden fileListShowDetails:table-cell border-b border-[#dadce0] pb-3 w-[15%]">
                        <p className="text-[#5f6368] text-[14px] font-medium m-0">{t("files.col_size")}</p>
                      </th>
                      <th className="text-right border-b border-[#dadce0] pb-3 pr-4 w-[5%]">
                         <div className="flex items-center justify-end gap-1 cursor-pointer hover:bg-black/5 px-2 py-1 rounded transition-colors">
                            <p className="text-[#5f6368] text-[14px] font-medium m-0 opacity-0">{t("folders.col_actions")}</p>
                         </div>
                      </th>
                    </tr>
                  </thead>
                  <Folders scrollDivRef={scrollDivRef} />
                  <Files />
                </table>
              </div>
            ) : (
              <div className="w-full pb-8">
                 <Folders scrollDivRef={scrollDivRef} />
                 <Files />
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="w-full flex justify-center items-center h-full min-h-[300px]">
            <Spinner />
          </div>
        )}
        <div ref={sentinelRef} className="h-1"></div>
        {isFetchingNextPageState && (
          <div className="w-full flex justify-center items-center my-6">
            <Spinner />
          </div>
        )}
      </div>
    );
  }
);

export default DataForm;