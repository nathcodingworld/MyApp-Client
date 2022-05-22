import { CardMedia } from "@mui/material";
import { useEffect, useState } from "react";

type CardHoverMediaType = {
  thumbnail: string;
  width: string;
  file: string;
};

const CardHoverMedia: React.FC<CardHoverMediaType> = (props) => {
  const [view, setView] = useState<"img" | "video">("img");
  const [hovering, setHover] = useState<boolean>(false);

  useEffect(() => {
    const time = setTimeout(() => {
      setView("video");
    }, 1200);
    if (!hovering) clearTimeout(time);

    return () => {
      clearTimeout(time);
    };
  }, [hovering]);

  function previewVideoHandler() {
    setHover(true);
  }

  function closeVideoHandler() {
    setView("img");
    setHover(false);
  }
  return (
    <CardMedia
      sx={{ aspectRatio: "1.7", width: props.width }}
      component={view}
      autoPlay={view === "img" ? false : true}
      src={view === "img" ? props.thumbnail : props.file}
      onMouseEnter={previewVideoHandler}
      onMouseLeave={closeVideoHandler}
    />
  );
};

export default CardHoverMedia;
