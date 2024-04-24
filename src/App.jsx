import Nav from "./components/Nav";
import Jumbotron from "./components/Jumbotron";
import SoundSection from "./components/SoundSection";
import DisplaySection from "./components/DisplaySection";
import WebgiViewer from "./components/WebgiViewer";
import Loader from "./components/Loader";
import { useRef } from "react";
function App() {
  const WebgiViewerRef = useRef();
  const contentRef = useRef();
  
  const handlePreview = () => {
    WebgiViewerRef.current.triggerPreview();
  };
  return (
    <div className="App">
      <Loader/>
      <div ref={contentRef} id="content">
      <Nav />
      <Jumbotron />
      <SoundSection />
      <DisplaySection triggerPreview={handlePreview} />
      </div>
      <WebgiViewer contentRef={contentRef} ref={WebgiViewerRef} />
    </div>
  );
}

export default App;