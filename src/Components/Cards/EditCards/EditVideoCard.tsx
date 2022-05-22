import { Button, Card, CardActions, CardContent, CardMedia, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import KEY from "../../../Key/KEY";
import CheckboxInput from "../_Inputs/CheckBoxInput";
import PhotoFileInput from "../_Inputs/PhotoFileInput";
import TextInput from "../_Inputs/TextInput";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useSnackbar } from "notistack";
import { gql, useMutation } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { queryAction } from "../../../Providers/ReduxProvider";
import ShowError from "../../Component/ShowError";
import { v4 } from "uuid";
import { storage } from "../../../Providers/FirebaseProvider";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

type videoContent = {
  title: string;
  description: string;
  disableLike: boolean;
  disableComment: boolean;
  thumbnail: string;
  thumbnailpath: string;
};

type EditVideoCardType = {
  videoid: string;
  toEdit: videoContent;
  onDone: () => void;
};

const UpdateVideo = gql`
  mutation UpdateVideo($userid: String!, $videoid: String!, $title: String!, $thumbnail: String, $thumbnailpath: String, $description: String, $disablelike: Boolean!, $disablecomment: Boolean!) {
    editvideo(
      userid: $userid
      videoid: $videoid
      title: $title
      thumbnail: $thumbnail
      thumbnailpath: $thumbnailpath
      description: $description
      disablelike: $disablelike
      disablecomment: $disablecomment
    ) {
      message
    }
  }
`;

const EditVideoCard: React.FC<EditVideoCardType> = ({ toEdit, onDone, videoid }) => {
  const [loading, setLoading] = useState(false);
  const [imgData, setImgData] = useState<any>({ accepted: false, Msg: "", file: "", url: "" });
  const [title, setTitle] = useState({ accepted: false, Msg: "", value: "" });
  const [description, setDescription] = useState({ accepted: false, Msg: "", value: "" });
  const [disableLike, setDisableLike] = useState(false);
  const [disableComment, setDisableComment] = useState(false);
  const [editVideo, { error }] = useMutation(UpdateVideo, { refetchQueries: ["GETVIDEO"] });
  const userid = useSelector<any, string>((state) => state.auth.ID);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  useEffect(() => {
    setImgData({
      accepted: true,
      Msg: "",
      file: "initial",
      url: toEdit.thumbnail,
    });
    setTitle({
      accepted: true,
      Msg: "",
      value: toEdit.title,
    });
    setDescription({
      accepted: true,
      Msg: "",
      value: toEdit.description,
    });
    setDisableLike(toEdit.disableLike);
    setDisableComment(toEdit.disableComment);
  }, []);

  async function onUpdateHandler() {
    if (!imgData.accepted) enqueueSnackbar(imgData.Msg, { variant: "error" });
    if (!title.accepted) enqueueSnackbar(`Title: ${title.Msg}`, { variant: "error" });
    if (!description.accepted) enqueueSnackbar(`Description: ${description.Msg}`, { variant: "error" });
    if (imgData.accepted && title.accepted && description.accepted) {
      try {
        setLoading(true);
        const todeleleteRef = ref(storage, toEdit.thumbnailpath);
        let imagePath = toEdit.thumbnailpath;
        let imageUrl = toEdit.thumbnail;
        if (imgData.file !== "initial") {
          imagePath = `images/${v4()}`;
          const imageRef = ref(storage, imagePath);
          await uploadBytes(imageRef, imgData.file);
          imageUrl = await getDownloadURL(imageRef);
        }
        const success = await editVideo({
          variables: {
            userid: userid,
            videoid: videoid,
            title: title.value,
            thumbnail: imageUrl,
            thumbnailpath: imagePath,
            description: description.value,
            disablelike: disableLike,
            disablecomment: disableComment,
          },
        });
        if (success.data) {
          deleteObject(todeleleteRef).catch((error) => console.log("no such file in directory"));
          enqueueSnackbar(success.data.editvideo.message, { variant: "success" });
          setLoading(false);
          dispatch(queryAction.success());
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
      {imgData.url && <CardMedia component="img" height="194" src={imgData.url} />}
      <CardContent>
        <PhotoFileInput setData={setImgData} name="Upload Thumbnail" imgFile={imgData.file} imgName={imgData.Msg} accepted={imgData.accepted} fullWidth={true} />
        <TextInput setData={setTitle} variant="standard" label="Title" type="text" accepted={title.accepted} multiline={false} value={title.value} />
        <TextInput setData={setDescription} value={description.value} accepted={description.accepted} multiline={true} type="text" variant={undefined} label="Description" />
        <CheckboxInput setDataFirst={setDisableLike} setDataSecond={setDisableComment} checkfirst={disableLike} checksecond={disableComment} labelfirst="Disalbe Like" labelsecond="Disable Comment" />
      </CardContent>
      <CardActions>
        {loading ? (
          <CircularProgress color="inherit" sx={{ margin: "auto" }} />
        ) : (
          <Button variant="contained" endIcon={<PlayArrowIcon />} sx={{ margin: "auto", width: "200px" }} onClick={onUpdateHandler} children={"UPDATE"} />
        )}
      </CardActions>
      {error && <ShowError error={error} />}
    </Card>
  );
};

export default EditVideoCard;
