import { Box, useMediaQuery, useTheme } from "@mui/system";
import { FC, ReactNode, useState } from "react";

interface FlipCardProps {
  title: string;
  image?: string;
  children: ReactNode;
}

export const ColourFlipCard: FC<FlipCardProps> = (props) => {
  const { title, image, children } = props;
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={(theme) => ({
        background: isFlipped ? theme.palette.primary.main : "transparent",
        backgroundImage: isFlipped ? "none" : `url(${image})`,
        backgroundSize: "cover",
        width: "350px",
        height: "540px",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        alignItems: "center",
        textAlign: "start",
        display: "flex",
        borderRadius: "20px",
        flexDirection: "column",
        cursor: "default",
        color: "white",
      })}
      onMouseEnter={() => {
        setIsFlipped(true);
      }}
      onMouseLeave={() => {
        setIsFlipped(false);
      }}
      onClick={() => {
        if (mobileDevice) {
          setIsFlipped(!isFlipped);
        }
      }}
    >
      {!isFlipped ? (
        <Box
          sx={{ display: "flex", fontWeight: 500, fontSize: "2em", px: "30px" }}
          height="100%"
          alignItems={"center"}
          textAlign={"center"}
        >
          {title}
        </Box>
      ) : (
        <Box sx={{ padding: "20px" }}>{children}</Box>
      )}
    </Box>
  );
};

export const FlipCard: FC<FlipCardProps> = (props) => {
  const { title, image, children } = props;
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={(theme) => ({
        background: theme.palette.neutral![isFlipped ? 200 : 200],
        width: "250px",
        height: "260px",
        px: isFlipped ? "0px" : "15px",
        py: isFlipped ? "0px" : "20px",
        fontWeight: 500,
        alignItems: "center",
        textAlign: "start",
        display: "flex",
        borderRadius: "8px",
        flexDirection: "column",
        cursor: "default",
      })}
      onMouseEnter={() => {
        setIsFlipped(true);
      }}
      onMouseLeave={() => {
        setIsFlipped(false);
      }}
      onClick={() => {
        if (mobileDevice) {
          setIsFlipped(!isFlipped);
        }
      }}
    >
      {!isFlipped ? (
        <>
          {title}
          <img src={image} width={180} />
        </>
      ) : (
        <Box sx={{ m: "20px" }}>{children}</Box>
      )}
    </Box>
  );
};
