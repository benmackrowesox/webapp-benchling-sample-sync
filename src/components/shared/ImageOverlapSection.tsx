import Box from "@mui/system/Box";
import { Section } from "./Section";
import { ReactNode } from "react";

interface ImageOverlapProps {
  title: string;
  headline: string;
  body: ReactNode;
  image: string;
  // maybe x/y px?
}

export const ImageOverlapSection = (props: ImageOverlapProps) => {
  const { title, headline, body, image } = props;
  return (
    <Box sx={{ position: "relative" }}>
      <img src={image} width="100%" />
      <Box
        sx={(theme) => ({
          position: "relative",
          mt: "-170px",
          [theme.breakpoints.up("sm")]: {
            position: "absolute",
            top: "50%",
            left: "45%",
          },
        })}
      >
        <Section title={title} headline={headline}>
          {body}
        </Section>
      </Box>
    </Box>
  );
};
