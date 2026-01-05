import { Typography } from "@mui/material";
import Box from "@mui/system/Box";
import Container from "@mui/system/Container";
import { FC, ReactNode } from "react";

interface SectionProps {
  title: ReactNode;
  headline: ReactNode;
  children: ReactNode;
}

export const Section: FC<SectionProps> = (props) => {
  const { title, headline, children } = props;
  return (
    <Container maxWidth="lg">
      <Typography
        sx={(theme) => ({
          color: theme.palette.primary.main,
          fontWeight: 500,
          fontSize: "1.5em",
          pb: 1,
        })}
      >
        {title}
      </Typography>
      <Box sx={{ pb: 1, maxWidth: { md: "60%" } }}>
        <Typography variant="h3">{headline}</Typography>
      </Box>
      {children}
    </Container>
  );
};

export const CenterTextSection: FC<SectionProps> = (props) => {
  const { title, headline, children } = props;
  return (
    <Container maxWidth="lg" sx={{ textAlign: "center" }}>
      <Typography
        sx={(theme) => ({
          color: theme.palette.primary.main,
          fontWeight: 500,
          fontSize: "1.5em",
          pb: 1,
        })}
      >
        {title}
      </Typography>

      <Box>
        <Typography
          variant="h3"
          maxWidth={{ sm: "100%", md: "80%" }}
          textAlign="center"
          marginLeft="auto"
          marginRight="auto"
        >
          {headline}
        </Typography>
      </Box>
      <Box sx={{ mt: 3 }}>{children}</Box>
    </Container>
  );
};
