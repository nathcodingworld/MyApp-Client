import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, CircularProgress, Divider, IconButton } from "@mui/material";
import UserAvatar from "../../UI/UserAvatar";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { gql, useMutation } from "@apollo/client";

import PhotoFileInput from "../_Inputs/PhotoFileInput";
import TextInput from "../_Inputs/TextInput";
import CheckboxInput from "../_Inputs/CheckBoxInput";
import ShowError from "../../Component/ShowError";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../Providers/FirebaseProvider";
import { v4 } from "uuid";

type AddPhotoCardType = {
  onClose: () => void;
};

const Photo = gql`
  mutation Photo($userid: String!, $caption: String, $file: String!, $filepath: String, $disablelike: Boolean!, $disablecomment: Boolean!) {
    photo(userid: $userid, caption: $caption, file: $file, filepath: $filepath, disablelike: $disablelike, disablecomment: $disablecomment) {
      message
    }
  }
`;

const AddPhotoCard: React.FC<AddPhotoCardType> = (Props) => {
  const [loading, setLoading] = useState(false);
  const [imgData, setImgData] = useState<any>({ accepted: false, Msg: "", file: "", url: "" });
  const [caption, setCaption] = useState({ accepted: false, Msg: "", value: "" });
  const [disableLike, setDisableLike] = useState(false);
  const [disableComment, setDisableComment] = useState(false);
  const [photo, { error }] = useMutation(Photo, { refetchQueries: ["GETPHOTO"] });
  const username = useSelector<any, string>((state) => state.auth.userName);
  const id = useSelector<any, string>((state) => state.auth.ID);
  const userpic = useSelector<any, string>((state) => state.auth.propic);
  const { enqueueSnackbar } = useSnackbar();

  async function onSubmitHandler() {
    if (!imgData.accepted) enqueueSnackbar(`Image File: ${imgData.Msg}`, { variant: "error" });
    if (!caption.accepted) enqueueSnackbar(`Image File: ${caption.Msg}`, { variant: "error" });
    if (imgData.accepted && caption.accepted) {
      try {
        setLoading(true);
        const imagePath = `images/${v4()}`;
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, imgData.file);
        const imageUrl = await getDownloadURL(imageRef);
        const success = await photo({
          variables: { name: username, userid: id, propic: userpic, file: imageUrl, filepath: imagePath, caption: caption.value, disablelike: disableLike, disablecomment: disableComment },
        });
        if (success) {
          setLoading(false);
          enqueueSnackbar(success.data.photo.message, { variant: "success" });
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
      <Divider />
      {imgData.url && <CardMedia component="img" height="400" src={imgData.url} />}
      <CardContent>
        <PhotoFileInput setData={setImgData} imgFile={imgData.file} imgName={imgData.Msg} accepted={imgData.accepted} name="Choose Image File" fullWidth={true} />
        <TextInput setData={setCaption} label="Caption" type="text" variant={undefined} multiline={true} accepted={caption.accepted} value={caption.value} />
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

export default AddPhotoCard;
