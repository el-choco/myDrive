import React, { useRef, useState } from "react";
import SettingsChangePasswordPopup from "./SettingsChangePasswordPopup";
import { toast } from "react-toastify";
import { logoutAPI, resendVerifyEmailAPI } from "../../api/userAPI";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface SettingsPageAccountProps {
  user: {
    _id: string;
    email: string;
    emailVerified: boolean;
  };
  getUser: () => void;
}

const SettingsPageAccount: React.FC<SettingsPageAccountProps> = ({
  user,
  getUser,
}) => {
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const lastSentEmailVerifiation = useRef(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const logoutClick = async () => {
    try {
      const result = await Swal.fire({
        title: t("settings.logout_confirm_title"),
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#1a73e8",
        cancelButtonColor: "#d33",
        confirmButtonText: t("settings.btn_yes_logout"),
      });

      if (!result.value) return;

      await toast.promise(logoutAPI(), {
        pending: t("toast.logging_out"),
        success: t("toast.logged_out"),
        error: t("toast.error_logging_out"),
      });

      window.localStorage.removeItem("hasPreviouslyLoggedIn");

      navigate("/");
    } catch (e) {
      console.log("Error logging out", e);
    }
  };

  const logoutAllClick = async () => {
    try {
      const result = await Swal.fire({
        title: t("settings.logout_all_confirm_title"),
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#1a73e8",
        cancelButtonColor: "#d33",
        confirmButtonText: t("settings.btn_yes_logout_all"),
      });

      if (!result.value) return;

      await toast.promise(logoutAPI(), {
        pending: t("toast.logging_out_all"),
        success: t("toast.logged_out_all"),
        error: t("toast.error_logging_out_all"),
      });

      window.localStorage.removeItem("hasPreviouslyLoggedIn");

      navigate("/");
    } catch (e) {
      console.log("Error logging out", e);
    }
  };

  const resendEmailVerification = async () => {
    try {
      const currentDate = Date.now();
      if (currentDate - lastSentEmailVerifiation.current < 1000 * 60 * 1) {
        await Swal.fire({
          title: t("settings.wait_1_min"),
          icon: "warning",
          confirmButtonColor: "#1a73e8",
          confirmButtonText: t("settings.btn_okay"),
        });
        return;
      }
      lastSentEmailVerifiation.current = Date.now();

      await toast.promise(resendVerifyEmailAPI(), {
        pending: t("toast.resending_email"),
        success: t("toast.email_resent"),
        error: t("toast.error_resending_email"),
      });

      getUser();
    } catch (e) {
      console.log("Error resending email verification", e);
    }
  };

  return (
    <div className="animate-fade-in">
      {showChangePasswordPopup && (
        <SettingsChangePasswordPopup
          closePopup={() => setShowChangePasswordPopup(false)}
        />
      )}

      <h3 className="text-[18px] font-medium text-[#1f1f1f] mb-4 m-0">
        {t("settings.account_title")}
      </h3>
      
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.email")}</p>
          <p className="text-[#5f6368] text-[14px] m-0">{user.email}</p>
        </div>
        
        {"emailVerified" in user && !user.emailVerified && (
          <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
            <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.email_not_verified")}</p>
            {!user.emailVerified && (
              <button
                className="text-[#1a73e8] hover:bg-[#f1f3f4] px-4 py-1.5 rounded-full font-medium text-[14px] transition-colors bg-transparent border-none cursor-pointer outline-none"
                onClick={resendEmailVerification}
              >
                {t("settings.btn_resend")}
              </button>
            )}
          </div>
        )}
        
        <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.change_password")}</p>
          <button
            className="text-[#1a73e8] hover:bg-[#f1f3f4] px-4 py-1.5 rounded-full font-medium text-[14px] transition-colors bg-transparent border-none cursor-pointer outline-none"
            onClick={() => setShowChangePasswordPopup(true)}
          >
            {t("settings.btn_change")}
          </button>
        </div>
        
        <div className="px-6 py-4 flex flex-row justify-between items-center border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.logout_account")}</p>
          <button
            className="text-[#d93025] hover:bg-[#fce8e6] px-4 py-1.5 rounded-full font-medium text-[14px] transition-colors bg-transparent border-none cursor-pointer outline-none"
            onClick={logoutClick}
          >
            {t("settings.btn_logout")}
          </button>
        </div>
        
        <div className="px-6 py-4 flex flex-row justify-between items-center hover:bg-[#f8f9fa] transition-colors">
          <p className="text-[#3c4043] font-medium text-[14px] m-0">{t("settings.logout_all")}</p>
          <button
            className="text-[#d93025] hover:bg-[#fce8e6] px-4 py-1.5 rounded-full font-medium text-[14px] transition-colors bg-transparent border-none cursor-pointer outline-none"
            onClick={logoutAllClick}
          >
            {t("settings.btn_logout_all")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageAccount;