import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import MenuIcon from "../../icons/MenuIcon";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { closeDrawer, openDrawer } from "../../reducers/leftSection";
import { useUtils } from "../../hooks/utils";
import ChevronOutline from "../../icons/ChevronOutline";
import SettingsIconSolid from "../../icons/SettingsIconSolid";
import { useEffect, useState } from "react";
import { getUserDetailedAPI } from "../../api/userAPI";

const Header = () => {
  const drawerOpen = useAppSelector((state) => state.leftSection.drawOpen);
  const { isSettings } = useUtils();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState("U");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserDetailedAPI();
        if (user && user.email) {
          setUserInitials(user.email.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const openDrawerClick = () => {
    dispatch(openDrawer());
  };

  const closeDrawerClick = () => {
    dispatch(closeDrawer());
  };

  return (
    <header
      id="header"
      className="select-none fixed top-0 left-0 w-full bg-[#f8f9fa] z-40 px-2 py-2"
    >
      <div className="flex justify-between items-center h-[48px]">
        <div className="items-center w-[250px] hidden desktopMode:flex pl-4">
          <a
            className="inline-flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => navigate("/")}
          >
            {/* Hier ist das offizielle Google Drive Logo! */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
              className="w-10 h-10 object-contain" 
              alt="Google Drive" 
            />
            <span className="ml-2 text-[#5f6368] text-[22px] tracking-tight">Drive</span>
          </a>
        </div>
        {!isSettings && (
          <div className="items-center flex desktopMode:hidden ml-2 mr-4">
            <div className="inline-flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors">
              {drawerOpen ? (
                <ChevronOutline
                  id="menu-icon"
                  onClick={closeDrawerClick}
                  className="text-[#5f6368] w-6 h-6 rotate-90"
                />
              ) : (
                <MenuIcon
                  id="menu-icon"
                  onClick={openDrawerClick}
                  className="text-[#5f6368] w-6 h-6"
                />
              )}
            </div>
          </div>
        )}
        <SearchBar />
        <div className="justify-end w-[250px] hidden desktopMode:flex pr-4">
          <div className="flex items-center gap-3">
            <a
              onClick={() => navigate("/settings")}
              className="cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors flex items-center justify-center"
              title="Einstellungen"
            >
              <SettingsIconSolid className="w-6 h-6 text-[#5f6368]" />
            </a>
            
            <a
              onClick={() => navigate("/settings")}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              title="Konto"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-white text-[15px] font-medium">{userInitials}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;