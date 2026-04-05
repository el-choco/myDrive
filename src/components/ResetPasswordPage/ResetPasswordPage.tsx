import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../Spinner/Spinner";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import { resetPasswordAPI } from "../../api/userAPI";
import AlertIcon from "../../icons/AlertIcon";
import { AxiosError } from "axios";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const ResetPasswordPage = () => {
  const token = useParams().token!;
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const errorMessage = (() => {
    if (password.length === 0) {
      return "";
    }
    if (password.length < 6) {
      return t("settings.err_length");
    } else if (password.length > 256) {
      return t("settings.err_max_length");
    }
    if (password.length && verifyPassword.length && password !== verifyPassword) {
      return t("settings.err_match");
    }
    return "";
  })();

  const isSubmitDisabled = !password.length || password !== verifyPassword || errorMessage;

  const onSubmit = async (e: any) => {
    try {
      e.preventDefault();
      setLoadingLogin(true);
      await toast.promise(resetPasswordAPI(password, token), {
        pending: t("login.toast_resetting_password"),
        success: t("login.toast_reset_success"),
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 401) {
        setError(t("login.err_invalid_token"));
      } else {
        setError(t("login.err_reset"));
      }
      console.log("Reset Password Error", e);
      setLoadingLogin(false);
    }
  };

  const googleLogo = (
    <svg viewBox="0 0 74 24" width="74" height="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.74 10.63V15.3H23.01C22.6 17.51 20.35 22.14 10.02 22.14C3.87 22.14 -1.13 17.06 -1.13 10.91C-1.13 4.76 3.87 -0.32 10.02 -0.32C16.8 -0.32 19.88 4.76 20.61 6.35L15.65 8.7C14.7 6.47 12.87 4.73 10.02 4.73C6.44 4.73 3.99 7.76 3.99 10.91C3.99 14.06 6.44 17.09 10.02 17.09C14.39 17.09 16.65 14.28 17.55 10.63H9.74Z" fill="#4285f4"/>
      <path d="M33.4 8.08C29.6 8.08 26.35 10.94 26.35 15.01C26.35 19.08 29.6 21.94 33.4 21.94C37.2 21.94 40.45 19.08 40.45 15.01C40.45 10.94 37.2 8.08 33.4 8.08ZM33.4 18.08C31.5 18.08 29.84 16.78 29.84 15.01C29.84 13.24 31.5 11.94 33.4 11.94C35.3 11.94 36.96 13.24 36.96 15.01C36.96 16.78 35.3 18.08 33.4 18.08Z" fill="#ea4335"/>
      <path d="M49.26 8.08C45.46 8.08 42.21 10.94 42.21 15.01C42.21 19.08 45.46 21.94 49.26 21.94C53.06 21.94 56.31 19.08 56.31 15.01C56.31 10.94 53.06 8.08 49.26 8.08ZM49.26 18.08C47.36 18.08 45.7 16.78 45.7 15.01C45.7 13.24 47.36 11.94 49.26 11.94C51.16 11.94 52.82 13.24 52.82 15.01C52.82 16.78 51.16 18.08 49.26 18.08Z" fill="#fbbc05"/>
      <path d="M70.18 8.78V9.75C70.18 13.51 67.24 16.89 63.38 16.89C59.54 16.89 56.4 13.82 56.4 9.75C56.4 5.68 59.54 2.61 63.38 2.61C66.52 2.61 68.64 4.54 69.58 6.55L66.52 7.82C65.88 6.32 64.79 5.38 63.38 5.38C61.43 5.38 59.57 6.94 59.57 9.75C59.57 12.56 61.43 14.12 63.38 14.12C65.11 14.12 66.24 12.92 66.86 11.72H63.38V8.78H70.18Z" fill="#4285f4"/>
      <path d="M73.53 1.07V21.5H76.7V1.07H73.53Z" fill="#34a853"/>
    </svg>
  );

  return (
    <div className="bg-[#f0f4f9] w-screen min-h-screen flex justify-center items-center font-sans">
      <div className="bg-white sm:border border-[#dadce0] sm:rounded-[8px] p-6 sm:p-10 w-full sm:w-[450px] min-h-screen sm:min-h-[500px] flex flex-col relative transition-all duration-300">
        <div className="flex flex-col items-center mb-8 mt-4">
          {googleLogo}
          <h1 className="text-[#1f1f1f] text-[24px] font-normal mt-4 mb-1 text-center">
            {t("login.title_reset")}
          </h1>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col flex-1">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="password"
                placeholder={t("login.password_placeholder")}
                className="w-full h-[54px] px-4 text-[#1f1f1f] border border-[#dadce0] rounded-[4px] outline-none text-[16px] focus:border-[#1a73e8] focus:border-2 transition-all placeholder:text-[#5f6368]"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                disabled={loadingLogin}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder={t("login.verify_password_placeholder")}
                className="w-full h-[54px] px-4 text-[#1f1f1f] border border-[#dadce0] rounded-[4px] outline-none text-[16px] focus:border-[#1a73e8] focus:border-2 transition-all placeholder:text-[#5f6368]"
                onChange={(e) => setVerifyPassword(e.target.value)}
                value={verifyPassword}
                disabled={loadingLogin}
              />
            </div>
          </div>

          {(error || errorMessage) && (
             <div className="mt-4 flex items-center">
               <AlertIcon className="w-4 h-4 text-[#d93025] mr-2 shrink-0" />
               <p className="text-[#d93025] text-[12px] font-medium m-0">
                 {error ? error : errorMessage}
               </p>
             </div>
          )}

          <div className="mt-auto pt-10 flex flex-row items-center justify-end">
            <button
              type="submit"
              disabled={!!isSubmitDisabled || loadingLogin}
              className={classNames(
                "bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2 rounded-full text-[14px] font-medium transition-colors outline-none border-none relative flex items-center justify-center min-w-[80px] h-[36px]",
                {
                  "opacity-50 cursor-not-allowed": isSubmitDisabled,
                  "cursor-pointer": !isSubmitDisabled
                }
              )}
            >
              {loadingLogin ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin absolute"></div>
              ) : (
                <span>{t("settings.btn_submit")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default ResetPasswordPage;