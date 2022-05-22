import { CardContent, CardHeader } from "@mui/material";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import ErrorIcon from "@mui/icons-material/Error";
import GppBadIcon from "@mui/icons-material/GppBad";
import DiscFullIcon from "@mui/icons-material/DiscFull";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import { ApolloError } from "@apollo/client";

type ShowErrorType = {
  error: ApolloError;
};

const ShowError: React.FC<ShowErrorType> = ({ error }) => {
  let gplError: any = [{ extensions: { type: "error", info: "something went wrong", code: "404", clienterror: false } }];
  if (error.graphQLErrors[0]) {
    gplError = error.graphQLErrors;
  }
  let code = "Error";
  const type = gplError[0].extensions.type;
  const info = gplError[0].extensions.info;
  const getcode = gplError[0].extensions.code;
  const client = gplError[0].extensions.clienterror;
  const erricon =
    type === "Internal" ? (
      <DiscFullIcon color="error" fontSize="large" />
    ) : type === "Auth" ? (
      <NoAccountsIcon color="error" fontSize="large" />
    ) : type === "Invalid" ? (
      <GppBadIcon color="error" fontSize="large" />
    ) : type === "Broken" ? (
      <PriorityHighIcon color="error" fontSize="large" />
    ) : type === "Crash" ? (
      <NewReleasesIcon color="error" fontSize="large" />
    ) : (
      <ErrorIcon color="error" fontSize="large" />
    );

  if (typeof getcode === "string") code = getcode;
  if (client) code = "";

  return (
    <>
      <CardHeader
        avatar={erricon}
        title={error.message}
        subheader={code}
        sx={{
          "& .MuiCardHeader-title": { fontSize: "large", paddingLeft: 2, color: (theme) => theme.palette.error.main },
          "& .MuiCardHeader-subheader": { paddingLeft: 2, color: (theme) => theme.palette.error.main },
          "& .MuiCardHeader-avatar": { transform: "scale(1.7)" },
        }}
      />
      {typeof info === "string" && <CardContent children={info} sx={{ color: (theme) => theme.palette.error.light }} />}
    </>
  );
};

export default ShowError;
