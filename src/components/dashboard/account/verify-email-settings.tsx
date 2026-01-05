import { FC } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useTypedAuth } from "src/hooks/use-auth";
import toast from "react-hot-toast";

export const VerifyEmailSettings: FC = (props) => {
  const { user, sendVerificationEmail } = useTypedAuth();

  if (user?.emailVerified) {
    return (
      <Box sx={{ mt: 4 }} {...props}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md xs={12}>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    minHeight: "100%",
                    p: 3,
                  }}
                >
                  <Typography>
                    Thank you, you have already verified your password
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  } else {
    return (
      <Box sx={{ mt: 4 }} {...props}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md xs={12}>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    minHeight: "100%",
                    alignContent: "center",
                    justifyItems: "center",
                    p: 3,
                  }}
                >
                  <Typography>
                    Your email has not been verified. If you believe it has, try
                    refreshing the page.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      sendVerificationEmail().then(() => {
                        toast.success("Email sent");
                      });
                    }}
                  >
                    Send verification email
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }
};
