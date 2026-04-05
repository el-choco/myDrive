import { useEffect, useRef, useState } from "react";
import {
  createAccountAPI,
  getUserAPI,
  loginAPI,
  sendPasswordResetAPI,
} from "../../api/userAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "../../reducers/user";
import { useAppDispatch } from "../../hooks/store";
import AlertIcon from "../../icons/AlertIcon";
import Spinner from "../Spinner/Spinner";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import isEmail from "validator/es/lib/isEmail";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [mode, setMode] = useState<"login" | "create" | "reset">("login");
  const [attemptingLogin, setAttemptingLogin] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const lastSentPassowordReset = useRef(0);
  const { t } = useTranslation();

  const attemptLoginWithToken = async () => {
    setAttemptingLogin(true);

    try {
      const userResponse = await getUserAPI();

      const redirectPath = location.state?.from?.pathname || "/home";
      dispatch(setUser(userResponse));
      navigate(redirectPath);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");
    } catch (e) {
      setAttemptingLogin(false);
      if (window.localStorage.getItem("hasPreviouslyLoggedIn")) {
        setError(t("login.err_expired"));
        window.localStorage.removeItem("hasPreviouslyLoggedIn");
      }
    }
  };

  const login = async () => {
    try {
      setLoadingLogin(true);
      const loginResponse = await loginAPI(email, password);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");
      dispatch(setUser(loginResponse));
      navigate("/home");
      setLoadingLogin(false);
    } catch (e) {
      if (
        e instanceof AxiosError &&
        [400, 401].includes(e.response?.status || 0)
      ) {
        setError(t("login.err_incorrect"));
      } else {
        setError(t("login.err_login"));
      }
      console.log("Login Error", e);
      setLoadingLogin(false);
    }
  };

  const createAccount = async () => {
    try {
      setLoadingLogin(true);
      const createAccountResponse = await createAccountAPI(email, password);
      window.localStorage.setItem("hasPreviouslyLoggedIn", "true");

      if (createAccountResponse.emailSent) {
        toast.success(t("login.toast_verify_sent"));
      }

      dispatch(setUser(createAccountResponse.user));
      navigate("/home");
      setLoadingLogin(false);
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 409) {
        setError(t("login.err_exists"));
      } else if (e instanceof AxiosError && e.response?.status === 400) {
        setError(t("login.err_validation"));
      } else {
        setError(t("login.err_create"));
      }
      console.log("Create Account Error", e);
      setLoadingLogin(false);
    }
  };

  const resetPassword = async () => {
    try {
      const currentDate = Date.now();
      if (currentDate - lastSentPassowordReset.current < 1000 * 60 * 1) {
        await Swal.fire({
          title: t("settings.wait_1_min"),
          icon: "warning",
          confirmButtonColor: "#1a73e8",
          confirmButtonText: t("settings.btn_okay"),
        });
        return;
      }

      lastSentPassowordReset.current = Date.now();

      setLoadingLogin(true);

      await toast.promise(sendPasswordResetAPI(email), {
        pending: t("login.toast_reset_pending"),
        success: t("login.toast_reset_success"),
        error: t("login.toast_reset_error"),
      });

      setLoadingLogin(false);
    } catch (e) {
      console.log("Create Account Error", e);
      setLoadingLogin(false);
      if (e instanceof AxiosError && e.response?.status === 404) {
        setError(t("login.err_not_exist"));
      } else if (e instanceof AxiosError && e.response?.status === 403) {
        setError(t("login.err_not_enabled"));
      } else {
        setError(t("login.err_reset"));
      }
    }
  };

  const isSubmitDisabled = (() => {
    switch (mode) {
      case "login":
        return !email || !password;
      case "create":
        return !email || !password || !verifyPassword;
      case "reset":
        return !email;
      default:
        return false;
    }
  })();

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (mode === "login") {
      login();
    } else if (mode === "create") {
      createAccount();
    } else if (mode === "reset") {
      resetPassword();
    }
  };

  const headerTitle = (() => {
    switch (mode) {
      case "login":
        return t("login.title_login");
      case "create":
        return t("login.title_create");
      case "reset":
        return t("login.title_reset");
      default:
        return t("login.title_login");
    }
  })();

  const headerSubtitle = (() => {
    switch (mode) {
      case "login":
        return t("login.subtitle_login");
      case "create":
        return t("login.subtitle_create");
      case "reset":
        return t("login.subtitle_reset");
      default:
        return "";
    }
  })();

  const validationError = (() => {
    if (mode === "login" || mode === "reset") return "";

    if (mode === "create") {
      if (password.length) {
        if (password.length < 6) {
          return t("settings.err_length");
        } else if (password.length > 256) {
          return t("settings.err_max_length");
        }
      }

      if (
        password.length &&
        verifyPassword.length &&
        password !== verifyPassword
      ) {
        return t("settings.err_match");
      }

      if (email.length) {
        const isValidEmail = isEmail(email);

        if (email.length < 3) {
          return t("login.err_email_short");
        } else if (email.length > 320) {
          return t("login.err_email_long");
        } else if (!isValidEmail) {
          return t("login.err_email_invalid");
        }
      }
    }

    return "";
  })();

  useEffect(() => {
    setError("");
  }, [email.length, password.length, verifyPassword.length]);

  useEffect(() => {
    const loggedIn = window.localStorage.getItem("hasPreviouslyLoggedIn");
    if (loggedIn === "true") {
      attemptLoginWithToken();
    } else {
      setAttemptingLogin(false);
    }
  }, []);

  if (attemptingLogin) {
    return (
      <div className="w-screen h-screen bg-white flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  // Google Logo SVG
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
            {headerTitle}
          </h1>
          <p className="text-[#1f1f1f] text-[16px] font-normal text-center">
            {headerSubtitle}
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1">
          <div className="flex flex-col gap-4">
            
            <div className="relative">
              <input
                type="text"
                placeholder={t("login.email_placeholder")}
                className="w-full h-[54px] px-4 text-[#1f1f1f] border border-[#dadce0] rounded-[4px] outline-none text-[16px] focus:border-[#1a73e8] focus:border-2 transition-all placeholder:text-[#5f6368]"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                disabled={loadingLogin}
              />
            </div>

            {(mode === "login" || mode === "create") && (
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
            )}

            {mode === "create" && (
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
            )}
          </div>

          {(validationError || error) && (
            <div className="mt-2 flex items-center">
              <AlertIcon className="w-4 h-4 text-[#d93025] mr-2 shrink-0" />
              <p className="text-[#d93025] text-[12px] font-medium m-0">
                {validationError || error}
              </p>
            </div>
          )}

          {mode === "login" && (
            <div className="mt-2">
               <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                  }}
                  className="text-[#1a73e8] text-[14px] font-medium bg-transparent hover:bg-[#f8f9fa] rounded px-2 py-1.5 -ml-2 transition-colors outline-none cursor-pointer border-none"
                >
                  {t("login.forgot_password")}
                </button>
            </div>
          )}

          <div className="mt-auto pt-10 flex flex-row items-center justify-between">
            <div>
               {mode === "login" && (
                 <button
                   type="button"
                   onClick={() => {
                     setMode("create");
                     setError("");
                   }}
                   className="text-[#1a73e8] text-[14px] font-medium bg-transparent hover:bg-[#f8f9fa] rounded px-2 py-1.5 -ml-2 transition-colors outline-none cursor-pointer border-none"
                 >
                   {t("login.create_account")}
                 </button>
               )}
               {(mode === "create" || mode === "reset") && (
                 <button
                   type="button"
                   onClick={() => {
                     setMode("login");
                     setError("");
                   }}
                   className="text-[#1a73e8] text-[14px] font-medium bg-transparent hover:bg-[#f8f9fa] rounded px-2 py-1.5 -ml-2 transition-colors outline-none cursor-pointer border-none"
                 >
                   {t("login.back_to_login")}
                 </button>
               )}
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled || loadingLogin || validationError !== ""}
              className={classNames(
                "bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2 rounded-full text-[14px] font-medium transition-colors outline-none border-none relative flex items-center justify-center min-w-[80px] h-[36px]",
                {
                  "opacity-50 cursor-not-allowed": isSubmitDisabled || validationError !== "",
                  "cursor-pointer": !(isSubmitDisabled || validationError !== "")
                }
              )}
            >
              {loadingLogin ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin absolute"></div>
              ) : (
                <span>
                  {mode === "login" ? t("login.btn_login") : mode === "create" ? t("login.btn_create") : t("login.btn_reset")}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default LoginPage;