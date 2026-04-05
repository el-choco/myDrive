import Header from "../Header/Header";
import MainSection from "../MainSection/MainSection";
import Uploader from "../Uploader/Uploader";
import { useAppSelector } from "../../hooks/store";
import { ToastContainer } from "react-toastify";

const Homepage = () => {
  const showUploader = useAppSelector(
    (state) => state.uploader.uploads.length !== 0
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <Header />
      <MainSection />
      {showUploader && <Uploader />}
      
      <ToastContainer position="bottom-left" pauseOnFocusLoss={false} />
    </div>
  );
};

export default Homepage;