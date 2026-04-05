import { useFolders } from "../../hooks/folders";
import FolderItem from "../FolderItem/FolderItem";
import React, { memo } from "react";
import { useUtils } from "../../hooks/utils";
import { useAppSelector } from "../../hooks/store";
import { useTranslation } from "react-i18next";

const Folders = memo(
  ({ scrollDivRef }: { scrollDivRef: React.RefObject<HTMLDivElement> }) => {
    const { data: folders } = useFolders(false);
    const { isTrash, isSearch, isHome } = useUtils();
    const listView = useAppSelector((state) => state.general.listView);
    const { t } = useTranslation();

    if (folders?.length === 0 && !isHome && !isTrash && !isSearch) {
      return null;
    }

    if (listView) {
      return (
        <tbody>
          {folders?.map((folder) => (
            <FolderItem
              folder={folder}
              key={folder._id}
              scrollDivRef={scrollDivRef}
            />
          ))}
        </tbody>
      );
    }

    return (
      <div className="mb-8">
        <p className="text-[14px] font-medium text-[#1f1f1f] mb-4 m-0">{t("folders.title_default")}</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 justify-center xs:justify-normal">
          {folders?.map((folder) => (
            <FolderItem
              folder={folder}
              key={folder._id}
              scrollDivRef={scrollDivRef}
            />
          ))}
        </div>
      </div>
    );
  }
);

export default Folders;