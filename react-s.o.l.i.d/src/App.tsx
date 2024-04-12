import "./App.css";
import { SRP } from "./principles/srp";
import { OCP } from "./principles/OCP";
import { LSP } from "./principles/LSP";
import { ISP } from "./principles/ISP";
import { DIP } from "./principles/DIP";

import { SRP_ADVANCED } from "./advanced/SRP";
import { OCP_ADVANCED } from "./advanced/OCP";
import { LSP_ADVANCED } from "./advanced/LSP";
import { ISP_ADVANCED } from "./advanced/ISP";
import { DIP_ADVANCED } from "./advanced/DIP";

function App() {
  return (
    <div className="flex min-w-full h-full justify-center items-center p-8">
      {/* simple SOLID princples */}
      {/* <SRP /> */}
      {/* <OCP /> */}
      {/* <LSP /> */}
      {/* <ISP /> */}
      {/* <DIP /> */}


      {/* advanced SOLIc principles */}
      {/* <SRP_ADVANCED/> */}
      {/* <OCP_ADVANCED/> */}
      {/* <LSP_ADVANCED/> */}
      {/* <ISP_ADVANCED/> */}
      {/* <DIP_ADVANCED/> */}
    </div>
  );
}

export default App;
