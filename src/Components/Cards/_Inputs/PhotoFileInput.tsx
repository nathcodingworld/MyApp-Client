import { Button, Input, Stack } from "@mui/material";
import { useSnackbar } from "notistack";

type PhotoFileInputType = {
  imgFile: string;
  accepted: boolean;
  imgName: string;
  name: string;
  fullWidth: boolean;
  setData: (args: { accepted: boolean; Msg: string; file: string; url: string }) => void;
};

const PhotoFileInput: React.FC<PhotoFileInputType> = (props) => {
  const { enqueueSnackbar } = useSnackbar();

  async function validateStoreViewImageHandler(e: any) {
    const [type, ext] = e.target.files[0].type.split("/");
    const acceptable = ["png", "jpeg", "jpg"];
    const accepted = type === "image" && acceptable.includes(ext);
    let file = "";
    let Msg = "Add File";
    let url = "";
    if (accepted) {
      file = e.target.files[0];
      Msg = e.target.files[0].name;
      url = URL.createObjectURL(e.target.files[0]);
    } else {
      Msg = "input image file only";
      file = "";
      url = "";
    }
    props.setData({
      accepted,
      file,
      Msg,
      url,
    });
  }
  function onWarningHandler() {
    enqueueSnackbar("Please choose small size image file", { variant: "info" });
  }

  return (
    <label htmlFor="profile-file">
      <Input type="file" sx={{ display: "none" }} id="profile-file" onChange={validateStoreViewImageHandler} />
      <Stack direction="row" spacing={2} sx={{ width: "100%", pt: "10px", height: "25px", margin: "5px 0" }}>
        <Button variant="outlined" component="span" color={props.accepted ? "primary" : "error"} fullWidth={props.fullWidth} onClick={onWarningHandler}>
          {props.name}
        </Button>
        {!props.fullWidth && <Input disabled value={props.imgName} />}
      </Stack>
    </label>
  );
};

export default PhotoFileInput;
