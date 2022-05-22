import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { useSelector } from "react-redux";

const server = process.env.NODE_ENV === "production" ? process.env.REACT_APP_SERVER : "http://localhost:5000";

const ApolloReactProvider: React.FC = (props) => {
  const token = useSelector<any, string>((state) => state.auth.token);
  const client = new ApolloClient({
    uri: `${server}/graphql`,
    cache: new InMemoryCache(),
    headers: {
      Authorization: `bearer ${token}`,
    },
  });
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
};

export default ApolloReactProvider;
