import { connect } from "react-redux";
import React, { memo } from "react";
import { getCancelToken } from "../../utils/cancelTokenManager";
import CloseIcon from "../../icons/CloseIcon";
import CheckCircleIcon from "../../icons/CheckCircleIcon";
import AlertIcon from "../../icons/AlertIcon";
import { UploadItemType } from "../../reducers/uploader";
import classNames from "classnames";

const UploadItem: React.FC<UploadItemType> = (props) => {
  const { completed, canceled, progress, name, id, type } = props;
  const cancelToken = getCancelToken(id);

  const cancelUpload = () => {
    cancelToken.cancel();
  };

  const ProgressIcon = memo(() => {
    if (completed) {
      return <CheckCircleIcon className="w-5 h-5 text-[#188038]" />;
    } else if (canceled) {
      return <AlertIcon className="w-5 h-5 text-[#d93025]" />;
    } else {
      return (
        <div 
          className="p-1.5 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
          onClick={cancelUpload}
        >
          <CloseIcon className="w-4 h-4 text-[#5f6368]" />
        </div>
      );
    }
  });

  const ProgressBar = memo(() => {
    let barColor = "bg-[#1a73e8]";
    if (completed) barColor = "bg-[#188038]";
    if (canceled) barColor = "bg-[#d93025]";

    if (type === "folder" && !completed && !canceled) {
      return (
        <div className="w-full bg-[#e9eef6] h-1.5 rounded-full mt-2 overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#1a73e8] rounded-full animate-pulse"></div>
        </div>
      );
    }

    return (
      <div className="w-full bg-[#e9eef6] h-1.5 rounded-full mt-2 overflow-hidden">
        <div 
          className={classNames("h-full transition-all duration-300 rounded-full", barColor)}
          style={{ width: `${completed ? 100 : canceled ? 100 : progress}%` }}
        ></div>
      </div>
    );
  });

  return (
    <div className="p-4 flex flex-col justify-center border-b border-gray-100 last:border-0 hover:bg-[#f8f9fa] transition-colors">
      <div className="w-full flex justify-between items-center">
        <div className="mr-4 overflow-hidden flex-1">
          <p className="text-[13px] leading-tight font-medium text-[#3c4043] truncate m-0">
            {name}
          </p>
        </div>
        <div className="shrink-0 flex items-center justify-center">
          <ProgressIcon />
        </div>
      </div>
      <div className="w-full pr-10">
        <ProgressBar />
      </div>
    </div>
  );
};

export default connect()(UploadItem);