import { memo, useEffect, useState } from "react";
import CloseIcon from "../../icons/CloseIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { getFileColor } from "../../utils/files";
import {
  makeOneTimePublicAPI,
  makePublicAPI,
  removeLinkAPI,
} from "../../api/filesAPI";
import { useFiles, useQuickFiles } from "../../hooks/files";
import {
  resetShareModal,
  setMainSelect,
  setShareModal,
} from "../../reducers/selected";
import { toast } from "react-toastify";
import LockIcon from "../../icons/LockIcon";
import OneIcon from "../../icons/OneIcon";
import PublicIcon from "../../icons/PublicIcon";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const SharePopup = memo(() => {
  const file = useAppSelector((state) => state.selected.shareModal.file)!;
  const [updating, setUpdating] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [shareType, setShareType] = useState<"private" | "public" | "one">(
    "private"
  );
  const dispatch = useAppDispatch();
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);
  const [animate, setAnimate] = useState(false);
  const { t } = useTranslation();

  const imageColor = getFileColor(file.filename);

  const makePublic = async () => {
    try {
      setUpdating(true);
      const { file: updatedFile } = await toast.promise(
        makePublicAPI(file._id),
        {
          pending: t("toast.making_public"),
          success: t("toast.public_link_generated"),
          error: t("toast.error_making_public"),
        }
      );
      dispatch(
        setMainSelect({
          file: updatedFile,
          id: updatedFile._id,
          type: "file",
          folder: null,
        })
      );
      dispatch(setShareModal(updatedFile));
      refetchFiles();
      refetchQuickFiles();
    } catch (e) {
      console.log("Error making file public", e);
    } finally {
      setUpdating(false);
    }
  };

  const makeOneTimePublic = async () => {
    try {
      setUpdating(true);
      const { file: updatedFile } = await toast.promise(
        makeOneTimePublicAPI(file._id),
        {
          pending: t("toast.making_public"),
          success: t("toast.public_link_generated"),
          error: t("toast.error_making_public"),
        }
      );
      dispatch(
        setMainSelect({
          file: updatedFile,
          id: updatedFile._id,
          type: "file",
          folder: null,
        })
      );
      dispatch(setShareModal(updatedFile));
      refetchFiles();
      refetchQuickFiles();
    } catch (e) {
      console.log("Error making file public", e);
    } finally {
      setUpdating(false);
    }
  };

  const removeLink = async () => {
    try {
      setUpdating(true);
      const updatedFile = await toast.promise(removeLinkAPI(file._id), {
        pending: t("toast.removing_link"),
        success: t("toast.link_removed"),
        error: t("toast.error_removing_link"),
      });
      dispatch(
        setMainSelect({
          file: updatedFile,
          id: updatedFile._id,
          type: "file",
          folder: null,
        })
      );
      dispatch(setShareModal(updatedFile));
      refetchFiles();
      refetchQuickFiles();
      setShareLink("");
    } catch (e) {
      console.log("Error removing link", e);
    } finally {
      setUpdating(false);
    }
  };

  const copyLink = () => {
    if (shareType === "private") return;
    navigator.clipboard.writeText(shareLink);
    toast.success(t("toast.link_copied"));
  };

  const closeShareModal = () => {
    setAnimate(false);
    setTimeout(() => dispatch(resetShareModal()), 200);
  };

  const outterWrapperClick = (e: any) => {
    if (e.target.id !== "outer-wrapper") return;
    closeShareModal();
  };

  const permissionText = (() => {
    if (shareType === "one") {
      return t("share_popup.permission_one");
    } else if (shareType === "public") {
      return t("share_popup.permission_public");
    } else {
      return t("share_popup.permission_private");
    }
  })();

  const linkPreviewText = (() => {
    if (shareType === "private") {
      return t("share_popup.document_private");
    } else {
      return shareLink;
    }
  })();

  useEffect(() => {
    if (!file.metadata.link) return;
    const url = `${window.location.origin}/public-download/${file._id}/${file.metadata.link}`;
    setShareLink(url);
    setShareType(file.metadata.linkType ? file.metadata.linkType : "private");
  }, [file._id, file.metadata.link, file.metadata.linkType]);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSelectChange = async (value: string) => {
    if (value === "private") {
      await removeLink();
    } else if (value === "one") {
      await makeOneTimePublic();
    } else if (value === "public") {
      await makePublic();
    }
  };

  const selectOnChange = (e: any) => {
    const value = e.target.value;
    setShareType(value);
    handleSelectChange(value);
  };

  return (
    <div
      className="w-screen dynamic-height bg-black/40 backdrop-blur-sm absolute top-0 left-0 right-0 bottom-0 z-[60] flex justify-center items-center flex-col transition-opacity duration-200"
      id="outer-wrapper"
      onClick={outterWrapperClick}
    >
      <div
        className={classNames(
          "bg-white w-full max-w-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out transform",
          animate ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100">
          <div className="flex items-center flex-1 min-w-0 pr-4">
             <div className="flex flex-col">
                <p className="text-[#1f1f1f] text-[18px] font-medium m-0">
                  {t("share_popup.title")}
                </p>
                <div className="flex items-center mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 mr-1.5 opacity-80 shrink-0"
                  >
                    <path
                      d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
                      fill={imageColor}
                    />
                  </svg>
                  <p className="text-[#5f6368] text-[13px] truncate m-0 font-medium">
                     {file.filename}
                  </p>
                </div>
             </div>
          </div>
          <div 
            className="p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors shrink-0"
            onClick={closeShareModal}
          >
            <CloseIcon className="w-5 h-5 text-[#5f6368]" />
          </div>
        </div>

        <div className="p-6">
          <p className="text-[14px] font-medium text-[#3c4043] mb-3 m-0">{t("share_popup.general_access")}</p>
          <div className="flex items-center bg-[#f8f9fa] rounded-xl p-3 border border-gray-100">
            <div className="p-2 rounded-full bg-[#e9eef6] mr-4 shrink-0">
              {shareType === "private" && <LockIcon className="w-5 h-5 text-[#1a73e8]" />}
              {shareType === "one" && <OneIcon className="w-5 h-5 text-[#1a73e8]" />}
              {shareType === "public" && <PublicIcon className="w-5 h-5 text-[#1a73e8]" />}
            </div>
            
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center">
                 <select
                  className="text-[14px] font-medium appearance-none bg-transparent text-[#1f1f1f] cursor-pointer outline-none transition-colors border-none p-0 pr-4 relative"
                  value={shareType}
                  onChange={selectOnChange}
                  disabled={updating}
                >
                  <option value="private">{t("share_popup.type_private")}</option>
                  <option value="public">{t("share_popup.type_public")}</option>
                  <option value="one">{t("share_popup.type_temporary")}</option>
                </select>
                {updating && (
                  <div className="w-3.5 h-3.5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin ml-2"></div>
                )}
              </div>
              <p className="text-[12px] text-[#5f6368] m-0 mt-0.5 leading-tight">
                {permissionText}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center bg-[#f1f3f4] rounded-full flex-1 mr-4 border border-transparent hover:border-gray-300 transition-colors focus-within:border-[#1a73e8] focus-within:bg-white focus-within:shadow-[0_1px_1px_0_rgba(65,69,73,0.3),0_1px_3px_1px_rgba(65,69,73,0.15)] overflow-hidden pr-1 h-[40px]">
              <input
                className="bg-transparent border-none outline-none text-[#3c4043] text-[13px] w-full px-4 h-full"
                value={linkPreviewText}
                readOnly
              />
              <button
                className={classNames(
                  "px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors shrink-0 outline-none border-none",
                  shareType === "private" 
                    ? "bg-transparent text-[#5f6368] cursor-not-allowed" 
                    : "bg-white text-[#1a73e8] hover:bg-[#f8f9fa] shadow-sm cursor-pointer"
                )}
                onClick={copyLink}
                disabled={shareType === "private"}
              >
                {t("share_popup.copy_link")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SharePopup;