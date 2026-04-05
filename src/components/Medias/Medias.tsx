import classNames from "classnames";
import React, { memo, useEffect, useRef, useState } from "react";
import MediaItem from "../MediaItem/MediaItem";
import { useFiles } from "../../hooks/files";
import MultiSelectBar from "../MultiSelectBar/MultiSelectBar";
import { useInfiniteScroll } from "../../hooks/infiniteScroll";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { setMediaFilter, setSortBy } from "../../reducers/filter";
import Spinner from "../Spinner/Spinner";
import { removeNavigationMap } from "../../reducers/selected";
import { useTranslation } from "react-i18next";

const Medias = memo(
  ({ scrollDivRef }: { scrollDivRef: React.RefObject<HTMLDivElement> }) => {
    const {
      data: files,
      fetchNextPage: filesFetchNextPage,
      isFetchingNextPage: isFetchingNextPageState,
      isLoading: isLoadingFiles,
    } = useFiles();
    const [initialLoad, setInitialLoad] = useState(true);
    const { sentinelRef, reachedIntersect } = useInfiniteScroll();
    const sortBy = useAppSelector((state) => state.filter.sortBy);
    const mediaFilter = useAppSelector((state) => state.filter.mediaFilter);
    const navigationMap = useAppSelector((state) => {
      return state.selected.navigationMap[window.location.pathname];
    });
    const isFetchingNextPage = useRef(false);
    const { t } = useTranslation();

    const dispatch = useAppDispatch();

    useEffect(() => {
      if (initialLoad) {
        setInitialLoad(false);
        return;
      } else if (!files || isFetchingNextPage.current) {
        return;
      }
      if (reachedIntersect && !isLoadingFiles) {
        isFetchingNextPage.current = true;
        filesFetchNextPage().then(() => {
          isFetchingNextPage.current = false;
        });
      }
    }, [reachedIntersect, initialLoad, isLoadingFiles]);

    useEffect(() => {
      if (!initialLoad && navigationMap) {
        scrollDivRef.current?.scrollTo(0, navigationMap.scrollTop);
        dispatch(removeNavigationMap(window.location.pathname));
      }
    }, [initialLoad, navigationMap, window.location.pathname]);

    const switchOrderSortBy = () => {
      let newSortBy = "";
      switch (sortBy) {
        case "date_asc": {
          newSortBy = "date_desc";
          break;
        }
        case "date_desc": {
          newSortBy = "date_asc";
          break;
        }
        case "alp_asc": {
          newSortBy = "alp_desc";
          break;
        }
        case "alp_desc": {
          newSortBy = "alp_asc";
          break;
        }
        default: {
          newSortBy = "date_desc";
          break;
        }
      }

      dispatch(setSortBy(newSortBy));
    };

    const mediaFilterOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;

      dispatch(setMediaFilter(value));
    };

    const title = (() => {
      if (mediaFilter === "all") {
        return t("medias.title_all");
      } else if (mediaFilter === "photos") {
        return t("medias.title_photos");
      } else if (mediaFilter === "videos") {
        return t("medias.title_videos");
      }
    })();

    return (
      <div className="w-full overflow-y-scroll select-none relative" ref={scrollDivRef}>
        <div className="flex flex-row justify-between items-center mt-2 p-4 desktopMode:px-8 mb-2 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
          <h2 className={classNames("m-0 text-[18px] font-medium text-[#1f1f1f]")}>{title}</h2>
          <div className="flex flex-row items-center gap-2">
            <a className="p-2 rounded-full hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer" onClick={switchOrderSortBy}>
              <svg
                className="h-4 w-4 text-[#5f6368] animate-movement"
                viewBox="0 0 6 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={
                  sortBy === "date_desc" || sortBy === "alp_desc"
                    ? { transform: "scaleY(-1)" }
                    : {}
                }
              >
                <g id="upload">
                  <path
                    id="Path"
                    d="M5.58035 2.51616L3.20339 0.139199C3.01776 -0.0463997 2.71681 -0.0463997 2.53119 0.139199L0.154195 2.51616C-0.0282007 2.70502 -0.0229639 3.00597 0.165894 3.18836C0.350128 3.3663 0.642189 3.3663 0.826423 3.18836L2.39191 1.62288V9.50781C2.39191 9.77037 2.60475 9.98321 2.86731 9.98321C3.12988 9.98321 3.34272 9.77037 3.34272 9.50781V1.6229L4.90821 3.18839C5.09706 3.37079 5.39801 3.36555 5.58041 3.17669C5.75829 2.99246 5.75829 2.7004 5.58035 2.51616Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </a>
            <select
              className="text-[14px] font-medium appearance-none bg-transparent text-[#5f6368] cursor-pointer outline-none hover:text-[#1f1f1f] transition-colors"
              onChange={mediaFilterOnChange}
              value={mediaFilter}
            >
              <option value="all">{t("medias.filter_all")}</option>
              <option value="photos">{t("medias.filter_photos")}</option>
              <option value="videos">{t("medias.filter_videos")}</option>
            </select>
          </div>
        </div>

        {!isLoadingFiles && (
          <div
            className={classNames(
              "grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[2px] p-0.5 desktopMode:px-8 bg-white"
            )}
          >
            <div className="fixed bottom-0 flex justify-center items-center right-0 left-0 z-30 pointer-events-none">
              <MultiSelectBar />
            </div>
            {files?.pages.map((filePage, index) => (
              <React.Fragment key={index}>
                {filePage.map((file) => (
                  <MediaItem file={file} key={file._id} />
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
        
        {isLoadingFiles && (
          <div className="w-full flex justify-center items-center h-[50vh]">
            <Spinner />
          </div>
        )}
        {isFetchingNextPageState && (
          <div className="w-full flex justify-center items-center mt-6 mb-6">
            <Spinner />
          </div>
        )}
        <div ref={sentinelRef} className="h-1"></div>
      </div>
    );
  }
);

export default Medias;