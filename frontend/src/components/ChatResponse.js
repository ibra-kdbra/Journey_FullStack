import React from "react";
import { TypeAnimation } from "react-type-animation";
import { v4 as uuidv4 } from "uuid";
import { useMediaQuery } from "@uidotdev/usehooks";
import { MediaQuery } from "../util/MediaQuery";

function ChatResponse({ isLoading, responseData }) {
  const isMobileDevice = useMediaQuery(MediaQuery.MOBILE);

  const styleDefault = {
    fontSize: isMobileDevice ? "1.6rem" : "2.6rem",
    marginTop: "10px",
    lineHeight: isMobileDevice ? "2.0rem" : "3.2rem",
    whiteSpace: "pre-line",
  };
  const style = {
    fontSize: isMobileDevice ? "1.4rem" : "2.0rem",
    marginTop: "10px",
    lineHeight: isMobileDevice ? "1.8rem" : "2.6rem",
    whiteSpace: "pre-line",
  };

  const showDefault = !isLoading && !responseData?.response?.length;

  let component;
  if (showDefault) {
    component = (
      <>
        <span className="chat_intro_container--h1" style={styleDefault}>
          Hello, I'm ibra-kdbra,<br></br> a software engineer.<br></br>
          <br></br>Learn more about me by typing a question below 👇
        </span>
        {/* <span className="chat_intro_container--h1" style={style}>
          Well, I must say, ibra-kdbra sounds like quite the catch! With his
          expertise in both frontend and backend technologies, passion for
          innovation, and track record of delivering high-quality work, he could
          be a valuable addition to your team. But hey, don't just take my word
          for it! Reach out to ibra directly through his LinkedIn, website,
          email, or phone number to get more information and see if he's the
          right fit for your company. Would you like any more help?
        </span> */}
      </>
    );
  } else if (isLoading) {
    const id1 = uuidv4();
    component = (
      <TypeAnimation
        key={id1}
        preRenderFirstString={true}
        sequence={["one sec", 400, "one sec...", 100]}
        omitDeletionAnimation={true}
        deletionSpeed={5}
        cursor={false}
        repeat={Infinity}
        speed={100}
        style={style}
      />
    );
  } else if (responseData?.response?.length) {
    // const sentences = responseData?.response.replaceAll(/[.!?]/g, "$&\n");
    component = (
      <TypeAnimation
        key={responseData?.id}
        sequence={[responseData?.response, 3000]}
        speed={{ type: "keyStrokeDelayInMs", value: 10 }}
        omitDeletionAnimation={true}
        deletionSpeed={5}
        cursor={false}
        style={style}
      />
    );
  }

  return component;
}

export default ChatResponse;
