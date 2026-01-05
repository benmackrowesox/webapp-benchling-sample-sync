import { FC } from "react";
import { Box, Card, CardContent, Grid } from "@mui/material";
import { ChangePassword } from "./change-password";

export const ChangePasswordSettings: FC = (props) => {
  return (
    <Box sx={{ mt: 4 }} {...props}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md xs={12}>
              <ChangePassword />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
