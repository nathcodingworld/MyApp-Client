import { Button, Card, CardActions, CardContent, CardMedia, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import KEY from "../../../Key/KEY";
import PhotoFileInput from "../_Inputs/PhotoFileInput";
import TextInput from "../_Inputs/TextInput";
import SendIcon from "@mui/icons-material/Send";
import { gql, useMutation } from "@apollo/client";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { queryAction } from "../../../Providers/ReduxProvider";
import ShowError from "../../Component/ShowError";
import { v4 } from "uuid";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../Providers/FirebaseProvider";

type audioContent = {
  title: string;
  cover: string;
  coverpath: string;
  owner: string;
  coverby: string;
};

type EditAudioCardType = {
  audioid: string;
  toEdit: audioContent;
  onDone: () => void;
};

const UpdateAudio = gql`
  mutation UpdateAudio($userid: String!, $audioid: String!, $cover: String, $coverpath: String, $title: String!, $owner: String!, $coverby: String) {
    editaudio(userid: $userid, audioid: $audioid, title: $title, cover: $cover, coverpath: $coverpath, owner: $owner, coverby: $coverby) {
      message
    }
  }
`;

const EditAudioCard: React.FC<EditAudioCardType> = ({ toEdit, onDone, audioid }) => {
  const [loading, setLoading] = useState(false);
  const [imgData, setImgData] = useState<any>({ accepted: false, Msg: "", file: "", url: "" });
  const [title, setTitle] = useState({ accepted: false, Msg: "", value: "" });
  const [owner, setOwner] = useState({ accepted: false, Msg: "", value: "" });
  const [coverBy, setCoverBy] = useState({ accepted: false, Msg: "", value: "" });
  const userid = useSelector<any, string>((state) => state.auth.ID);
  const [editAudio, { error }] = useMutation(UpdateAudio, { refetchQueries: ["GETAUDIO"] });
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  useEffect(() => {
    setImgData({
      accepted: true,
      Msg: "",
      file: "initial",
      url: toEdit.cover,
    });
    setTitle({
      accepted: true,
      Msg: "",
      value: toEdit.title,
    });
    setOwner({
      accepted: true,
      Msg: "",
      value: toEdit.owner,
    });
    setCoverBy({
      accepted: true,
      Msg: "",
      value: toEdit.coverby,
    });
  }, []);

  async function onUpdateHandler() {
    if (!title.accepted) enqueueSnackbar(`Title: ${title.Msg}`, { variant: "error" });
    if (!owner.accepted) enqueueSnackbar(`Owner: ${owner.Msg}`, { variant: "error" });
    if (!coverBy.accepted) enqueueSnackbar(`CoverBy: ${coverBy.Msg}`, { variant: "error" });
    if (!imgData.accepted) enqueueSnackbar(`Cover Photo: ${imgData.Msg}`, { variant: "error" });
    if (title.accepted && owner.accepted && coverBy.accepted && imgData.accepted) {
      try {
        setLoading(true);
        const todeleleteRef = ref(storage, toEdit.coverpath);
        let imagePath = toEdit.coverpath;
        let imageUrl = toEdit.cover;
        if (imgData.file !== "initial") {
          imagePath = `images/${v4()}`;
          const imageRef = ref(storage, imagePath);
          await uploadBytes(imageRef, imgData.file);
          imageUrl = await getDownloadURL(imageRef);
        }
        const success = await editAudio({
          variables: { audioid: audioid, userid: userid, title: title.value, owner: owner.value, coverby: coverBy.value, cover: imageUrl, coverpath: imagePath },
        });
        if (success.data.editaudio.message === "edit Audio Successful") {
          deleteObject(todeleleteRef).catch((error) => console.log("no such file in directory"));
          enqueueSnackbar(success.data.editaudio.message, { variant: "success" });
          dispatch(queryAction.success());
          setLoading(false);
          onDone();
        }
      } catch (error) {
        setLoading(false);
        enqueueSnackbar("Post Unsuccessful", { variant: "error" });
      }
    }
  }

  return (
    <Card>
      {imgData.url && <CardMedia component="img" height="200" width="200" src={imgData.url} />}
      <CardContent>
        <PhotoFileInput setData={setImgData} imgFile={imgData.file} imgName={imgData.Msg} accepted={imgData.accepted} name="Cover" fullWidth={true} />
        <TextInput setData={setTitle} label="Title" variant="standard" type="text" accepted={title.accepted} multiline={false} value={title.value} />
        <TextInput setData={setOwner} label="Owner" variant="standard" type="text" accepted={owner.accepted} multiline={false} value={owner.value} />
        <TextInput setData={setCoverBy} label="Cover By" variant="standard" type="text" accepted={coverBy.accepted} multiline={false} value={coverBy.value} />
      </CardContent>
      <CardActions>
        {loading ? (
          <CircularProgress color="inherit" sx={{ margin: "auto" }} />
        ) : (
          <Button variant="contained" endIcon={<SendIcon />} sx={{ margin: "auto", width: "200px" }} onClick={onUpdateHandler} children={"UPDATE"} />
        )}
      </CardActions>
      {error && <ShowError error={error} />}
    </Card>
  );
};

export default EditAudioCard;
