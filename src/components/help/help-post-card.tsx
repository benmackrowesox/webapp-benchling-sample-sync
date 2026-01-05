import { FC, useEffect, useState } from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import Markdown from "react-markdown";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { getImage } from "src/lib/client/firebase";

interface HelpPostCardProps {
  id: string;
  category: string;
  cover: string;
  shortDescription: string;
  title: string;
}

export const HelpPostCard: FC<HelpPostCardProps> = (props) => {
  const { id, category, cover, shortDescription, title, ...other } = props;

  console.log({ props });

  const [image, setImage] = useState<string>();

  useEffect(() => {
    const setup = async () => {
      const image = await getImage(cover);
      setImage(image);
    };
    setup();
  }, [cover]);

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          "& + &": {
            mt: 6,
          },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        {...other}
      >
        <div>
          <NextLink
            href={
              window.location.pathname == "/dashboard/edit-help"
                ? `/dashboard/edit-help/${id}`
                : `/help/${id}`
            }
            passHref
            legacyBehavior>
            <Box
              sx={{
                position: "relative",
                pt: {
                  xs: "calc(60% * 4 / 4)",
                  md: "calc(60% * 4 / 4)",
                },
              }}
            >
              <CardMedia
                component="a"
                image={image}
                sx={{
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  width: "100%",
                }}
              />
            </Box>
          </NextLink>
          <CardContent>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Chip label={category} />
            </Box>
            <NextLink
              href={
                window.location.pathname == "/dashboard/edit-help"
                  ? `/dashboard/edit-help/${id}`
                  : `/help/${id}`
              }
              passHref
              legacyBehavior>
              <Link color="textPrimary" component="a" variant="h5">
                {title && <Markdown children={title} />}
              </Link>
            </NextLink>
            <Typography
              color="textSecondary"
              sx={{
                // height: 48,
                mt: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                "& p": {
                  padding: 0,
                  margin: 0,
                },
              }}
              variant="body1"
            >
              {shortDescription && <Markdown children={shortDescription} />}
            </Typography>
          </CardContent>
        </div>
      </Card>
    </Grid>
  );
};

HelpPostCard.propTypes = {
  category: PropTypes.string.isRequired,
  cover: PropTypes.string.isRequired,
  shortDescription: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
