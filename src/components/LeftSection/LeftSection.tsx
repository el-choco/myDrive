import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClickOutOfBounds, useUtils } from "../../hooks/utils";
import AddNewDropdown from "../AddNewDropdown/AddNewDropdown";
import TrashIcon from "../../icons/TrashIcon";
import classNames from "classnames";
import PhotoIcon from "../../icons/PhotoIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { closeDrawer } from "../../reducers/leftSection";
import SettingsIcon from "../../icons/SettingsIcon";
import HomeIconOutline from "../../icons/HomeIconOutline";
import { addNavigationMap } from "../../reducers/selected";
import { useTranslation } from "react-i18next";

const LeftSection = ({
  scrollDivRef,
}: {
  scrollDivRef: React.RefObject<HTMLDivElement>;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const leftSectionOpen = useAppSelector((state) => state.leftSection.drawOpen);
  const user = useAppSelector((state) => state.user.user);
  const { isHome, isHomeFolder, isTrash, isMedia, isSettings } = useUtils();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const addNewDisabled = useRef(false);
  const closeDropdownDisabled = useRef(true);
  const { t } = useTranslation();

  const openDropdown = () => {
    if (addNewDisabled.current) return;
    addNewDisabled.current = true;
    closeDropdownDisabled.current = true;
    setIsDropdownOpen(true);
    setTimeout(() => (closeDropdownDisabled.current = false), 300);
  };

  const closeDropdown = useCallback(() => {
    if (closeDropdownDisabled.current) return;
    addNewDisabled.current = true;
    closeDropdownDisabled.current = true;
    setIsDropdownOpen(false);

    setTimeout(() => (addNewDisabled.current = false), 300);
  }, []);

  const goHome = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/home");
  };

  const goTrash = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/trash");
  };

  const goMedia = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/media");
  };

  const goSettings = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    navigate("/settings");
  };

  const goSystemSettings = () => {
    dispatch(closeDrawer());
    dispatch(
      addNavigationMap({
        url: window.location.pathname,
        scrollTop: scrollDivRef.current?.scrollTop || 0,
      })
    );
    // Hier übergeben wir den Tab-Status an die Settings-Seite!
    navigate("/settings", { state: { tab: "system" } });
  };

  const closeDrawerEvent = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!leftSectionOpen) return;

      const target = e.target as HTMLElement;
      const idsToIgnore = ["search-bar", "menu-icon", "header"];

      if (!target || idsToIgnore.includes(target.id)) {
        return;
      }

      dispatch(closeDrawer());
    },
    [leftSectionOpen]
  );

  const { wrapperRef } = useClickOutOfBounds(closeDrawerEvent, leftSectionOpen);

  const formatBytesToGB = (bytes?: number) => {
    if (bytes === undefined) return "0.00";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
  };

  const storageUsed = formatBytesToGB(user?.storageUsed);
  const storageTotal = formatBytesToGB(user?.storageLimit || 53687091200);
  const storagePercentage = Math.min(
    ((user?.storageUsed || 0) / (user?.storageLimit || 53687091200)) * 100,
    100
  );

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        "pt-4 fixed desktopMode:relative w-[260px] min-w-[260px] bg-[#f8f9fa] h-full z-30 desktopMode:z-0 animate-movement flex flex-col justify-between",
        {
          "-left-[260px] desktopMode:left-0": !leftSectionOpen,
          "left-0 shadow-2xl desktopMode:shadow-none": leftSectionOpen,
        }
      )}
    >
      <div className="flex flex-col select-none text-sm overflow-y-auto">
        <div>
          <div className="relative mb-4">
            <a
              onClick={openDropdown}
              className="flex items-center justify-start bg-white hover:bg-[#f1f3f4] hover:shadow-md shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] rounded-2xl px-4 py-3.5 ml-3 mb-4 w-fit cursor-pointer transition-all"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 36 36">
                <path fill="#34A853" d="M16 16v14h4V20z"></path>
                <path fill="#4285F4" d="M30 16H20l-4 4h14z"></path>
                <path fill="#FBBC05" d="M6 16v4h10l4-4z"></path>
                <path fill="#EA4335" d="M20 16V6h-4v14z"></path>
                <path fill="none" d="M0 0h36v36H0z"></path>
              </svg>
              <span className="text-[#3c4043] font-medium text-[14px] pr-2">
                {t("sidebar.add_new")}
              </span>
            </a>
            <AddNewDropdown
              closeDropdown={closeDropdown}
              isDropdownOpen={isDropdownOpen}
            />
          </div>
        </div>

        <div className="pr-4 space-y-1">
          <div
            className={classNames(
              "pl-4 ml-3 py-2.5 rounded-full cursor-pointer transition-colors flex flex-row items-center w-full",
              isHome || isHomeFolder
                ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                : "text-[#444746] hover:bg-[#e9eef6]"
            )}
            onClick={goHome}
          >
            <HomeIconOutline className={classNames("w-5 h-5", (isHome || isHomeFolder) ? "text-[#001d35]" : "text-[#444746]")} />
            <p className="ml-4 text-[14px] m-0">{t("sidebar.home")}</p>
          </div>

          <div
            className={classNames(
              "pl-4 ml-3 py-2.5 rounded-full cursor-pointer transition-colors flex flex-row items-center w-full",
              isMedia
                ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                : "text-[#444746] hover:bg-[#e9eef6]"
            )}
            onClick={goMedia}
          >
            <PhotoIcon className={classNames("w-5 h-5", isMedia ? "text-[#001d35]" : "text-[#444746]")} />
            <p className="ml-4 text-[14px] m-0">{t("sidebar.media")}</p>
          </div>

          <div
            className={classNames(
              "pl-4 ml-3 py-2.5 rounded-full cursor-pointer transition-colors flex flex-row items-center desktopMode:hidden w-full",
              isSettings
                ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                : "text-[#444746] hover:bg-[#e9eef6]"
            )}
            onClick={goSettings}
          >
            <SettingsIcon className={classNames("w-5 h-5", isSettings ? "text-[#001d35]" : "text-[#444746]")} />
            <p className="ml-4 text-[14px] m-0">{t("sidebar.settings")}</p>
          </div>

          <div
            className={classNames(
              "pl-4 ml-3 py-2.5 rounded-full cursor-pointer transition-colors flex flex-row items-center w-full",
              isTrash
                ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                : "text-[#444746] hover:bg-[#e9eef6]"
            )}
            onClick={goTrash}
          >
            <TrashIcon className={classNames("w-5 h-5", isTrash ? "text-[#001d35]" : "text-[#444746]")} />
            <p className="ml-4 text-[14px] m-0">{t("sidebar.trash")}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 mt-auto">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-[#5f6368] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span className="text-[#3c4043] text-[14px] font-medium">{t("sidebar.storage")}</span>
        </div>
        
        <div className="w-full bg-[#e0e0e0] h-1.5 rounded-full mb-2 overflow-hidden">
          <div 
            className="bg-[#1a73e8] h-full rounded-full transition-all duration-500" 
            style={{ width: `${storagePercentage}%` }}
          ></div>
        </div>
        
        <p className="text-[13px] text-[#3c4043] mb-4 m-0">
          {t("sidebar.storage_used", { used: storageUsed, total: `${storageTotal} GB` })}
        </p>

        <button 
          onClick={goSystemSettings}
          className="w-full bg-white border border-[#dadce0] text-[#1a73e8] hover:bg-[#f8f9fa] hover:border-[#d2e3fc] px-4 py-2 rounded-full text-[14px] font-medium transition-colors outline-none cursor-pointer"
        >
          {t("sidebar.buy_storage")}
        </button>
      </div>
    </div>
  );
};

export default LeftSection;