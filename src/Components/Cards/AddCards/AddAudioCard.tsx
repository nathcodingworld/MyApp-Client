import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, CircularProgress, Divider, IconButton } from "@mui/material";
import UserAvatar from "../../UI/UserAvatar";
import SendIcon from "@mui/icons-material/Send";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { gql, useMutation } from "@apollo/client";
import AudioFileInput from "../_Inputs/AudioFileInput";
import PhotoFileInput from "../_Inputs/PhotoFileInput";
import TextInput from "../_Inputs/TextInput";
import ShowError from "../../Component/ShowError";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../Providers/FirebaseProvider";
import { v4 } from "uuid";

type AddAudioCardType = {
  onClose: () => void;
};

const Audio = gql`
  mutation Audio($userid: String!, $title: String!, $cover: String, $coverpath: String, $file: String!, $filepath: String, $owner: String!, $coverby: String) {
    audio(userid: $userid, title: $title, cover: $cover, coverpath: $coverpath, file: $file, filepath: $filepath, owner: $owner, coverby: $coverby) {
      message
    }
  }
`;

const AddAudioCard: React.FC<AddAudioCardType> = (Props) => {
  const [loading, setLoading] = useState(false);
  const [imgData, setImgData] = useState<any>({ accepted: false, Msg: "", file: "", url: "" });
  const [audData, setAudData] = useState<any>({ accepted: false, Msg: "", file: "" });
  const [title, setTitle] = useState({ accepted: false, Msg: "", value: "" });
  const [owner, setOwner] = useState({ accepted: false, Msg: "", value: "" });
  const [coverBy, setCoverBy] = useState({ accepted: false, Msg: "", value: "" });
  const [audio, { error }] = useMutation(Audio, { refetchQueries: ["GETAUDIO"] });
  const username = useSelector<any, string>((state) => state.auth.userName);
  const id = useSelector<any, string>((state) => state.auth.ID);
  const userpic = useSelector<any, string>((state) => state.auth.propic);
  const { enqueueSnackbar } = useSnackbar();

  async function onSubmitHandler() {
    if (!title.accepted) enqueueSnackbar(`Title: ${title.Msg}`, { variant: "error" });
    if (!owner.accepted) enqueueSnackbar(`Owner: ${owner.Msg}`, { variant: "error" });
    if (!coverBy.accepted) enqueueSnackbar(`CoverBy: ${coverBy.Msg}`, { variant: "error" });
    if (!imgData.accepted) enqueueSnackbar(`Cover Photo: ${imgData.Msg}`, { variant: "error" });
    if (!audData.accepted) enqueueSnackbar(`AudioFile: ${audData.Msg}`, { variant: "error" });
    if (title.accepted && owner.accepted && coverBy.accepted && imgData.accepted && audData.accepted) {
      try {
        setLoading(true);
        const audioPath = `audios/${v4()}`;
        const imagePath = `images/${v4()}`;
        const audioRef = ref(storage, audioPath);
        const imageRef = ref(storage, imagePath);
        await uploadBytes(audioRef, audData.file);
        await uploadBytes(imageRef, imgData.file);
        const imageUrl = await getDownloadURL(imageRef);
        const audioUrl = await getDownloadURL(audioRef);

        const success = await audio({
          variables: {
            name: username,
            userid: id,
            propic: userpic,
            title: title.value,
            owner: owner.value,
            coverby: coverBy.value,
            cover: imageUrl,
            coverpath: imagePath,
            file: audioUrl,
            filepath: audioPath,
          },
        });
        if (success) {
          setLoading(false);
          enqueueSnackbar(success.data.audio.message, { variant: "success" });
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
      {imgData.url && <CardMedia component="img" height="200" width="200" src={imgData.url} />}
      <CardContent>
        <PhotoFileInput setData={setImgData} imgFile={imgData.file} imgName={imgData.Msg} accepted={imgData.accepted} name="Cover" fullWidth={true} />
        <AudioFileInput setData={setAudData} audFile={audData.file} audMsg={audData.Msg} />
        <TextInput setData={setTitle} label="Title" variant="standard" type="text" accepted={title.accepted} multiline={false} value={title.value} />
        <TextInput setData={setOwner} label="Owner" variant="standard" type="text" accepted={owner.accepted} multiline={false} value={owner.value} />
        <TextInput setData={setCoverBy} label="Cover By" variant="standard" type="text" accepted={coverBy.accepted} multiline={false} value={coverBy.value} />
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

export default AddAudioCard;
