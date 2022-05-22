import { Avatar, Card, CardHeader, Divider, Grid } from "@mui/material";
import CardHoverMedia from "../Component/CardHoverMedia";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { mediaDataAction, modalAction } from "../../Providers/ReduxProvider";
import More from "../Component/More";
import { useState } from "react";
import EditModal from "../Modal/EditModal";
import DeleteModal from "../Modal/DeleteModal";
import { Theme } from "@mui/system";

const vcStyle = {
  p: 1,
};

const videoCardStyle = {
  backgroundColor: "transparent",
  position: "relative",
  "&:hover": {
    transform: (theme: Theme) => (theme.breakpoints.down("sm") ? "scale(1)" : "scale(1.5)"),
    transition: "transform 400ms ease-in-out 500ms",
    zIndex: 10,
  },
};

export type vType = {
  userid: {
    id: string;
    userName: string;
    avatar: string;
  };
  id: string;
  file: string;
  thumbnail: string;
  thumbnailpath: string;
  title: string;
  disablelike: boolean;
  disablecomment: boolean;
  description: string;
  view: number;
  like: number;
};

const VideoCard: React.FC<vType> = ({ userid, id, file, thumbnail, thumbnailpath, title, disablecomment, disablelike, description, view, like }) => {
  const uid = useSelector<any, string>((state) => state.auth.ID);
  const isAuth = useSelector<any, boolean>((state) => state.auth.isAuth);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onOpenVideoPlayerHandler(e: any) {
    dispatch(mediaDataAction.setVideoData({ id: id, desc: `${userid.userName}  ${view}views  ${like}Like`, title: title, video: file, time: 0, play: true, mute: false }));
    dispatch(modalAction.closeView());
    navigate("/VideoOne");
  }

  return (
    <Grid item lg={3} md={4} sm={6} xs={12}>
      <Card sx={videoCardStyle} id={id} onClick={onOpenVideoPlayerHandler}>
        <CardHoverMedia thumbnail={thumbnail} file={file} width="100%" />
        <Divider />
        <CardHeader
          sx={vcStyle}
          avatar={<Avatar alt="user" src={userid.avatar} />}
          title={title}
          subheader={`${userid.userName}  ${view}views  ${like}Like`}
          action={<More onDeleting={setDeleting} onEditing={setEditing} for="Video" authorize={isAuth && userid.id === uid} sx={{ position: "absolute", right: "-15px", bottom: "15px" }} />}
        />
      </Card>
      <EditModal onClose={setEditing} open={editing} page="Video" content={{ title, description, thumbnail, thumbnailpath, disableLike: disablelike, disableComment: disablecomment }} id={id} />
      <DeleteModal onClose={setDeleting} open={deleting} onDelete={undefined} page="Video" idToDelete={id} />
    </Grid>
  );
};

export default VideoCard;
