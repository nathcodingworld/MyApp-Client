import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Card, CardActions, CardContent, CardHeader, Chip, CircularProgress, Divider, Typography } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import UserAvatar from "../../UI/UserAvatar";
import FavoriteTwoToneIcon from "@mui/icons-material/FavoriteTwoTone";
import { authAction } from "../../../Providers/ReduxProvider";
import ContentLoader from "../../Component/ContentLoader";
import { useSnackbar } from "notistack";
import ShowError from "../../Component/ShowError";
import cookie from "react-cookies";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../../Providers/FirebaseProvider";
import { useState } from "react";

type DeleteUserCardType = {
  for: string;
  onDelete: () => void;
};

const GetAllFiles = gql`
  query GetAllFiles($id: String!) {
    preDeleteProfile(id: $id) {
      allphotopath
      allvideopath
      allaudiopath
      heart
    }
  }
`;

const DeleteProfile = gql`
  mutation DeleteProfile($userid: String!) {
    deleteprofile(userid: $userid) {
      message
    }
  }
`;

const DeleteUserCard: React.FC<DeleteUserCardType> = (props) => {
  const [ld, setLd] = useState(false);
  const userid = useSelector<any, string>((state) => state.auth.ID);
  const username = useSelector<any, string>((state) => state.auth.userName);
  const bio = useSelector<any, string>((state) => state.auth.bio);
  const { loading, error, data } = useQuery(GetAllFiles, { variables: { id: userid } });
  const [deleteAccount, { error: err }] = useMutation(DeleteProfile);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  async function onDeleteHandler() {
    try {
      setLd(true);
      const success = await deleteAccount({ variables: { userid: userid } });
      if (success) {
        dispatch(authAction.Logout());
        cookie.remove("userdata");
        const { allaudiopath, allphotopath, allvideopath } = data.preDeleteProfile;
        allaudiopath.forEach((path: string) => {
          const fileRef = ref(storage, path);
          deleteObject(fileRef).catch((error) => console.log("an error occured"));
        });
        allphotopath.forEach((path: string) => {
          const fileRef = ref(storage, path);
          deleteObject(fileRef).catch((error) => console.log("an error occured"));
        });
        allvideopath.forEach((path: string) => {
          const fileRef = ref(storage, path);
          deleteObject(fileRef).catch((error) => console.log("an error occured"));
        });
        enqueueSnackbar(success.data.deleteprofile.message, { variant: "success" });
        setLd(false);
        props.onDelete();
      }
    } catch (error: any) {
      enqueueSnackbar(error?.message, { variant: "error" });
      setLd(false);
    }
  }

  if (loading) return <ContentLoader />;
  if (error) return <ShowError error={error} />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" children={`Delete ${props.for}`} textAlign="center" />
      </CardContent>
      <CardHeader
        avatar={<UserAvatar />}
        title={username}
        subheader={bio}
        action={<Chip sx={{ width: "max-content" }} label={data.preDeleteProfile.heart} icon={<FavoriteTwoToneIcon />} color="secondary" variant="outlined" />}
      />
      <Divider />
      {ld ? (
        <CircularProgress color="inherit" sx={{ margin: "auto" }} />
      ) : err ? (
        <ShowError error={err} />
      ) : (
        <CardActions children={<Button sx={{ margin: "auto" }} onClick={onDeleteHandler} children="DELETE" />} />
      )}
    </Card>
  );
};

export default DeleteUserCard;
