import React, { memo, useRef, useState } from "react";
import { FileInterface } from "../../types/file";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import {
  setMainSelect,
  setMultiSelectMode,
  setPopupSelect,
} from "../../reducers/selected";
import mobilecheck from "../../utils/mobileCheck";
import classNames from "classnames";
import { useContextMenu } from "../../hooks/contextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import PlayButtonIcon from "../../icons/PlayIcon";
import getBackendURL from "../../utils/getBackendURL";
import AlertIcon from "../../icons/AlertIcon";

type MediaItemType = {
  file: FileInterface;
};

const MediaItem: React.FC<MediaItemType> = memo(({ file }) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const elementSelected = useAppSelector((state) => {
    if (state.selected.mainSection.type !== "file") return false;
    return state.selected.mainSection.id === file._id;
  });
  const elementMultiSelected = useAppSelector((state) => {
    if (!state.selected.multiSelectMode) return false;
    const selected = state.selected.multiSelectMap[file._id];
    return selected && selected.type === "file";
  });
  const multiSelectMode = useAppSelector(
    (state) => state.selected.multiSelectMode
  );
  const {
    onContextMenu,
    closeContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clickStopPropagation,
    ...contextMenuState
  } = useContextMenu();
  const lastSelected = useRef(0);
  const dispatch = useAppDispatch();
  const thumbnail = `${getBackendURL()}/file-service/thumbnail/${
    file.metadata.thumbnailID
  }`;

  const mediaItemClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const multiSelectKey = e.metaKey || e.ctrlKey;
    if (multiSelectMode || multiSelectKey) {
      dispatch(
        setMultiSelectMode([
          {
            type: "file",
            id: file._id,
            file: file,
            folder: null,
          },
        ])
      );
      return;
    }
    const currentDate = Date.now();

    if (!elementSelected) {
      dispatch(
        setMainSelect({ file, id: file._id, type: "file", folder: null })
      );
      lastSelected.current = Date.now();
      return;
    }

    const isMobile = mobilecheck();

    if (isMobile || currentDate - lastSelected.current < 1500) {
      dispatch(setPopupSelect({ type: "file", file }));
    }

    lastSelected.current = Date.now();
  };

  return (
    <div
      className={classNames(
        "aspect-square bg-[#f1f3f4] cursor-pointer relative overflow-hidden group transition-all duration-200",
        {
          "bg-[#e8f0fe] p-1.5": elementSelected || elementMultiSelected,
        }
      )}
      onClick={mediaItemClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {contextMenuState.selected && (
        <div onClick={clickStopPropagation} className="z-50 relative">
          <ContextMenu
            quickItemMode={false}
            contextSelected={contextMenuState}
            closeContext={closeContextMenu}
            file={file}
          />
        </div>
      )}
      
      <div 
        className={classNames(
          "w-full h-full relative overflow-hidden transition-all duration-200",
          {
            "rounded-md": elementSelected || elementMultiSelected,
          }
        )}
      >
        {file.metadata.isVideo && !thumbnailError && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/10 group-hover:bg-black/20 transition-colors z-10">
            <PlayButtonIcon className="w-10 h-10 text-white drop-shadow-md" />
          </div>
        )}
        
        {/* Hover-Overlay for non-selected items */}
        {!(elementSelected || elementMultiSelected) && !thumbnailError && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 pointer-events-none"></div>
        )}

        {!thumbnailError && (
          <img
            className="object-cover h-full w-full disable-force-touch"
            src={thumbnail}
            onError={() => setThumbnailError(true)}
            alt={file.filename}
          />
        )}
        {thumbnailError && (
          <div className="w-full h-full flex justify-center items-center bg-[#f8f9fa]">
            <AlertIcon className="w-6 h-6 text-[#5f6368]" />
          </div>
        )}
        
        {/* Selection Checkmark */}
        {(elementSelected || elementMultiSelected) && (
          <div className="absolute top-2 left-2 bg-[#1a73e8] rounded-full p-0.5 shadow-sm z-20 border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
});

export default MediaItem;