import { Box, Modal } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import EditAudioCard from "../Cards/EditCards/EditAudioCard";
import EditPhotoCard from "../Cards/EditCards/EditPhotoCard";
import EditPostCard from "../Cards/EditCards/EditPostCard";
import EditProfileCard from "../Cards/EditCards/EditProfileCard";
import EditVideoCard from "../Cards/EditCards/EditVideoCard";

type EditModalType = {
  open: boolean;
  onClose: (state: boolean) => void;
  page: string;
  id: string;
  content: any;
};

const style = {
  position: "absolute" as "absolute",
  top: "100px",
  left: "50%",
  transform: "translateX(-50%)",
  width: 400,
  bgcolor: "#181818",
  border: "1.5px solid #fff",
  boxShadow: 24,
  p: 1,
};

const EditModal: React.FC<EditModalType> = ({ open, onClose, page, content, id }) => {
  const error = useSelector<any, boolean>((state) => state.query.error);
  const imgfile = useSelector<any, string>((state) => state.query.imgfile);
  const dispatch = useDispatch();

  function onCloseHandler() {
    onClose(!open);
  }

  return (
    <Modal open={open} onClose={onCloseHandler} sx={{ overflowY: "scroll" }}>
      <Box sx={style}>
        {page === "Account" && <EditProfileCard onClose={onCloseHandler} />}
        {page === "Post" && <EditPostCard postid={id} toEdit={content} onDone={onCloseHandler} />}
        {page === "Photo" && <EditPhotoCard photoid={id} toEdit={content} onDone={onCloseHandler} />}
        {page === "Video" && <EditVideoCard videoid={id} toEdit={content} onDone={onCloseHandler} />}
        {page === "Audio" && <EditAudioCard audioid={id} toEdit={content} onDone={onCloseHandler} />}
      </Box>
    </Modal>
  );
};

export default EditModal;
