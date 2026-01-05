import NextLink from "next/link";
import {
  ButtonBase,
  Typography,
  MenuItem,
  ListItemText,
  Link,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Box } from "@mui/system";
import PopupState, { bindHover, bindPopover } from "material-ui-popup-state";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import React, { FC, ReactNode, useRef } from "react";

interface MainNavbarPopupLinkProps {
  link: string;
  icon?: React.ReactElement;
  children: ReactNode;
}

export const MainNavbarPopupLink: FC<MainNavbarPopupLinkProps> = (props) => {
  return (
    <NextLink href={props.link} passHref legacyBehavior>
      <MenuItem component="a">
        {props.icon && <ListItemIcon>{props.icon}</ListItemIcon>}
        <ListItemText primary={props.children} />
      </MenuItem>
    </NextLink>
  );
};

export const MainNavbarButtonPopout: FC<{
  children: ReactNode;
}> = (props) => {
  const children = React.Children.toArray(props.children);

  return (
    <Box sx={{ my: 1 }}>
      {children.map((child: any, index: number) => (
        <React.Fragment key={index}>
          {index > 0 && <Divider />}
          {child}
        </React.Fragment>
      ))}
    </Box>
  );
};

interface MainNavbarButtonProps {
  text: string;
  link?: string;
  mouseOver?: React.ReactElement;
  isCurrentPage?: boolean;
}

export const MainNavbarButton: FC<MainNavbarButtonProps> = (props) => {
  const { text, link, isCurrentPage, mouseOver } = props;
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <PopupState variant="popover" popupId="demo-popup-popover">
        {(popupState: any) => (
          <div>
            <Box
              component={ButtonBase}
              {...bindHover(popupState)}
              aria-owns="mouse-over-popover"
              aria-haspopup="true"
              ref={anchorRef}
              sx={(theme) => ({
                alignItems: "center",
                display: "flex",
                ml: 1,
                border:
                  isCurrentPage && `1px solid ${theme.palette.primary.main}`,
                borderRadius: "5px",
                padding: "8px",
                minWidth: "80px",
                ":hover": {
                  background: theme.palette.action.hover,
                },
              })}
            >
              {!link && (
                <Typography sx={{ pointerEvents: "none" }} variant="subtitle2">
                  {text}
                </Typography>
              )}
              {link && (
                <NextLink href={link} passHref legacyBehavior>
                  <Link
                    underline="none"
                    sx={{ color: "inherit" }}
                    variant="subtitle2"
                  >
                    {text}
                  </Link>
                </NextLink>
              )}
            </Box>
            {mouseOver && (
              <HoverPopover
                {...bindPopover(popupState)}
                anchorOrigin={{
                  horizontal: "left",
                  vertical: "bottom",
                }}
              >
                {mouseOver}
              </HoverPopover>
            )}
          </div>
        )}
      </PopupState>
    </>
  );
};
