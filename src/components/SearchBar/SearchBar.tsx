import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../hooks/store";
import { useSearchSuggestions } from "../../hooks/files";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import SearchBarItem from "../SearchBarItem/SearchBarItem";
import { FolderInterface } from "../../types/folders";
import { FileInterface } from "../../types/file";
import classNames from "classnames";
import { closeDrawer } from "../../reducers/leftSection";
import { setPopupSelect } from "../../reducers/selected";
import CloseIcon from "../../icons/CloseIcon";
import SearchIcon from "../../icons/SearchIcon";
import { useTranslation } from "react-i18next";

const SearchBar = memo(() => {
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useAppDispatch();
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const { data: searchSuggestions, isLoading: isLoadingSearchSuggestions } =
    useSearchSuggestions(debouncedSearchText);
  const navigate = useNavigate();
  const { isTrash, isMedia } = useUtils();
  const { t } = useTranslation();

  const debouncedSetSearchText = useMemo(
    () => debounce(setDebouncedSearchText, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchText(searchText);
    return () => {
      debouncedSetSearchText.cancel();
    };
  }, [searchText, debouncedSetSearchText]);

  const resetState = () => {
    setSearchText("");
    setDebouncedSearchText("");
  };

  const outOfContainerClick = useCallback(() => {
    closeDrawer();
    setShowSuggestions(false);
  }, []);

  const { wrapperRef } = useClickOutOfBounds(outOfContainerClick);

  const onSearch = (e: any) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (isMedia) {
      if (searchText.length) {
        navigate(`/search-media/${searchText}`);
      } else {
        navigate("/media");
      }
    } else if (isTrash) {
      if (searchText.length) {
        navigate(`/search-trash/${searchText}`);
      } else {
        navigate("/trash");
      }
    } else {
      if (searchText.length) {
        navigate(`/search/${searchText}`);
      } else {
        navigate("/home");
      }
    }
  };

  const onChangeSearch = (e: any) => {
    setSearchText(e.target.value);
  };

  const fileClick = (file: FileInterface) => {
    dispatch(setPopupSelect({ type: "file", file }));
    resetState();
  };

  const folderClick = (folder: FolderInterface) => {
    if (!isTrash) {
      navigate(`/folder/${folder?._id}`);
    } else {
      navigate(`/folder-trash/${folder?._id}`);
    }
    resetState();
  };

  const calculatedHeight =
    47 *
      (searchSuggestions?.folderList.length +
        searchSuggestions?.fileList.length) || 56;

  const onFocus = () => {
    dispatch(closeDrawer());
    setShowSuggestions(true);
  };

  const searchTextPlaceholder = (() => {
    if (isMedia) {
      return t("search.placeholder_media");
    } else if (isTrash) {
      return t("search.placeholder_trash");
    } else {
      return t("search.placeholder_default");
    }
  })();

  return (
    <form
      onSubmit={onSearch}
      className="w-full max-w-[720px] relative flex items-center justify-center flex-col mx-4"
      ref={wrapperRef as any}
    >
      <div
        className={classNames(
          "w-full h-12 flex items-center rounded-full transition-all duration-200 overflow-hidden",
          showSuggestions
            ? "bg-white shadow-[0_1px_1px_0_rgba(65,69,73,0.3),0_1px_3px_1px_rgba(65,69,73,0.15)]"
            : "bg-[#e9eef6] hover:bg-white hover:shadow-[0_1px_1px_0_rgba(65,69,73,0.3),0_1px_3px_1px_rgba(65,69,73,0.15)]"
        )}
      >
        <div className="pl-4 pr-3 flex items-center justify-center">
          {isLoadingSearchSuggestions ? (
            <div className="w-5 h-5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SearchIcon className="w-6 h-6 text-[#5f6368]" />
          )}
        </div>
        
        <input
          type="text"
          onChange={onChangeSearch}
          value={searchText}
          placeholder={searchTextPlaceholder}
          className="w-full h-full bg-transparent border-none outline-none text-[#3c4043] text-[16px] placeholder:text-[#5f6368]"
          onFocus={onFocus}
          id="search-bar"
          autoComplete="off"
        />

        {searchText.length !== 0 && !isLoadingSearchSuggestions && (
          <div 
            className="pr-4 pl-2 flex items-center justify-center cursor-pointer hover:bg-black/5 rounded-full p-2 mr-2"
            onClick={resetState}
          >
            <CloseIcon className="w-5 h-5 text-[#5f6368]" />
          </div>
        )}
      </div>

      <div
        className={classNames(
          "absolute left-0 top-[52px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-2xl w-full max-h-[400px] overflow-y-scroll z-50 transition-opacity duration-200",
          {
            "opacity-0 invisible pointer-events-none": !(showSuggestions && debouncedSearchText.length),
            "opacity-100 visible border border-gray-100 py-2": showSuggestions && debouncedSearchText.length,
          }
        )}
        style={{
          height: showSuggestions && debouncedSearchText.length ? calculatedHeight : 0,
        }}
      >
        {searchSuggestions?.folderList.length === 0 &&
        searchSuggestions?.fileList.length === 0 ? (
          <div className="flex justify-center items-center p-4">
            <span className="text-[#5f6368] text-sm">{t("search.no_results")}</span>
          </div>
        ) : undefined}
        {searchSuggestions?.folderList.map((folder: FolderInterface) => (
          <SearchBarItem
            type="folder"
            folder={folder}
            folderClick={folderClick}
            fileClick={fileClick}
            key={folder._id}
          />
        ))}
        {searchSuggestions?.fileList.map((file: FileInterface) => (
          <SearchBarItem
            type="file"
            file={file}
            folderClick={folderClick}
            fileClick={fileClick}
            key={file._id}
          />
        ))}
      </div>
    </form>
  );
});

export default SearchBar;