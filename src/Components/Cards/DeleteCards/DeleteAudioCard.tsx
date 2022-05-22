import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Divider, Typography } from "@mui/material";
import { deleteObject, ref } from "firebase/storage";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";

import { storage } from "../../../Providers/FirebaseProvider";
import ContentLoader from "../../Component/ContentLoader";
import ShowError from "../../Component/ShowError";
import DisabledTextInput from "../_Inputs/DisabledTextInput";

type DeleteAudioCardType = {
  for: string;
  audioid: string;
};

const PreDeleteAudio = gql`
  query preDeleteAudio($id: String!) {
    getOneAudio(id: $id) {
      cover
      filepath
      coverpath
      title
      owner
      coverby
    }
  }
`;

const DeleteAudio = gql`
  mutation DeleteAudio($audioid: String!, $userid: String!, $coverpath: String, $filepath: String!) {
    deleteaudio(audioid: $audioid, userid: $userid, coverpath: $coverpath, filepath: $filepath) {
      message
    }
  }
`;

const DeleteAudioCard: React.FC<DeleteAudioCardType> = (props) => {
  const { loading, error, data } = useQuery(PreDeleteAudio, { variables: { id: props.audioid } });
  const [deleteAudio, { loading: ld }] = useMutation(DeleteAudio, { refetchQueries: ["GETAUDIO"] });
  const userid = useSelector<any, string>((state) => state.auth.ID);
  const { enqueueSnackbar } = useSnackbar();

  async function onDeleteHandler() {
    const imagePath = data.getOneAudio.coverpath;
    const audioPath = data.getOneAudio.filepath;
    const imageRef = ref(storage, imagePath);
    const audioRef = ref(storage, audioPath);
    try {
      const success = await deleteAudio({ variables: { audioid: props.audioid, userid: userid, coverpath: imagePath, filepath: audioPath } });
      if (success) {
        if (data.getOneAudio.coverpath) deleteObject(imageRef).catch((err) => console.log("nosuch file"));
        deleteObject(audioRef).catch((err) => console.log("nosuchfile"));
        enqueueSnackbar(success.data.deleteaudio.message, { variant: "success" });
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
        {data.getOneAudio.cover && <CardMedia component="img" height="194" src={data.getOneAudio.cover} />}
        <DisabledTextInput multiline={false} label="Title" value={`${data.getOneAudio.title} (cover by: ${data.getOneAudio.coverby})`} />
        <DisabledTextInput multiline={false} label="owner" value={data.getOneAudio.owner} />
      </CardContent>
      {ld ? <CircularProgress color="inherit" sx={{ margin: "auto" }} /> : <CardActions children={<Button sx={{ margin: "auto" }} onClick={onDeleteHandler} children="DELETE" />} />}
    </Card>
  );
};

export default DeleteAudioCard;
