import { Grid } from "@mui/material";
import React, { Children, FC, ReactNode } from "react";
import { GridSize } from "@mui/system/Unstable_Grid";
import Box from "@mui/system/Box";

export const CaptionIcons: FC<{
  size?: "small" | "full";
  md?: GridSize;
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
    <Grid
      container
      justifyContent={"center"}
      rowSpacing={2}
      columnSpacing={2}
      sx={{ ...sizeStyle }}
    >
      {Children.map(props.children, (child, idx) => (
        <Grid
          key={idx}
          item
          display={"flex"}
          justifyContent={"center"}
          xs={12}
          sm={6}
          md={props.md ?? 4}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

export const CaptionIcon: FC<{
  variant?: "dark";
  size?: "small" | "med";
  img: string;
  shrinkToFit?: boolean;
  children: ReactNode;
}> = (props) => {
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      sx={{ textAlign: "center" }}
      fontSize={props.size == "med" ? ".9em" : ".75em"}
      fontWeight={"600"}
      width={props.shrinkToFit == false ? "100%" : "auto"}
      maxWidth={props.size == "med" ? "400px" : "250px"}
    >
      <img src={props.img} width={props.size == "med" ? "150px" : "100px"} />

      {props.variant == "dark" ? (
        <Box
          sx={(theme) => ({
            background: theme.palette.primary.main,
            p: 1,
            width: "100%",
            color: "white",
            fontSize: "1em",
            fontWeight: 400,
          })}
        >
          {props.children}
        </Box>
      ) : (
        props.children
      )}
    </Box>
  );
};
