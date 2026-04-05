import { useEffect, useState } from "react";
import { usePreferenceSetter } from "../../hooks/preferenceSetter";
import { useTranslation } from "react-i18next";

const SettingsPageGeneral = () => {
  const [listViewStyle, setListViewStyle] = useState("list");
  const [sortBy, setSortBy] = useState("date");
  const [orderBy, setOrderBy] = useState("descending");
  const [singleClickFolders, setSingleClickFolders] = useState("disabled");
  const [loadThumbnails, setLoadThumbnails] = useState("enabled");
  const { setPreferences } = usePreferenceSetter();
  const { t } = useTranslation();

  const fileListStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setListViewStyle(value);
    if (value === "list") {
      window.localStorage.setItem("list-mode", "true");
    } else {
      window.localStorage.removeItem("list-mode");
    }
    setPreferences();
  };

  const sortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    if (value === "name") {
      window.localStorage.setItem("sort-name", "true");
    } else {
      window.localStorage.removeItem("sort-name");
    }
    setPreferences();
  };

  const orderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setOrderBy(value);

    if (value === "ascending") {
      window.localStorage.setItem("order-asc", "true");
    } else {
      window.localStorage.removeItem("order-asc");
    }
    setPreferences();
  };

  const singleClickFoldersChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setSingleClickFolders(value);

    if (value === "enabled") {
      window.localStorage.setItem("single-click-folders", "true");
    } else {
      window.localStorage.removeItem("single-click-folders");
    }
    setPreferences();
  };

  const loadThumbnailsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLoadThumbnails(value);

    if (value === "disabled") {
      window.localStorage.setItem("not-load-thumbnails", "true");
    } else {
      window.localStorage.removeItem("not-load-thumbnails");
    }
    setPreferences();
  };

  useEffect(() => {
    const listModeLocalStorage = window.localStorage.getItem("list-mode");
    const listModeEnabled = listModeLocalStorage === "true";

    const sortByLocalStorage = window.localStorage.getItem("sort-name");
    const sortByNameEnabled = sortByLocalStorage === "true";

    const orderByLocalStorage = window.localStorage.getItem("order-asc");
    const orderByAscendingEnabled = orderByLocalStorage === "true";

    const singleClickFoldersLocalStorage = window.localStorage.getItem(
      "single-click-folders"
    );
    const singleClickFoldersEnabled = singleClickFoldersLocalStorage === "true";

    const loadThumbnailsLocalStorage = window.localStorage.getItem(
      "not-load-thumbnails"
    );
    const loadThumbnailsDisabled = loadThumbnailsLocalStorage === "true";

    setListViewStyle(listModeEnabled ? "list" : "grid");
    setSortBy(sortByNameEnabled ? "name" : "date");
    setOrderBy(orderByAscendingEnabled ? "ascending" : "descending");
    setSingleClickFolders(singleClickFoldersEnabled ? "enabled" : "disabled");
    setLoadThumbnails(loadThumbnailsDisabled ? "disabled" : "enabled");
  }, []);

  return (
    <div className="animate-fade-in">
      <h3 className="text-[18px] font-medium text-[#1f1f1f] mb-4 m-0">
        {t("settings.general_title")}
      </h3>
      
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.file_list_style")}</p>
          <select
            value={listViewStyle}
            onChange={fileListStyleChange}
            className="text-[14px] bg-[#f1f3f4] text-[#3c4043] rounded-md px-3 py-1.5 outline-none border-none cursor-pointer"
          >
            <option value="grid">{t("settings.grid")}</option>
            <option value="list">{t("settings.list")}</option>
          </select>
        </div>
        
        <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.sort_by")}</p>
          <select
            value={sortBy}
            onChange={sortByChange}
            className="text-[14px] bg-[#f1f3f4] text-[#3c4043] rounded-md px-3 py-1.5 outline-none border-none cursor-pointer"
          >
            <option value="date">{t("settings.date")}</option>
            <option value="name">{t("settings.name")}</option>
          </select>
        </div>
        
        <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.order_by")}</p>
          <select
            value={orderBy}
            onChange={orderByChange}
            className="text-[14px] bg-[#f1f3f4] text-[#3c4043] rounded-md px-3 py-1.5 outline-none border-none cursor-pointer"
          >
            <option value="descending">{t("settings.descending")}</option>
            <option value="ascending">{t("settings.ascending")}</option>
          </select>
        </div>
        
        <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.single_click")}</p>
          <select
            value={singleClickFolders}
            onChange={singleClickFoldersChange}
            className="text-[14px] bg-[#f1f3f4] text-[#3c4043] rounded-md px-3 py-1.5 outline-none border-none cursor-pointer"
          >
            <option value="disabled">{t("settings.disabled")}</option>
            <option value="enabled">{t("settings.enabled")}</option>
          </select>
        </div>
        
        <div className="px-6 py-4 flex flex-row justify-between items-center hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.load_thumbnails")}</p>
          <select
            value={loadThumbnails}
            onChange={loadThumbnailsChange}
            className="text-[14px] bg-[#f1f3f4] text-[#3c4043] rounded-md px-3 py-1.5 outline-none border-none cursor-pointer"
          >
            <option value="enabled">{t("settings.enabled")}</option>
            <option value="disabled">{t("settings.disabled")}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageGeneral;