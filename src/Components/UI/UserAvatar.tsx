import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";

const UserAvatar: React.FC = () => {
  let User = `${process.env.PUBLIC_URL}/unknown.png`;
  const propic = useSelector<any, string>((state) => state.auth.propic);
  if (propic !== "") User = propic;

  return <Avatar alt="user" src={User} />;
};

export default UserAvatar;
