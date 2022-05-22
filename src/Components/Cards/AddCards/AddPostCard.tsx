import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, CircularProgress, IconButton } from "@mui/material";
import UserAvatar from "../../UI/UserAvatar";
import SendIcon from "@mui/icons-material/Send";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { gql, useMutation } from "@apollo/client";

import TextInput from "../_Inputs/TextInput";
import PhotoFileInput from "../_Inputs/PhotoFileInput";
import CheckboxInput from "../_Inputs/CheckBoxInput";
import ShowError from "../../Component/ShowError";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../Providers/FirebaseProvider";
import { v4 } from "uuid";

const Post = gql`
  mutation Post($userid: String!, $content: String, $file: String, $filepath: String, $disablelike: Boolean!, $disablecomment: Boolean!) {
    post(userid: $userid, content: $content, file: $file, filepath: $filepath, disablelike: $disablelike, disablecomment: $disablecomment) {
      message
    }
  }
`;

type AddPostCardType = {
  onClose: () => void;
};

const AddPostCard: React.FC<AddPostCardType> = (Props) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState({ accepted: false, Msg: "", value: "" });
  const [imgData, setImgData] = useState<any>({ accepted: true, Msg: "", file: "", url: "" });
  const [disableLike, setDisableLike] = useState(false);
  const [disableComment, setDisableComment] = useState(false);
  const username = useSelector<any, string>((state) => state.auth.userName);
  const id = useSelector<any, string>((state) => state.auth.ID);
  const [post, { error }] = useMutation(Post, { refetchQueries: ["GETPOST"] });
  const { enqueueSnackbar } = useSnackbar();

  async function onSubmitHandler() {
    if (!imgData.accepted) enqueueSnackbar("image file: " + imgData.Msg, { variant: "error" });
    else if (!description.accepted) enqueueSnackbar("Description: " + description.Msg, { variant: "error" });
    else {
      try {
        setLoading(true);
        const imagePath = `images/${v4()}`;
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, imgData.file);
        const imageUrl = await getDownloadURL(imageRef);
        const success = await post({
          variables: { content: description.value, userid: id, file: imageUrl, filepath: imagePath, disablelike: disableLike, disablecomment: disableComment },
        });
        if (success) {
          setLoading(false);
          enqueueSnackbar(success.data.post.message, { variant: "success" });
          Props.onClose();
        }
      } catch (error) {
        setLoading(false);
        enqueueSnackbar("Post Unsuccessful", { variant: "error" });
      }
    }
  }

  return (
    <Card>
      <CardHeader avatar={<UserAvatar />} title={username} subheader={new Date().toDateString()} action={!loading && <IconButton children={<SendIcon />} onClick={onSubmitHandler} />} />
      {imgData.file && <CardMedia component="img" src={imgData.url} height="400" />}
      <CardContent>
        <PhotoFileInput setData={setImgData} imgFile={imgData.file} imgName={imgData.Msg} accepted={imgData.accepted} name="uplaod image" fullWidth={false} />
        <TextInput setData={setDescription} label="Description" type="text" variant={undefined} accepted={description.accepted} multiline={false} value={description.value} />
        <CheckboxInput setDataFirst={setDisableLike} setDataSecond={setDisableComment} checkfirst={disableLike} checksecond={disableComment} labelfirst="Disable Like" labelsecond="Disable Comments" />
      </CardContent>
      <CardActions>
        {loading ? (
          <CircularProgress color="inherit" sx={{ margin: "auto" }} />
        ) : error ? (
          <ShowError error={error} />
        ) : (
          <Button variant="contained" endIcon={<SendIcon />} sx={{ margin: "auto", width: "200px" }} onClick={onSubmitHandler} children="Post" />
        )}
      </CardActions>
    </Card>
  );
};

export default AddPostCard;
