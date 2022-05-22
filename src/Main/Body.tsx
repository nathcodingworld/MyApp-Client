import { Box } from "@mui/material";
import ContentWraper from "../Components/Layout/ContentWraper";
import Sidebar from "../Components/Layout/Sidebar";
import { io } from "socket.io-client";

const server = process.env.NODE_ENV === "production" ? process.env.REACT_APP_SERVER : "http://localhost:5000";

const socket = io(`${server}`);

type proptype = {
  open: boolean;
  onToggle: (state: boolean) => () => void;
};
const Body: React.FC<proptype> = (prop) => {
  return (
    <Box>
      <Sidebar socket={socket} open={prop.open} onToggle={prop.onToggle}></Sidebar>
      <ContentWraper socket={socket}></ContentWraper>
    </Box>
  );
};

export default Body;
