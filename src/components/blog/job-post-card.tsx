import { FC, useEffect, useState } from "react";
import { Box, Card, Grid, IconButton, Typography } from "@mui/material";
import { getImage } from "src/lib/client/firebase";
import {
  opportunitiesStore,
  Opportunity,
} from "src/lib/client/store/opportunities";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Delete from "@mui/icons-material/Delete";
import router from "next/router";

export const JobPostCard: FC<Opportunity> = (props) => {
  const { id, name, location, linkedin, pdfFile } = props;

  console.log({ props });

  const [image, setImage] = useState<string>();

  useEffect(() => {
    const setup = async () => {
      const image = await getImage(pdfFile);
      setImage(image);
    };
    setup();
  }, [pdfFile]);

  const onDownload = () => {
    const link = document.createElement("a");
    link.download = `job-description.pdf`;
    link.target = "_black";
    link.href = pdfFile;
    link.click();
  };

  return (
    <Grid item xs={12}>
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body1">{name}</Typography>
            <Typography variant="overline" color="textSecondary">
              {location}
            </Typography>
          </Box>
          <Box sx={{ minWidth: "110px" }}>
            <IconButton size="large" color="primary" onClick={onDownload}>
              <PictureAsPdfIcon fontSize="large" />
            </IconButton>
            <IconButton
              size="large"
              color="primary"
              href={linkedin}
              target="blank"
            >
              <LinkedInIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

export const DeleteableJobPostCard: FC<Opportunity> = (props) => {
  const { id, name, location, linkedin, pdfFile } = props;

  console.log({ props });

  const [image, setImage] = useState<string>();

  useEffect(() => {
    const setup = async () => {
      const image = await getImage(pdfFile);
      setImage(image);
    };
    setup();
  }, [pdfFile]);

  const onDownload = () => {
    const link = document.createElement("a");
    link.download = `job-description.pdf`;
    link.target = "_black";
    link.href = pdfFile;
    link.click();
  };

  return (
    <Grid item xs={12}>
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body1">{name}</Typography>
            <Typography variant="overline" color="textSecondary">
              {location}
            </Typography>
          </Box>
          <Box sx={{ minWidth: "165px" }}>
            <IconButton size="large" color="primary" onClick={onDownload}>
              <PictureAsPdfIcon fontSize="large" />
            </IconButton>
            <IconButton
              size="large"
              color="primary"
              href={linkedin}
              target="blank"
            >
              <LinkedInIcon fontSize="large" />
            </IconButton>
            <IconButton
              size="large"
              color="error"
              onClick={async () => {
                await opportunitiesStore.deletePost(props);
                await router.push(`/dashboard/edit-jobs`);
              }}
            >
              <Delete fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};
