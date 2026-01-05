import type { FC, ReactNode } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactElement } from "react-markdown/lib/react-markdown";

interface HeroStandardContentsProps {
  title: string | ReactElement;
  subtitle?: string | ReactElement;
  heroAction?: ReactElement;
}

export const HeroStandardContents = (props: HeroStandardContentsProps) => {
  const { title, subtitle, heroAction } = props;
  return (
    // funny values to fit requirement of fitting on 2 lines when large.
    <Box sx={{ mr: { xs: "0", sm: "0%", lg: "-3%" } }}>
      <Typography
        align="left"
        variant="h2"
        sx={{ color: "white", fontWeight: 500 }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography
          sx={{ color: "white", alignSelf: "flex-start", fontSize: "1.25em" }}
        >
          {subtitle}
        </Typography>
        <Box sx={{ pl: "20%", mt: 4 }}>{heroAction}</Box>
      </Box>
    </Box>
  );
};

export const Hero: FC<{ image: string; children: ReactNode }> = (props) => {
  const theme = useTheme();
  const { image, ...others } = props;
  const x = "/home/home-hero.png";

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
      }}
      {...others}
    >
      <Box
        sx={{
          height: { sm: "500px", xs: "82vh" },
          width: "100%",
          position: "relative",
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <Container
          sx={{
            display: "flex",
            alignItems: { sm: "flex-start", xs: "center" },
            height: "100%",
            pt: { sm: "150px", xs: "60px" },
          }}
        >
          {props.children}
        </Container>
      </Box>
    </Box>
  );
};
