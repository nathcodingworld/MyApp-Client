import ReactPlayer from "react-player";

type MiniVideoPlayerType = {
  file: string;
  Ref: any;
  play: boolean;
  onEnded: () => void;
  onUpdate: (state: any) => void;
};

const MiniVideoPlayer: React.FC<MiniVideoPlayerType> = (props) => {
  return <ReactPlayer ref={props.Ref} url={props.file} playing={props.play} height="226px" width="400px" onEnded={props.onEnded} onProgress={props.onUpdate} />;
};

export default MiniVideoPlayer;
