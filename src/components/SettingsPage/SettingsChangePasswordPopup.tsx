import { useEffect, useState } from "react";
import CloseIcon from "../../icons/CloseIcon";
import classNames from "classnames";
import { toast } from "react-toastify";
import { changePasswordAPI } from "../../api/userAPI";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

interface SettingsChangePasswordPopupProps {
  closePopup: () => void;
}

const SettingsChangePasswordPopup: React.FC<
  SettingsChangePasswordPopupProps
> = ({ closePopup }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyNewPassword, setVerifyNewPassword] = useState("");
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { t } = useTranslation();

  const inputDisabled = (() => {
    if (
      loadingChangePassword ||
      currentPassword.length === 0 ||
      newPassword.length === 0 ||
      verifyNewPassword.length === 0
    ) {
      return true;
    }

    if (newPassword !== verifyNewPassword) {
      return true;
    }

    if (newPassword.length < 6) {
      return true;
    }

    return false;
  })();

  const errorMessage = (() => {
    if (newPassword.length === 0) {
      return "";
    }

    if (newPassword.length < 6) {
      return t("settings.err_length");
    } else if (newPassword.length > 256) {
      return t("settings.err_max_length");
    }

    if (
      newPassword.length &&
      verifyNewPassword.length &&
      newPassword !== verifyNewPassword
    ) {
      return t("settings.err_match");
    }

    return "";
  })();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const closeAnimate = () => {
    setAnimate(false);
    setTimeout(closePopup, 200);
  };

  const submitPasswordChange = async (e: any) => {
    e.preventDefault();
    setLoadingChangePassword(true);
    try {
      await toast.promise(changePasswordAPI(currentPassword, newPassword), {
        pending: t("toast.changing_password"),
        success: t("toast.password_changed"),
      });
      closeAnimate();
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 401) {
        toast.error(t("toast.incorrect_password"));
      } else {
        toast.error(t("toast.error_changing_password"));
      }
      console.log("Error changing password", e);
    } finally {
      setLoadingChangePassword(false);
    }
  };

  const outterWrapperClick = (e: any) => {
    if (e.target.id !== "outer-wrapper") return;
    closeAnimate();
  };

  return (
    <div
      id="outer-wrapper"
      className="w-screen dynamic-height bg-black/40 backdrop-blur-sm absolute top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center flex-col transition-opacity duration-200"
      onClick={outterWrapperClick}
    >
      <div 
        className={classNames(
          "w-[90%] sm:w-[440px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out transform",
          animate ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100">
          <p className="text-[18px] font-medium text-[#1f1f1f] m-0">{t("settings.change_password_title")}</p>
          <div 
            className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
            onClick={closeAnimate}
          >
             <CloseIcon className="w-5 h-5 text-[#5f6368]" />
          </div>
        </div>
        
        <form className="p-6 flex flex-col" onSubmit={submitPasswordChange}>
          <label className="mb-4">
            <p className="text-[13px] font-medium text-[#3c4043] mb-1.5">{t("settings.current_password")}</p>
            <input
              className="border border-[#dadce0] focus:border-[#1a73e8] focus:shadow-[inset_0_0_0_1px_#1a73e8] rounded-md py-2.5 px-3 text-[#3c4043] w-full text-[14px] outline-none transition-shadow bg-transparent"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>

          <label className="mb-4">
            <p className="text-[13px] font-medium text-[#3c4043] mb-1.5">{t("settings.new_password")}</p>
            <input
              className="border border-[#dadce0] focus:border-[#1a73e8] focus:shadow-[inset_0_0_0_1px_#1a73e8] rounded-md py-2.5 px-3 text-[#3c4043] w-full text-[14px] outline-none transition-shadow bg-transparent"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>

          <label className="mb-2">
            <p className="text-[13px] font-medium text-[#3c4043] mb-1.5">
              {t("settings.verify_password")}
            </p>
            <input
              className="border border-[#dadce0] focus:border-[#1a73e8] focus:shadow-[inset_0_0_0_1px_#1a73e8] rounded-md py-2.5 px-3 text-[#3c4043] w-full text-[14px] outline-none transition-shadow bg-transparent"
              type="password"
              value={verifyNewPassword}
              onChange={(e) => setVerifyNewPassword(e.target.value)}
            />
          </label>

          <div className="h-6 flex items-center justify-center">
            {errorMessage && (
              <p className="text-[12px] font-medium text-[#d93025] m-0">{errorMessage}</p>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <input
              type="submit"
              value={t("settings.btn_submit")}
              className={classNames(
                "bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2 rounded-full font-medium text-[14px] transition-colors outline-none border-none",
                {
                  "opacity-50 cursor-not-allowed": inputDisabled,
                  "cursor-pointer": !inputDisabled
                }
              )}
              disabled={inputDisabled}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsChangePasswordPopup;