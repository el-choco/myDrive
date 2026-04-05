import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useUtils } from "../../hooks/utils";
import { useFolder } from "../../hooks/folders";
import SpacerIcon from "../../icons/SpacerIcon";
import ArrowBackIcon from "../../icons/ArrowBackIcon";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useTranslation } from "react-i18next";

const ParentBar = memo(() => {
  const { data: folder } = useFolder(false);
  const navigate = useNavigate();
  const { isHome, isTrash } = useUtils();
  const { t } = useTranslation();
  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();

  if (isHome || !folder) {
    return <div></div>;
  }

  const goHomeOrTrash = () => {
    if (!isTrash) {
      navigate("/home");
    } else {
      navigate("/trash");
    }
  };

  const goToFolder = () => {
    navigate(`/folder/${folder?._id}`);
  };

  const goBackAFolder = () => {
    if (folder?.parent === "/") {
      navigate("/home");
    } else {
      navigate(`/folder/${folder.parent}`);
    }
  };

  return (
    <div className="w-full items-center flex py-2 px-1 mb-2">
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation}>
          <ContextMenu
            folderMode={true}
            parentBarMode={true}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            folder={folder}
          />
        </div>
      )}

      <div className="flex items-center">
        <div
          className="flex items-center justify-center p-2 mr-1 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
          onClick={goBackAFolder}
        >
          <ArrowBackIcon className="w-5 h-5 text-[#5f6368]" />
        </div>
        <a
          className="text-[#3c4043] text-[18px] leading-[24px] font-normal m-0 no-underline cursor-pointer rounded-full px-3 py-1.5 hover:bg-black/5 transition-colors"
          onClick={goHomeOrTrash}
        >
          {!isTrash ? t("parent_bar.home") : t("parent_bar.trash")}
        </a>
        <SpacerIcon className="text-[#5f6368] mx-1 w-3 h-3" />
        <p
          onClick={onContextMenu}
          className="text-[#1f1f1f] text-[18px] leading-[24px] font-normal m-0 whitespace-nowrap max-w-[170px] sm:max-w-[300px] overflow-hidden text-ellipsis cursor-pointer rounded-full px-3 py-1.5 hover:bg-black/5 transition-colors"
          onContextMenu={onContextMenu}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {folder.name}
        </p>
      </div>
    </div>
  );
});

export default ParentBar;