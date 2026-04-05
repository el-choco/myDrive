import { useEffect, useState } from "react";
import ChevronOutline from "../../icons/ChevronOutline";
import Header from "../Header/Header";
import classNames from "classnames";
import AccountIcon from "../../icons/AccountIcon";
import TuneIcon from "../../icons/TuneIcon";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsAccountSection from "./SettingsAccountSection";
import { getUserDetailedAPI, logoutAPI } from "../../api/userAPI";
import Spinner from "../Spinner/Spinner";
import Swal from "sweetalert2";
import SettingsGeneralSection from "./SettingsGeneralSection";
import SettingsSystemSection from "./SettingsSystemSection";
import { useClickOutOfBounds } from "../../hooks/utils";
import MenuIcon from "../../icons/MenuIcon";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("account");
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Fängt die Weiterleitung vom "Speicherplatz erweitern"-Button ab
  useEffect(() => {
    if (location.state && location.state.tab) {
      setTab(location.state.tab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const getUser = async () => {
    try {
      const userResponse = await getUserDetailedAPI();
      setUser(userResponse);
    } catch (e) {
      console.log("Loading user details error", e);
      const result = await Swal.fire({
        title: t("settings.error_loading_user"),
        text: t("settings.error_loading_user_text"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1a73e8",
        cancelButtonColor: "#d33",
        confirmButtonText: t("settings.btn_yes_logout"),
      });
      if (result.value) {
        await toast.promise(logoutAPI(), {
          pending: t("toast.logging_out"),
          success: t("toast.logged_out"),
          error: t("toast.error_logging_out"),
        });

        window.localStorage.removeItem("hasPreviouslyLoggedIn");
        navigate("/");
      } else {
        navigate("/home");
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const { wrapperRef } = useClickOutOfBounds(() => setShowSidebarMobile(false));

  const changeTab = (tab: string) => {
    setTab(tab);
    setShowSidebarMobile(false);
  };

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      {/* HIER IST DER FIX: Feste Höhe für den Rest der Seite (Viewport minus Header-Höhe) */}
      <div className="flex flex-row sm:pt-[70px] max-w-[1200px] mx-auto h-full">
        
        {/* LINKER BEREICH: Bekommt sein eigenes overflow-y-auto */}
        <div
          ref={wrapperRef}
          className={classNames(
            "fixed sm:relative px-4 w-72 h-full overflow-y-auto animate-movement bg-white z-20 sm:z-0 pb-12",
            {
              "-ml-72 sm:ml-0": !showSidebarMobile,
              "ml-0 shadow-2xl sm:shadow-none": showSidebarMobile,
            }
          )}
        >
          <div
            onClick={() => navigate("/home")}
            className="text-[#5f6368] hover:text-[#1a73e8] cursor-pointer flex flex-row items-center space-x-2 pt-6 pb-4 px-4 transition-colors"
          >
            <ChevronOutline className="w-5 h-5 rotate-90" />
            <p className="font-medium text-[14px] m-0">{t("settings.back_to_drive")}</p>
          </div>
          
          <p className="px-4 text-[22px] font-normal text-[#1f1f1f] mt-2 mb-6">{t("settings.page_title")}</p>
          
          <div className="space-y-1 pr-4">
            <div
              className={classNames(
                "px-4 py-2.5 rounded-r-full cursor-pointer transition-colors flex flex-row items-center w-full",
                tab === "account"
                  ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                  : "text-[#3c4043] hover:bg-[#f1f3f4]"
              )}
              onClick={() => changeTab("account")}
            >
              <AccountIcon className={classNames("w-5 h-5", tab === "account" ? "text-[#001d35]" : "text-[#5f6368]")} />
              <p className="ml-4 m-0 text-[14px]">{t("settings.tab_account")}</p>
            </div>
            <div
              className={classNames(
                "px-4 py-2.5 rounded-r-full cursor-pointer transition-colors flex flex-row items-center w-full",
                tab === "general"
                  ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                  : "text-[#3c4043] hover:bg-[#f1f3f4]"
              )}
              onClick={() => changeTab("general")}
            >
              <TuneIcon className={classNames("w-5 h-5", tab === "general" ? "text-[#001d35]" : "text-[#5f6368]")} />
              <p className="ml-4 m-0 text-[14px]">{t("settings.tab_general")}</p>
            </div>
            
            {/* Der System/Admin Tab */}
            <div
              className={classNames(
                "px-4 py-2.5 rounded-r-full cursor-pointer transition-colors flex flex-row items-center w-full",
                tab === "system"
                  ? "bg-[#c2e7ff] text-[#001d35] font-medium"
                  : "text-[#3c4043] hover:bg-[#f1f3f4]"
              )}
              onClick={() => changeTab("system")}
            >
              <svg className={classNames("w-5 h-5", tab === "system" ? "text-[#001d35]" : "text-[#5f6368]")} viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 11h16V5H4v6zm2-4h2v2H6V7zm14 8H4v6h16v-6zm-12 4H6v-2h2v2z"/>
              </svg>
              <p className="ml-4 m-0 text-[14px]">{t("settings.tab_system") || "System"}</p>
            </div>
          </div>
        </div>
        
        {user && (
          /* RECHTER BEREICH: Unabhängiges Scrollen mit overflow-y-auto und viel Platz unten (pb-32) */
          <div className="pt-6 px-4 sm:px-12 w-full max-w-[800px] h-full overflow-y-auto pb-32">
            <div className="block sm:hidden mb-6 flex items-center gap-4">
              <div 
                className="p-2 rounded-full hover:bg-black/5 cursor-pointer"
                onClick={() => setShowSidebarMobile(!showSidebarMobile)}
              >
                <MenuIcon className="w-6 h-6 text-[#5f6368]" />
              </div>
              <p className="text-[22px] font-normal text-[#1f1f1f] m-0">{t("settings.page_title")}</p>
            </div>
            
            <div>
              {tab === "account" && (
                <SettingsAccountSection user={user} getUser={getUser} />
              )}
              {tab === "general" && <SettingsGeneralSection />}
              {tab === "system" && <SettingsSystemSection />}
            </div>
          </div>
        )}
        {!user && (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </div>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default SettingsPage;