import { Button, Card, CardActions, CardContent, CircularProgress, Divider, Stack } from "@mui/material";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { authAction } from "../../../Providers/ReduxProvider";
import { useDispatch } from "react-redux";
import { gql, useMutation } from "@apollo/client";
import { storage } from "../../../Providers/FirebaseProvider";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import PhotoFileInput from "../_Inputs/PhotoFileInput";
import TextInput from "../_Inputs/TextInput";
import EmailInput from "../_Inputs/EmailInput";
import ConfirmInput from "../_Inputs/ConfirmInput";
import cookie from "react-cookies";
import ShowError from "../../Component/ShowError";

const Signup = gql`
  mutation Signup($userName: String!, $email: String!, $password: String!, $avatar: String, $bio: String, $filepath: String) {
    signup(userName: $userName, email: $email, password: $password, avatar: $avatar, bio: $bio, filepath: $filepath) {
      id
      token
      userName
      avatar
      bio
      filepath
    }
  }
`;

const Login = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      token
      userName
      avatar
      bio
      filepath
    }
  }
`;

type type = {
  onClose: () => void;
  onNew: boolean;
  onLogin: () => void;
  onSignup: () => void;
};

const btnStyle = { margin: "auto" };

const AddUserCard: React.FC<type> = (props) => {
  const [loading, setLoading] = useState(false);
  const [imgData, setImgData] = useState<any>({ accepted: false, Msg: "Add File", file: "" });
  const [userData, setUserData] = useState({ accepted: false, Msg: "Must not empty", value: "" });
  const [userBio, setUserBio] = useState({ accepted: false, Msg: "Must not empty", value: "" });
  const [userEmail, setEmailData] = useState({ accepted: false, Msg: "Must not empty", value: "" });
  const [userPassword, setPasswordData] = useState({ accepted: false, Msg: "Must not empty", value: "" });
  const [userConfirm, setConfirmData] = useState({ accepted: false, Msg: "Must not empty", value: "" });
  const [signUp, { error }] = useMutation(Signup);
  const [logIn, { loading: ld, error: err }] = useMutation(Login);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  function Finalize(DaTa: any) {
    const expires = new Date();
    expires.setDate(Date.now() + 1000 * 60 * 60 * 24 * 14);
    const userdata = { token: DaTa.token, ID: DaTa.id, propic: DaTa.avatar, userName: DaTa.userName, bio: DaTa.bio, filePaths: DaTa.filePaths, filepath: DaTa.filepath };
    dispatch(authAction.Login(userdata));
    cookie.save("userdata", JSON.stringify(userdata), { path: "/", expires, maxAge: 1000 });
    enqueueSnackbar("successful you are log in", { variant: "success" });
    props.onClose();
  }
  async function onSubmitHandler() {
    if (!imgData.accepted) enqueueSnackbar("Image: " + imgData.Msg, { variant: "error" });
    if (!userData.accepted) enqueueSnackbar("username: " + userData.Msg, { variant: "error" });
    if (!userBio.accepted) enqueueSnackbar("description: " + userBio.Msg, { variant: "error" });
    if (!userEmail.accepted) enqueueSnackbar("Email: " + userEmail.Msg, { variant: "error" });
    if (!userPassword.accepted) enqueueSnackbar("Password: " + userPassword.Msg, { variant: "error" });
    if (!userConfirm.accepted) enqueueSnackbar("confirmPassword: " + userConfirm.Msg, { variant: "error" });
    if (imgData.accepted && userData.accepted && userEmail.accepted && userPassword.accepted && userConfirm.accepted && userBio.accepted) {
      const imagePath = `images/${v4()}`;
      try {
        setLoading(true);
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, imgData.file);
        const imgUrl = await getDownloadURL(imageRef);
        const success = await signUp({
          variables: { userName: userData.value, email: userEmail.value, password: userPassword.value, avatar: imgUrl, bio: userBio.value, filepath: imagePath },
        });
        if (success.data) Finalize(success.data.signup);
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        enqueueSnackbar(error?.message, { variant: "error" });
      }
    }
  }

  async function onSubmitLoginHandler() {
    if (!userEmail.accepted) enqueueSnackbar("Email: " + userEmail.Msg, { variant: "error" });
    if (!userPassword.accepted) enqueueSnackbar("Password: " + userPassword.Msg, { variant: "error" });
    if (userEmail.accepted && userPassword.accepted) {
      try {
        const success = await logIn({ variables: { email: userEmail.value, password: userPassword.value } });
        if (success.data) Finalize(success.data.login);
      } catch (error: any) {
        enqueueSnackbar(error?.message, { variant: "error" });
      }
    }
  }

  function onLogInHandler() {
    setEmailData({ accepted: false, Msg: "Must not empty", value: "" });
    setPasswordData({ accepted: false, Msg: "Must not empty", value: "" });
    props.onLogin();
  }

  function onSignupHandler() {
    setImgData({ accepted: false, Msg: "Add File", file: "" });
    setUserData({ accepted: false, Msg: "Must not empty", value: "" });
    setUserBio({ accepted: false, Msg: "Must not empty", value: "" });
    setEmailData({ accepted: false, Msg: "Must not empty", value: "" });
    setPasswordData({ accepted: false, Msg: "Must not empty", value: "" });
    setConfirmData({ accepted: false, Msg: "Must not empty", value: "" });
    props.onSignup();
  }
  if (props.onNew)
    return (
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <TextInput setData={setUserData} variant="standard" label="User name" type="text" accepted={userData.accepted} multiline={false} value={userData.value} />
            <TextInput setData={setUserBio} variant="standard" label="Description" type="text" accepted={userBio.accepted} multiline={false} value={userBio.value} />
            <EmailInput setData={setEmailData} accepted={userEmail.accepted} />
            <TextInput setData={setPasswordData} variant="standard" type="password" label="password" accepted={userPassword.accepted} multiline={false} value={userPassword.value} />
            <ConfirmInput setData={setConfirmData} toConfirm={userPassword.value} accepted={userConfirm.accepted} />
            <PhotoFileInput setData={setImgData} name="Profile pic" imgName={imgData.Msg} accepted={imgData.accepted} imgFile={imgData.file} fullWidth={true} />
          </Stack>
        </CardContent>
        <CardActions>
          <Stack direction={"column"} sx={btnStyle}>
            {loading ? <CircularProgress color="inherit" sx={{ margin: "auto" }} /> : <Button onClick={onSubmitHandler}>SIGN UP</Button>}
            {error && <ShowError error={error} />}
          </Stack>
        </CardActions>
        <Divider children={"or"} />
        <CardActions children={<Button sx={btnStyle} onClick={onLogInHandler} size="small" children="LOG IN" />} />
      </Card>
    );

  return (
    <Card>
      <CardContent>
        <EmailInput setData={setEmailData} accepted={userEmail.accepted} />
        <TextInput setData={setPasswordData} variant="standard" type="password" label="password" accepted={userPassword.accepted} multiline={false} value={userPassword.value} />
      </CardContent>
      <CardActions>
        <Stack direction={"column"} sx={btnStyle}>
          {ld ? <CircularProgress color="inherit" sx={{ margin: "auto" }} /> : <Button onClick={onSubmitLoginHandler}>LOG IN</Button>}
          {err && <ShowError error={err} />}
        </Stack>
      </CardActions>
      <Divider children={"or"} />
      <CardActions children={<Button sx={btnStyle} onClick={onSignupHandler} size="small" children="SIGN UP" />} />
    </Card>
  );
};

export default AddUserCard;
