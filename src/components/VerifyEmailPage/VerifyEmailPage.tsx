import { useParams } from "react-router-dom";
import { verifyEmailAPI } from "../../api/userAPI";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";
import Spinner from "../Spinner/Spinner";
import { useTranslation } from "react-i18next";

const VerifyEmailPage = () => {
  const token = useParams().token!;
  const { t } = useTranslation();

  const verifyEmail = async () => {
    try {
      await toast.promise(verifyEmailAPI(token), {
        pending: t("login.toast_verifying_email"),
        success: t("login.toast_email_verified"),
        error: t("login.toast_error_verifying_email"),
      });

      setTimeout(() => {
        window.location.assign("/");
      }, 1500);
    } catch (e) {
      console.log("Error verifying email", e);
    }
  };

  useEffect(() => {
    verifyEmail();
  }, []);

  const googleLogo = (
    <svg viewBox="0 0 74 24" width="74" height="24" xmlns="http://www.w3.org/2000/svg" className="mb-8">
      <path d="M9.74 10.63V15.3H23.01C22.6 17.51 20.35 22.14 10.02 22.14C3.87 22.14 -1.13 17.06 -1.13 10.91C-1.13 4.76 3.87 -0.32 10.02 -0.32C16.8 -0.32 19.88 4.76 20.61 6.35L15.65 8.7C14.7 6.47 12.87 4.73 10.02 4.73C6.44 4.73 3.99 7.76 3.99 10.91C3.99 14.06 6.44 17.09 10.02 17.09C14.39 17.09 16.65 14.28 17.55 10.63H9.74Z" fill="#4285f4"/>
      <path d="M33.4 8.08C29.6 8.08 26.35 10.94 26.35 15.01C26.35 19.08 29.6 21.94 33.4 21.94C37.2 21.94 40.45 19.08 40.45 15.01C40.45 10.94 37.2 8.08 33.4 8.08ZM33.4 18.08C31.5 18.08 29.84 16.78 29.84 15.01C29.84 13.24 31.5 11.94 33.4 11.94C35.3 11.94 36.96 13.24 36.96 15.01C36.96 16.78 35.3 18.08 33.4 18.08Z" fill="#ea4335"/>
      <path d="M49.26 8.08C45.46 8.08 42.21 10.94 42.21 15.01C42.21 19.08 45.46 21.94 49.26 21.94C53.06 21.94 56.31 19.08 56.31 15.01C56.31 10.94 53.06 8.08 49.26 8.08ZM49.26 18.08C47.36 18.08 45.7 16.78 45.7 15.01C45.7 13.24 47.36 11.94 49.26 11.94C51.16 11.94 52.82 13.24 52.82 15.01C52.82 16.78 51.16 18.08 49.26 18.08Z" fill="#fbbc05"/>
      <path d="M70.18 8.78V9.75C70.18 13.51 67.24 16.89 63.38 16.89C59.54 16.89 56.4 13.82 56.4 9.75C56.4 5.68 59.54 2.61 63.38 2.61C66.52 2.61 68.64 4.54 69.58 6.55L66.52 7.82C65.88 6.32 64.79 5.38 63.38 5.38C61.43 5.38 59.57 6.94 59.57 9.75C59.57 12.56 61.43 14.12 63.38 14.12C65.11 14.12 66.24 12.92 66.86 11.72H63.38V8.78H70.18Z" fill="#4285f4"/>
      <path d="M73.53 1.07V21.5H76.7V1.07H73.53Z" fill="#34a853"/>
    </svg>
  );

  return (
    <div className="bg-[#f0f4f9] w-screen min-h-screen flex justify-center items-center flex-col font-sans">
      {googleLogo}
      <div className="bg-white border border-[#dadce0] rounded-[8px] p-10 flex flex-col items-center justify-center shadow-sm">
         <Spinner />
         <p className="text-[#1f1f1f] text-[16px] font-medium mt-6 m-0">
           {t("login.title_verifying")}
         </p>
      </div>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default VerifyEmailPage;