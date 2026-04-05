import { FileInterface } from "../../types/file";
import { FolderInterface } from "../../types/folders";
import { getFileColor } from "../../utils/files";

interface SearchBarItemProps {
  file?: FileInterface;
  folder?: FolderInterface;
  type: "file" | "folder";
  fileClick: (file: FileInterface) => void;
  folderClick: (folder: FolderInterface) => void;
}

const SearchBarItem = (props: SearchBarItemProps) => {
  const { type, folder, file, fileClick, folderClick } = props;

  const imageColor = file ? getFileColor(file.filename) : "";

  if (type === "folder" && folder) {
    return (
      <div
        className="flex flex-row items-center py-2.5 px-4 overflow-hidden text-ellipsis hover:bg-[#f1f3f4] cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
        key={folder._id}
        onClick={() => folderClick(folder)}
      >
        <span className="w-6 h-6 shrink-0 mr-3 text-[#5f6368]">
          <svg
            className="w-full h-full"
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="folder"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"
            ></path>
          </svg>
        </span>
        <span className="text-[14px] text-[#3c4043] font-medium text-ellipsis overflow-hidden whitespace-nowrap">
          {folder.name}
        </span>
      </div>
    );
  } else if (type === "file" && file) {
    return (
      <div
        className="flex flex-row items-center py-2.5 px-4 overflow-hidden text-ellipsis hover:bg-[#f1f3f4] cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
        key={file._id}
        onClick={() => fileClick(file)}
      >
        <span className="w-6 h-6 shrink-0 mr-3">
           <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
              fill={imageColor}
            />
          </svg>
        </span>
        <span className="text-[14px] text-[#3c4043] font-medium text-ellipsis overflow-hidden whitespace-nowrap">
          {file.filename}
        </span>
      </div>
    );
  }
  return null;
};

export default SearchBarItem;