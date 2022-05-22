import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, CircularProgress, Divider, IconButton } from "@mui/material";
import UserAvatar from "../../UI/UserAvatar";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { gql, useMutation } from "@apollo/client";
import { useSelector } from "react-redux";

import PhotoFileInput from "../_Inputs/PhotoFileInput";
import VideoFileInput from "../_Inputs/VideoFileInput";
import TextInput from "../_Inputs/TextInput";
import CheckboxInput from "../_Inputs/CheckBoxInput";
import ShowError from "../../Component/ShowError";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../Providers/FirebaseProvider";
import { v4 } from "uuid";

type AddVideoCardType = {
  onClose: () => void;
};

const Video = gql`
  mutation Video(
    $userid: String!
    $description: String
    $title: String!
    $thumbnail: String
    $thumbnailpath: String
    $file: String!
    $filepath: String
    $disablelike: Boolean!
    $disablecomment: Boolean!
  ) {
    video(
      userid: $userid
      description: $description
      title: $title
      thumbnail: $thumbnail
      thumbnailpath: $thumbnailpath
      file: $file
      filepath: $filepath
      disablelike: $disablelike
      disablecomment: $disablecomment
    ) {
      message
    }
  }
`;

const AddVideoCard: React.FC<AddVideoCardType> = (Props) => {
  const [loading, setLoading] = useState(false);
  const [vdeData, setVdeData] = useState<any>({ accepted: false, Msg: "", file: "", url: "" });
  const [imgData, setImgData] = useState<any>({ accepted: false, Msg: "", file: "", url: "" });
  const [title, setTitle] = useState({ accepted: false, Msg: "", value: "" });
  const [description, setDescription] = useState({ accepted: false, Msg: "", value: "" });
  const [disableLike, setDisableLike] = useState(false);
  const [disableComment, setDisableComment] = useState(false);
  const [video, { error }] = useMutation(Video, { refetchQueries: ["GETVIDEO"] });
  const { enqueueSnackbar } = useSnackbar();
  const username = useSelector<any, string>((state) => state.auth.userName);
  const id = useSelector<any, string>((state) => state.auth.ID);

  async function onSubmitHandler() {
    if (!imgData.accepted) enqueueSnackbar(imgData.Msg, { variant: "error" });
    if (!vdeData.accepted) enqueueSnackbar(vdeData.Msg, { variant: "error" });
    if (!title.accepted) enqueueSnackbar(`Title: ${title.Msg}`, { variant: "error" });
    if (!description.accepted) enqueueSnackbar(`Description: ${description.Msg}`, { variant: "error" });
    if (imgData.accepted && vdeData.accepted && title.accepted && description.accepted) {
      try {
        setLoading(true);
        const videoPath = `videos/${v4()}`;
        const imagePath = `images/${v4()}`;
        const videoRef = ref(storage, videoPath);
        const imageRef = ref(storage, imagePath);
        await uploadBytes(videoRef, vdeData.file);
        await uploadBytes(imageRef, imgData.file);
        const imageUrl = await getDownloadURL(imageRef);
        const videoUrl = await getDownloadURL(videoRef);
        const success = await video({
          variables: {
            userid: id,
            title: title.value,
            description: description.value,
            thumbnail: imageUrl,
            thumbnailpath: imagePath,
            file: videoUrl,
            filepath: videoPath,
            disablecomment: disableComment,
            disablelike: disableLike,
          },
        });
        if (success) {
          setLoading(false);
          enqueueSnackbar(success.data.video.message, { variant: "success" });
          Props.onClose();
        }
      } catch (error) {
        enqueueSnackbar("Post Unsuccessful", { variant: "error" });
      }
    }
  }

  return (
    <Card>
      <CardHeader avatar={<UserAvatar />} title={username} subheader={new Date().toDateString()} action={!loading && <IconButton children={<SendIcon />} onClick={onSubmitHandler} />} />
      <Divider />
      {imgData.url && <CardMedia component="img" height="194" src={imgData.url} />}
      <CardContent>
        <PhotoFileInput setData={setImgData} name="Upload Thumbnail" imgFile={imgData.file} imgName={imgData.Msg} accepted={imgData.accepted} fullWidth={true} />
        <VideoFileInput setData={setVdeData} vdoFile={vdeData.url} />
        <CheckboxInput setDataFirst={setDisableLike} setDataSecond={setDisableComment} checkfirst={disableLike} checksecond={disableComment} labelfirst="Disable Like" labelsecond="Disable Comments" />
        <TextInput setData={setTitle} variant="standard" label="Title" type="text" accepted={title.accepted} multiline={false} value={title.value} />
        <TextInput setData={setDescription} variant={undefined} label="Descriptions" type="text" accepted={description.accepted} multiline={true} value={description.value} />
      </CardContent>
      <CardActions>
        {loading ? (
          <CircularProgress color="inherit" sx={{ margin: "auto" }} />
        ) : error ? (
          <ShowError error={error} />
        ) : (
          <Button variant="contained" endIcon={<PlayArrowIcon />} sx={{ margin: "auto", width: "200px" }} onClick={onSubmitHandler} children="Post" />
        )}
      </CardActions>
    </Card>
  );
};

export default AddVideoCard;
