import { Avatar, Card, CardHeader, CardMedia, Grid } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mediaDataAction, modalAction } from "../../Providers/ReduxProvider";
import More from "../Component/More";
import DeleteModal from "../Modal/DeleteModal";
import EditModal from "../Modal/EditModal";

type AudioCardType = {
  userid: {
    id: string;
    avatar: string;
  };
  id: string;
  title: string;
  owner: string;
  cover: string;
  coverpath: string;
  file: string;
  coverby: string;
};

const AudioCard: React.FC<AudioCardType> = ({ userid, id, title, owner, cover, coverpath, file, coverby }) => {
  const uid = useSelector<any, string>((state) => state.auth.ID);
  const isAuth = useSelector<any, boolean>((state) => state.auth.isAuth);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch();
  function setPlayHandler() {
    dispatch(mediaDataAction.setAudioData({ file: file, cover: cover, title: title, owner: owner }));
    dispatch(modalAction.openAudioPlayer());
  }

  return (
    <Grid item lg={2} md={3} sm={4} xs={6}>
      <Card onClick={setPlayHandler} id={id} sx={{ position: "relative" }}>
        <CardMedia component="img" height="150px" width="150px" src={cover} />
        <CardHeader
          avatar={<Avatar alt="user" src={userid.avatar} />}
          title={title}
          subheader={owner}
          action={<More onDeleting={setDeleting} onEditing={setEditing} for="Audio" authorize={isAuth && userid.id === uid} sx={{ position: "absolute", right: "-15px", top: "63%" }} />}
        />
      </Card>
      <EditModal onClose={setEditing} open={editing} page="Audio" id={id} content={{ title, cover, coverpath, owner, coverby }} />
      <DeleteModal onClose={setDeleting} open={deleting} onDelete={undefined} page="Audio" idToDelete={id} />
    </Grid>
  );
};

export default AudioCard;
