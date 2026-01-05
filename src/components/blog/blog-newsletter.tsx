import { FC, useState } from "react";
import { Box, Button, Card, Grid, Modal, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const BlogNewsletter: FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card
        elevation={16}
        sx={{
          backgroundColor: "background.default",
          py: 10,
          px: 8,
        }}
      >
        <Grid
          alignItems="center"
          container
          justifyContent="space-between"
          spacing={3}
          wrap="nowrap"
        >
          <Grid item md={8} xs={12}>
            <Box
              sx={{
                alignItems: "flex-start",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h4">Join the mailing list</Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{
                  mb: 3,
                  mt: 1,
                }}
              >
                Subscribe to our newsletter to make sure you don&apos;t miss
                anything.
              </Typography>
              <Button
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                variant="contained"
                onClick={handleOpen}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
          <Grid
            item
            md={4}
            sx={{
              display: {
                md: "block",
                xs: "none",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                pt: "calc(421 / 472 * 100%)",
                "& img": {
                  height: "auto",
                  position: "absolute",
                  top: 0,
                  width: "100%",
                },
              }}
            >
              <img alt="" src={`/static/mailingList.png`} />
            </Box>
          </Grid>
        </Grid>
      </Card>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
          }}
        >
          <iframe
            width="100%"
            height="100%"
            src="https://b077c2ab.sibforms.com/serve/MUIEALnLz9OuK-yiJ5NQWlw7xjYwaxmclemYRWIzoD81dMR0_etmCOlTb8WnsFtbs7DwYsSyAMO78PFb1tRTfGlxyEEE3Ipmd8Bf3kK7k7LzWj10qRPV-OPv0QxqddLZRhIRYxzDTLC8z3cpwJmpCDqN26q0hBy373aECyYhwjgF2975u4vkYu-cnZHPND8AgTFhhWNPt8TVdhzu"
            frameBorder={0}
            scrolling="auto"
            allowFullScreen={true}
            style={{
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              maxWidth: "100%",
            }}
          />
        </Box>
      </Modal>
    </>
  );
};
