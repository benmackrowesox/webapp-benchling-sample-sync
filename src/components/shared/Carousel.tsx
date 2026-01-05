import { Theme, Typography, useMediaQuery } from "@mui/material";
import Container from "@mui/system/Container";
import { Children, FC, ReactNode } from "react";
import ReactCarousel from "react-material-ui-carousel";
import Box from "@mui/system/Box";

// Note: know issue for the carousel when only two items, the animation is backwards
export const Carousel: FC<{
  title?: string;
  headline?: string;
  height: string;
  children: ReactNode;
}> = (props) => {
  const banners: Array<any> = [];

  const isMobile = useMediaQuery(
    (theme: Theme) => theme.breakpoints.down("sm"),
    {
      noSsr: true,
    },
  );

  const bannerSize = isMobile ? 1 : 2;

  Children.forEach(props.children, (child, index) => {
    const bIndex = Math.trunc(index / bannerSize);
    if (!banners[bIndex]) {
      banners[bIndex] = [];
    }
    banners[bIndex].push(child);
  });
  return (
    <Container maxWidth="lg">
      {/* <Typography
              sx={{ fontSize: "1.5em", textAlign: "center", fontWeight: 600, my: 2 }}
            >
              {props.title}
            </Typography> */}
      <Typography
        sx={(theme) => ({
          color: theme.palette.primary.main,
          fontWeight: 500,
          fontSize: "1.5em",
          pb: 1,
          mt: 3,
          textAlign: "center",
        })}
      >
        {props.title}
      </Typography>

      <Typography
        variant="h3"
        maxWidth={{ sm: "100%", md: "80%" }}
        textAlign="center"
        marginLeft="auto"
        marginRight="auto"
        sx={{ mb: 3 }}
      >
        {props.headline}
      </Typography>

      <ReactCarousel
        animation="slide"
        duration={1000}
        navButtonsAlwaysVisible={true}
        autoPlay={false}
        cycleNavigation={false}
        navButtonsProps={{
          style: {
            borderRadius: "50%",
            background: "white",
            color: "black",
            border: "2px solid black",
          },
        }}
      >
        {banners.map((b, index) => (
          <CarouselBanner key={index} height={props.height}>
            {b}
          </CarouselBanner>
        ))}
      </ReactCarousel>
    </Container>
  );
};

interface CarouselCardProps {
  icon: string;
  title?: string;
  invertColour?: boolean;
  children: ReactNode;
}

export const CarouselCard: FC<CarouselCardProps> = (props) => {
  return (
    <Box
      width={"260px"}
      sx={(theme) => ({
        background: theme.palette.primary.main,
        borderRadius: "20px",
      })}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 5,
          alignItems: "center",
          color: "white",
          fontSize: "1em",
        }}
      >
        <Box
          sx={(theme) => ({
            borderRadius: "5px",
            border: props.invertColour ? "5px solid white" : "none",
            background: props.invertColour ? "transparent" : "white",
            width: { xs: "180px", sm: "180px" },
            height: { xs: "180px", sm: "180px" },
            backgroundSize: "100%",
            backgroundImage: `url('${props.icon}')`,
            mb: 1,
          })}
        />
        {props.title && (
          <Typography
            sx={{
              fontWeight: 600,
              width: "100%",
              textAlign: "center",
              fontSize: "1.25em",
              mb: "10px",
            }}
          >
            {props.title}
          </Typography>
        )}
        {props.children}
      </Box>
    </Box>
  );
};

const CarouselBanner: FC<{
  height: string;
  children: ReactNode;
}> = (props) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: props.height,
        justifyContent: "space-evenly",
        display: "flex",
        flexDirection: "row",
        gap: 2,
      }}
    >
      {props.children}
    </Box>
  );
};
