import Box from "@mui/system/Box";
import { FC, ReactNode } from "react";

interface StaggeredListItemProps {
  img: string;
  caption: string;
}

export const StaggeredBlocks: FC<{ children: ReactNode }> = (props) => {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        pl: "40px",
        maxWidth: { xs: "300px", sm: "600px" },
        marginX: "auto",
        flexWrap: "wrap",

        "& :nth-of-type(even)": {
          transform: { xs: "none", sm: "translateY(120px)" },
        },
        columnGap: "50px",
        rowGap: "40px",
      })}
    >
      {props.children}
    </Box>
  );
};
export const StaggeredListItem = (props: StaggeredListItemProps) => {
  const { img, caption } = props;
  return (
    <Box sx={{ width: "200px", textAlign: "center" }}>
      <img src={img} width="100%" />
      {caption}
    </Box>
  );
};
