import { Button, Input, Stack } from "@mui/material";
import { useSnackbar } from "notistack";

type AudioFileInputType = {
  audFile: string;
  audMsg: string;
  setData: (args: { accepted: boolean; Msg: string; file: string }) => void;
};

const AudioFileInput: React.FC<AudioFileInputType> = (props) => {
  const { enqueueSnackbar } = useSnackbar();

  async function validateStoreAudioHandler(e: any) {
    const [type, ext] = e.target.files[0].type.split("/");
    const acceptable = ["mp3", "x-m4a", "wav", "mid", "aif", "mpeg"];
    const accepted = type === "audio" && acceptable.includes(ext);
    let file = "";
    let Msg = "Add File";
    if (accepted) {
      file = e.target.files[0];
      Msg = e.target.files[0].name;
    } else {
      Msg = "input audio file only";
      file = "";
    }
    props.setData({
      accepted,
      file,
      Msg,
    });
  }

  function onWarningHandler() {
    enqueueSnackbar("Please choose small size audio file", { variant: "info" });
  }

  return (
    <label htmlFor="contained-button-file">
      <Input type="file" sx={{ display: "none" }} id="contained-button-file" onChange={validateStoreAudioHandler} />
      <Stack direction="row" spacing={2} sx={{ width: "100%", height: "25px", margin: "5px 0" }}>
        <Button variant="outlined" component="span" onClick={onWarningHandler}>
          Audio file
        </Button>
        <Input disabled value={props.audMsg} />
      </Stack>
    </label>
  );
};

export default AudioFileInput;
