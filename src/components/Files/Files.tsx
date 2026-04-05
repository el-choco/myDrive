import { useFiles } from "../../hooks/files";
import { useUtils } from "../../hooks/utils";
import React, { memo } from "react";
import FileItem from "../FileItem/FileItem";
import { useAppSelector } from "../../hooks/store";
import { useTranslation } from "react-i18next";

const Files = memo(() => {
  const { data: files } = useFiles(false);
  const listView = useAppSelector((state) => state.general.listView);
  const { isHome } = useUtils();
  const { t } = useTranslation();

  const hasFiles = files?.pages && files.pages[0]?.length > 0;

  if (!hasFiles && !isHome) {
    return null;
  }

  if (listView) {
    return (
      <tbody>
        {files?.pages.map((filePage, index) => (
          <React.Fragment key={index}>
            {filePage.map((file) => (
              <FileItem file={file} key={file._id} />
            ))}
          </React.Fragment>
        ))}
      </tbody>
    );
  }

  return (
    <div className="mb-8">
      <p className="text-[14px] font-medium text-[#1f1f1f] mb-4 m-0">{t("files.title_default")}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 justify-center xs:justify-normal">
        {files?.pages.map((filePage, index) => (
          <React.Fragment key={index}>
            {filePage.map((file) => (
              <FileItem file={file} key={file._id} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

export default Files;