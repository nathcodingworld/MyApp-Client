import { gql, useMutation } from "@apollo/client";
import { Button, Card, CardContent, CircularProgress, Divider, Stack } from "@mui/material";

import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authAction } from "../../../Providers/ReduxProvider";
import ConfirmInput from "../_Inputs/ConfirmInput";
import PhotoFileInput from "../_Inputs/PhotoFileInput";
import TextInput from "../_Inputs/TextInput";
import ShowError from "../../Component/ShowError";
import { v4 } from "uuid";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../Providers/FirebaseProvider";

type EditProfileCardType = {
  onClose: () => void;
};

const reSignUp = gql`
  mutation reSignUp($userid: String!, $userName: String!, $bio: String, $password: String!, $avatar: String, $filepath: String) {
    resignup(userid: $userid, userName: $userName, bio: $bio, password: $password, avatar: $avatar, filepath: $filepath) {
      id
      token
      userName
      avatar
      bio
      filepath
    }
  }
`;

const EditProfileCard: React.FC<EditProfileCardType> = (props) => {
  const [loading, setLoading] = useState(false);
  const username = useSelector<any, string>((state) => state.auth.userName);
  const avatar = useSelector<any, string>((state) => state.auth.propic);
  const userid = useSelector<any, string>((state) => state.auth.ID);
  const filePath = useSelector<any, string>((state) => state.auth.AP);
  const description = useSelector<any, string>((state) => state.auth.bio);
  const [imgData, setImgData] = useState<any>({ accepted: false, Msg: "Add File", file: "", url: "" });
  const [userData, setUserData] = useState({ accepted: false, Msg: "", value: "" });
  const [descriptionData, setDescriptionData] = useState({ accepted: false, Msg: "", value: "" });
  const [userPassword, setPasswordData] = useState({ accepted: false, Msg: "Must not empty", value: "" });
  const [userConfirm, setConfirmData] = useState({ accepted: false, Msg: "Must not empty", value: "" });
  const [resignUp, { error }] = useMutation(reSignUp);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  useEffect(() => {
    setUserData({
      accepted: true,
      Msg: "",
      value: username,
    });
    setDescriptionData({
      accepted: true,
      Msg: "",
      value: description,
    });
    setImgData({
      accepted: true,
      Msg: "",
      file: "initial",
      url: avatar,
    });
  }, []);

  async function onSubmitHandler() {
    if (!imgData.accepted) enqueueSnackbar("Image: " + imgData.Msg, { variant: "error" });
    if (!userData.accepted) enqueueSnackbar("username: " + userData.Msg, { variant: "error" });
    if (!descriptionData.accepted) enqueueSnackbar("description: " + descriptionData.Msg, { variant: "error" });
    if (!userPassword.accepted) enqueueSnackbar("Password: " + userPassword.Msg, { variant: "error" });
    if (!userConfirm.accepted) enqueueSnackbar("confirmPassword: " + userConfirm.Msg, { variant: "error" });
    if (imgData.accepted && userData.accepted && userPassword.accepted && userConfirm.accepted && descriptionData.accepted) {
      try {
        setLoading(true);
        const todeleleteRef = ref(storage, filePath);
        let imagePath = filePath;
        let imageUrl = avatar;
        if (imgData.file !== "initial") {
          imagePath = `images/${v4()}`;
          const imageRef = ref(storage, imagePath);
          await uploadBytes(imageRef, imgData.file);
          imageUrl = await getDownloadURL(imageRef);
        }
        const success = await resignUp({ variables: { userid: userid, userName: userData.value, password: userPassword.value, avatar: imageUrl, bio: descriptionData.value, filepath: imagePath } });
        if (success.data) {
          deleteObject(todeleleteRef).catch((error) => console.log("an error occured"));
          dispatch(
            authAction.Login({
              token: success.data.resignup.token,
              ID: success.data.resignup.id,
              propic: success.data.resignup.avatar,
              userName: success.data.resignup.userName,
              bio: success.data.resignup.bio,
              filePath: success.data.resignup.filePath,
            })
          );
          enqueueSnackbar("successful you are log in", { variant: "success" });
          setLoading(false);
          props.onClose();
        }
      } catch (error: any) {
        setLoading(false);
        enqueueSnackbar(error?.message, { variant: "error" });
      }
    }
  }

  return (
    <Card>
      <CardContent>
        <TextInput label="userName" type="text" variant="standard" setData={setUserData} value={userData.value} accepted={userData.accepted} multiline={false} />
        <TextInput label="Description" type="text" variant="standard" setData={setDescriptionData} value={descriptionData.value} accepted={descriptionData.accepted} multiline={false} />
        <TextInput setData={setPasswordData} variant="standard" type="password" label="password" accepted={userPassword.accepted} multiline={false} value={userPassword.value} />
        <ConfirmInput setData={setConfirmData} toConfirm={userPassword.value} accepted={userConfirm.accepted} />
        <PhotoFileInput setData={setImgData} name="Profile pic" imgName={imgData.Msg} accepted={imgData.accepted} imgFile={imgData.file} fullWidth={true} />
        <Divider />
        <Stack direction={"column"} sx={{ margin: "auto" }}>
          {loading ? <CircularProgress color="inherit" sx={{ margin: "auto" }} /> : <Button onClick={onSubmitHandler}>Update</Button>}
          {error && <ShowError error={error} />}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EditProfileCard;
