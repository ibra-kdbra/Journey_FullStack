import React from "react";
import { TypeAnimation } from "react-type-animation";
import { useMediaQuery } from "@uidotdev/usehooks";
import { MediaQuery } from "../utill/MediaQuery";

function ChatIntro({ setShowIntro }) {
  const isMobileDevice = useMediaQuery(MediaQuery.MOBILE);

  const style = {
    fontSize: isMobileDevice ? "1.6rem" : "2.6rem",
    marginTop: "10px",
    lineHeight: isMobileDevice ? "2.0rem" : "3.2rem",
    whiteSpace: "pre-line",
  };

  return (
    <TypeAnimation
      sequence={[
        "Hello, I'm ibra-kdbra,",
        400,
        "Hello, I'm ibra-kdbra,\n a software engineer.",
        1500,
        "Hello, I'm ibra-kdbra,\n a software engineer.\n\nLearn more about me by typing a question below 👇",
        500,
        () => setShowIntro(false),
      ]}
      speed={{ type: "keyStrokeDelayInMs", value: 30 }}
      omitDeletionAnimation={false}
      cursor={false}
      className="chat_message_content"
      deletionSpeed={99}
      style={style}
    />
  );
}

export default ChatIntro;
