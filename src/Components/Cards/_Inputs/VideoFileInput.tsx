import { Button, Input, Stack } from "@mui/material";
import { useSnackbar } from "notistack";

type VideoFileInputType = {
  vdoFile: string;
  setData: (args: { accepted: boolean; Msg: string; file: string; url: string }) => void;
};

const VideoFileInput: React.FC<VideoFileInputType> = (props) => {
  const { enqueueSnackbar } = useSnackbar();

  async function validateStorePlayVideoHandler(e: any) {
    const [type, ext] = e.target.files[0].type.split("/");
    const acceptable = ["mp4", "wmv", "mov", "avi", "avchd", "mkv", "webm", "flv"];
    const accepted = type === "video" && acceptable.includes(ext);
    let file = "";
    let Msg = "Add File";
    let url = "";
    if (accepted) {
      file = e.target.files[0];
      Msg = e.target.files[0].name;
      url = URL.createObjectURL(e.target.files[0]);
    } else {
      Msg = "input video file only";
      file = "";
      url = "";
    }
    props.setData({
      accepted,
      Msg,
      file,
      url,
    });
  }

  function onWarningHandler() {
    enqueueSnackbar("Please choose small size video file", { variant: "info" });
  }

  return (
    <label htmlFor="contained-button-videofile">
      <Input type="file" sx={{ display: "none" }} id="contained-button-videofile" onChange={validateStorePlayVideoHandler} />
      <Stack direction="row" spacing={2} sx={{ width: "100%", height: "max-content", margin: "5px 0" }}>
        <Button variant="outlined" component="span" onClick={onWarningHandler}>
          video file
        </Button>
        {props.vdoFile && <video src={props.vdoFile} autoPlay height={"100px"} />}
      </Stack>
    </label>
  );
};

export default VideoFileInput;
