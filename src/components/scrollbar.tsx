import "simplebar/dist/simplebar.min.css";
import type { MutableRefObject } from "react";
import { forwardRef } from "react";
import SimpleBar, { type Props as SimpleBarProps } from "simplebar-react";
import type { Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { SxProps } from "@mui/system";

interface ScrollbarProps extends SimpleBarProps {
  ref: MutableRefObject<typeof SimpleBar>;
  sx?: SxProps<Theme>;
}

const ScrollbarRoot = styled(SimpleBar)``;

export const Scrollbar = forwardRef<
  MutableRefObject<typeof SimpleBar>,
  ScrollbarProps
>((props, ref) => {
  return (
    <ScrollbarRoot
      // @ts-ignore
      ref={ref}
      {...props}
    />
  );
});
