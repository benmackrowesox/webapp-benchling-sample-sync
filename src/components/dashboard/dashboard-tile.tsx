import { Box, CircularProgress, Typography } from "@mui/material";
import { FC, ReactNode } from "react";

interface DashboardTileProps {
  text: string;
  isSelected: boolean;
  onClick?: () => void;
  borderColour: string;
  children: ReactNode;
}

export const DashboardTile: FC<DashboardTileProps> = (props) => {
  const { text, onClick, isSelected, borderColour } = props;

  return (
    <Box
      sx={(theme) => ({
        width: "150px",
        height: "80px",
        mr: 2,
        mt: 2,
        border: "2px solid",
        borderColor: borderColour,
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        justifyContent: "center",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        background: isSelected ? borderColour : "white",
        ":hover": {
          background: isSelected
            ? borderColour
            : !!onClick && theme.palette.action.hover,
          opacity: !!onClick && 0.8,
          borderWidth: 3,
        },
      })}
      onClick={onClick}
    >
      <Typography
        sx={(theme) => ({
          fontSize: 12,
          mt: "4px",
          fontWeight: "500",
          color: isSelected ? "white" : theme.palette.text.primary,
        })}
        variant="caption"
      >
        {text}
      </Typography>
      <Typography
        sx={(theme) => ({
          color: isSelected ? "white" : theme.palette.primary.main,
          fontSize: 24,
        })}
      >
        {props.children == undefined ? (
          <CircularProgress size="20px" />
        ) : (
          props.children
        )}
      </Typography>
    </Box>
  );
};
