import { Typography } from "@mui/material";
import Box from "@mui/system/Box";
import { FC, ReactNode } from "react";

export const PopHeadline: FC<{ children: ReactNode }> = (props) => {
  return (
    <Box
      sx={(theme) => ({
        background: theme.palette.primary.main,
        maxWidth: "min(600px, 90%)",
        minWidth: "300px",
        marginLeft: "auto",
        marginRight: "auto",
        color: "white",
        textAlign: "center",
        padding: 2,
        borderRadius: "15px",
        my: 3,
      })}
    >
      <Typography sx={{ fontSize: "1.25em" }}>{props.children}</Typography>
    </Box>
  );
};
