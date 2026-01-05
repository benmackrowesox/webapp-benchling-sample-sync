import { Grid, Theme, Typography, useMediaQuery } from "@mui/material";
import Box from "@mui/system/Box";
import Container from "@mui/system/Container";
import { ReactNode } from "react";

interface TextAndImageSectionProps {
  title: string;
  headline: ReactNode;
  body: ReactNode;
  image: string;
  imageFirst?: boolean;
  columnSplit: "title" | "headline" | "body";
  imageSize?: "small" | "large";
}

export const TextAndImageSection = (props: TextAndImageSectionProps) => {
  const { title, headline, body, imageSize, columnSplit, imageFirst, image } =
    props;
  const titleElement = (
    <Typography
      sx={(theme) => ({
        color: theme.palette.primary.main,
        fontWeight: 500,
        fontSize: "1.5em",
        pb: 1,
        // textAlign: imageFirst ? "left" : "none",
      })}
    >
      <>{title}</>
    </Typography>
  );
  const headlineElement = <Typography variant="h3">{headline}</Typography>;
  const imageElement = (
    <img src={image} width={"100%"} style={{ borderRadius: 10 }} />
  );
  const bodyElement = <Box mt={"15px"}>{body}</Box>;

  const isMobile = useMediaQuery(
    (theme: Theme) => theme.breakpoints.down("sm"),
    {
      noSsr: true,
    }
  );

  const topSection = (
    <>
      {columnSplit != "title" && titleElement}
      {columnSplit == "body" && headlineElement}
    </>
  );

  const bottomSection = (
    <>
      {columnSplit == "title" && titleElement}
      {columnSplit != "body" && headlineElement}
      {bodyElement}
    </>
  );

  return (
    <Container maxWidth="lg">
      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {titleElement}
          {headlineElement}
          {!imageFirst && bodyElement}
          <Box
            sx={{
              mt: 1,
              maxWidth: imageSize == "small" ? "50%" : "100%",
              marginX: "auto",
            }}
          >
            {imageElement}
          </Box>
          {imageFirst && bodyElement}
        </Box>
      ) : (
        <>
          {topSection}
          <Grid
            container
            spacing={2}
            direction={imageFirst ? "row-reverse" : "row"}
          >
            <Grid item sm={imageSize == "small" ? 9 : 7}>
              {bottomSection}
            </Grid>
            <Grid item sm={imageSize == "small" ? 3 : 5}>
              {imageElement}
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};
