import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/system";

type Variant = "light" | "primary";

interface LogoProps {
  variant?: Variant;
}

export const Logo = styled((props: LogoProps) => {
  const { variant, ...other } = props;

  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const path =
    variant === "light"
      ? "/static/white-logo.png"
      : darkMode
      ? "/static/white-logo.png"
      : "/static/black-logo.png";

  return <img src={path} alt="logo" width="42" height="42" {...other} />;
})``;

Logo.defaultProps = {
  variant: "primary",
};

Logo.propTypes = {
  variant: PropTypes.oneOf<Variant>(["light", "primary"]),
};

export const ColourLogo = (props: any) => {
  const { ...other } = props;

  const path = "/static/esoxbiologics-logo.png";

  return (
    <img
      src={path}
      alt="logo"
      width="89"
      height="45"
      style={{ borderRadius: 2 }}
      {...other}
    />
  );
};
