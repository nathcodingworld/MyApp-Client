import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Divider, Typography } from "@mui/material";
import { deleteObject, ref } from "firebase/storage";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";

import { storage } from "../../../Providers/FirebaseProvider";
import ContentLoader from "../../Component/ContentLoader";
import ShowError from "../../Component/ShowError";
import DisableExpresion from "../_Inputs/DisabledExpresion";
import DisabledTextInput from "../_Inputs/DisabledTextInput";

type DeleteVideoCardType = {
  for: string;
  videoid: string;
};

const PreDeleteVideo = gql`
  query PreDeleteVideo($id: String!) {
    getOneVideo(id: $id) {
      filepath
      thumbnail
      thumbnailpath
      title
      description
      comment
      like
    }
  }
`;

const DeleteVideo = gql`
  mutation DeleteVideo($videoid: String!, $userid: String!, $thumbnailpath: String, $filepath: String!) {
    deletevideo(videoid: $videoid, userid: $userid, thumbnailpath: $thumbnailpath, filepath: $filepath) {
      message
    }
  }
`;

const DeleteVideoCard: React.FC<DeleteVideoCardType> = (props) => {
  const { loading, error, data } = useQuery(PreDeleteVideo, { variables: { id: props.videoid } });
  const [deleteVideoo, { loading: ld }] = useMutation(DeleteVideo, { refetchQueries: ["GETVIDEO"] });
  const userid = useSelector<any, string>((state) => state.auth.ID);
  const { enqueueSnackbar } = useSnackbar();

  async function onDeleteHandler() {
    try {
      const imagePath = data.getOneVideo.thumbnailpath;
      const videoPath = data.getOneVideo.filepath;
      const imageRef = ref(storage, imagePath);
      const videoRef = ref(storage, videoPath);
      const success = await deleteVideoo({ variables: { videoid: props.videoid, userid: userid, thumbnailpath: imagePath, filepath: videoPath } });
      if (success.data.deletevideo.message === "delete Video Successful") {
        if (data.getOneVideo.thumbnailpath) deleteObject(imageRef).catch((err) => console.log("no such file"));
        deleteObject(videoRef).catch((err) => console.log("no such file"));
        enqueueSnackbar(success.data.deletevideo.message, { variant: "success" });
      }
    } catch (error: any) {
      enqueueSnackbar(error?.message, { variant: "error" });
    }
  }

  if (loading) return <ContentLoader />;
  if (error) return <ShowError error={error} />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" children={`Delete ${props.for}`} textAlign="center" />
        <Divider />
        {data.getOneVideo.thumbnail && <CardMedia component="img" height="194" src={data.getOneVideo.thumbnail} />}
        <DisabledTextInput multiline={false} label="Title" value={data.getOneVideo.title} />
        <DisabledTextInput multiline={true} label="Description" value={data.getOneVideo.description} />
        <DisableExpresion A={data.getOneVideo.like} B={data.getOneVideo.comment} Aicon="thumbup" Bicon="comments" />
      </CardContent>
      {ld ? <CircularProgress color="inherit" sx={{ margin: "auto" }} /> : <CardActions children={<Button sx={{ margin: "auto" }} onClick={onDeleteHandler} children="DELETE" />} />}
    </Card>
  );
};

export default DeleteVideoCard;
