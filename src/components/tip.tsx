import type { FC } from "react";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { LightBulb as LightBulbIcon } from "../icons/light-bulb";

interface TipProps {
  message?: string;
}

const TipRoot = styled("div")(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.neutral![800]
      : theme.palette.neutral![100],
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  padding: theme.spacing(1),
}));

export const Tip: FC<TipProps> = (props) => {
  const { message } = props;

  return (
    <TipRoot>
      <LightBulbIcon
        sx={{
          color: "text.secondary",
          mr: 1,
        }}
        fontSize="small"
      />
      <Typography
        color="textSecondary"

        variant="caption"
      >
        Do this and do that
      </Typography>
    </TipRoot>
  );
};

Tip.propTypes = {
  message: PropTypes.string.isRequired,
};
