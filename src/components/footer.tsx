import type { FC } from "react";
import {
  Box,
  Container,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { alpha } from "@mui/material/styles";
import { MinusOutlined as MinusOutlinedIcon } from "../icons/minus-outlined";
import { ColourLogo } from "./logo";

const sections = [
  {
    title: "Solutions",
    links: [
      {
        title: "Detect",
        href: "/detect",
      },
      {
        title: "Detect Livestock",
        href: "/detect/livestock",
      },
      {
        title: "Detect Environment",
        href: "/detect/environment",
      },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "Why", href: "/why" },
      { title: "Opportunities", href: "/opportunities" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        title: "News",
        href: "/news",
      },
      {
        title: "My Account",
        href: "/authentication/login",
      },
      {
        title: "Privacy Policy",
        href: "/privacy-policy",
      },
    ],
  },
];

export const Footer: FC = (props) => (
  <Box
    sx={{
      backgroundColor: "background.default",
      borderTopColor: "divider",
      borderTopStyle: "solid",
      borderTopWidth: 1,
      pb: 6,
      pt: {
        md: 15,
        xs: 6,
      },
    }}
    {...props}
  >
    <Container maxWidth="md">
      <Grid container spacing={3}>
        <Grid
          item
          md={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            // order: {
            //   md: 1,
            //   xs: 4,
            // },
          }}
          xs={6}
        >
          <ColourLogo />
          <Typography
            color="textSecondary"
            sx={{ mt: 2, fontWeight: 800 }}
            variant="caption"
          >
            Esox Biologics Ltd
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 0.5 }} variant="caption">
            I-Hub, 84 Wood Lane
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 0.5 }} variant="caption">
            London, W12 0BZ
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 0.5 }} variant="caption">
            07508 389 869
          </Typography>
          <Typography
            color="textSecondary"
            sx={{ mt: 1, fontWeight: 600 }}
            variant="caption"
          >
            inquiries@esoxbiologics.com
          </Typography>
          {/* <Typography color="textSecondary" sx={{ mt: 2 }} variant="caption">
            © 2023 Esox.
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            All rights reserved.
          </Typography> */}
        </Grid>
        {/* <Grid
          item
          md={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            // order: {
            //   md: 1,
            //   xs: 4,
            // },
          }}
          xs={6}
        ></Grid> */}
        {sections.map((section, index) => (
          <Grid
            item
            key={section.title}
            md={3}
            // sx={{
            //   order: {
            //     md: index + 2,
            //     xs: index + 1,
            //   },
            // }}
            xs={6}
          >
            <Typography color="textSecondary" variant="overline">
              {section.title}
            </Typography>
            <List disablePadding>
              {section.links.map((link) => (
                <ListItem
                  disableGutters
                  key={link.title}
                  sx={{
                    pb: 0,
                    pt: 1,
                  }}
                >
                  <ListItemAvatar
                    sx={{
                      alignItems: "center",
                      display: "flex",
                      minWidth: 0,
                      mr: 0.5,
                    }}
                  >
                    <MinusOutlinedIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <NextLink href={link.href} passHref legacyBehavior>
                        <Link color="textPrimary" variant="subtitle2">
                          {link.title}
                        </Link>
                      </NextLink>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        ))}
      </Grid>
      <Divider
        sx={{
          borderColor: (theme) =>
            alpha(theme.palette.primary.contrastText, 0.12),
          my: 4,
        }}
      />
    </Container>
  </Box>
);

{
  /* <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            84 I-Hub
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            84 Wood Lane
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            4th Floor
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            Office 44
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            London
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            England
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }} variant="caption">
            W12 0BZ
          </Typography> */
}
