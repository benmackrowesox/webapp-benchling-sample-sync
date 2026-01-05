import { Grid } from "@mui/material";
import Box from "@mui/system/Box";
import Container from "@mui/system/Container";
import { FC, ReactNode } from "react";
import ReactCarousel from "react-material-ui-carousel";

export const Testimonials: FC<{ children: ReactNode }> = (props) => {
  return (
    <Container maxWidth="lg" sx={{ my: 5 }}>
      {/* <Typography
              sx={(theme) => ({
                color: theme.palette.primary.main,
                fontWeight: 500,
                fontSize: "1.5em",
                pb: 2,
              })}
            >
              Testimonials{" "}
            </Typography> */}
      <ReactCarousel
        animation="fade"
        navButtonsAlwaysInvisible={true}
        autoPlay={true}
      >
        {props.children}
      </ReactCarousel>
    </Container>
  );
};
interface TestimonialProps {
  from: string;
  img?: string;
  children: ReactNode;
}

export const Testimonial: FC<TestimonialProps> = (props) => {
  return (
    <Grid container justifyContent={"center"} spacing={2}>
      <Grid item xs={12} sm={10}>
        <em>{props.from}</em>
        <br />
        <br />“{props.children}”
      </Grid>
      <Grid item xs={2}>
        <Box
          sx={(theme) => ({
            border: "5px solid gold",
            background: theme.palette.primary.dark,
            backgroundImage: props.img ? `url("${props.img}")` : "none",
            backgroundSize: "105%",
            backgroundPosition: "center",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
          })}
        />
      </Grid>
    </Grid>
  );
};
