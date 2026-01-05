import { Typography, Box } from "@mui/material";
import { FC, ReactNode } from "react";
import { LightBulb } from "src/icons/light-bulb";

export const PageHelpSection: FC<{
  styleOverride?: any;
  children: ReactNode;
}> = (props) => {
  if (!props.children) {
    return <></>;
  }
  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        backgroundColor: theme.palette.neutral?.[100],
        opacity: 0.8,
        padding: 2,
        display: "flex",
        alignItems: "center",
        my: 3,
        ...props.styleOverride,
      })}
    >
      <LightBulb
        sx={{
          color: "text.secondary",
          mr: 1,
        }}
        fontSize="small"
      />
      <Typography variant="subtitle2">{props.children}</Typography>
    </Box>
  );
};
