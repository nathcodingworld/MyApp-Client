import { List, ListItem, ListItemAvatar, ListItemText, Divider, Avatar } from "@mui/material";

type CommentType = {
  comments:
    | {
        userid: {
          userName: string;
          avatar: string;
        };
        date: string;
        comment: string;
        // replys: { id: string; reply: string }[] | null;
      }[]
    | null;
};

const Comments: React.FC<CommentType> = (props) => {
  return (
    <List sx={{ width: "100%", maxWidth: "100%" }}>
      {props.comments?.map((data, i) => {
        if (!data.userid || !data.userid.userName) return;
        return (
          <div key={i}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt={data.userid.userName} src={data.userid.avatar} />
              </ListItemAvatar>
              <ListItemText primary={data.userid.userName} secondary={data.comment} />
            </ListItem>
            <Divider variant="inset" component="li" />
          </div>
        );
      })}
    </List>
  );
};

export default Comments;
