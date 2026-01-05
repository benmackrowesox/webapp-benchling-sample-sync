import { Typography } from "@mui/material";
import Box from "@mui/system/Box";
import { FC, ReactNode } from "react";

export const BlockCards: FC<{
  size?: "small" | "full";
  style?: any;
  children: ReactNode;
}> = (props) => {
  const sizeStyle =
    props.size == "small"
      ? {
          maxWidth: "max(50%, 300px)",
          marginLeft: "auto",
          marginRight: "auto",
        }
      : {};

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        justifyItems: "center",
        alignItems: "center",
        rowGap: "40px",
        columnGap: "40px",
        mt: 5,
        ...props.style,
        ...sizeStyle,
      }}
    >
      {props.children}
    </Box>
  );
};
export const BlockCard: FC<{ title?: string; children: ReactNode }> = (
  props,
) => {
  return (
    <Box
      sx={(theme) => ({
        // background: theme.palette.neutral![500],
        background: theme.palette.primary.main,
        color: "white",
        width: "300px",
        height: "140px",
        px: "15px",
        py: "20px",
        fontWeight: 500,
        alignItems: "center",
        display: "flex",
        borderRadius: "8px",
        mb: 2,
      })}
    >
      {props.title && <Typography variant="h5">{props.title}</Typography>}
      {props.children}
    </Box>
  );
};
