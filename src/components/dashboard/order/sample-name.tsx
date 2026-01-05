import { Typography } from "@mui/material";
import React from "react";
import { serviceFromId } from "src/utils/service-from-sample-id";

export const SERVICE_COLOURS: Record<string, string> = {
  ["Metagenomics"]: "#22aaaaff",
  ["qPCR"]: "#aa0022ff",
  ["GenomeSequencing"]: "#dddd00ff",
  ["Unknown"]: "transparent",
};

export const SampleName = (props: { name: string }) => {
  const service = serviceFromId(props.name);
  const colour = SERVICE_COLOURS[service];

  return (
    <Typography
      variant="body2"
      sx={{
        borderLeft: `6px solid ${colour}`,
        borderRadius: "1px",
        pl: "3px",
      }}
      key={props.name}
    >
      {props.name}
    </Typography>
  );
};
