import { Typography } from "@mui/material";
import Box from "@mui/system/Box";
import { FC, ReactNode } from "react";

interface TextAndCustomContentSectionProps {
  title: ReactNode;
  headline: ReactNode;
  body: ReactNode;
  children: ReactNode;
}

export const TextAndCustomContentSection: FC<
  TextAndCustomContentSectionProps
> = (props) => {
  const { title, headline, body, children } = props;
  return (
    <>
      <Typography variant="caption">{title}</Typography>
      <Typography variant="h4">{headline}</Typography>
      <Box sx={{ display: "flex" }}>
        <Typography variant="body1">{body}</Typography>
        <>{children}</>
      </Box>
    </>
  );
};
