import type { FC } from "react";
import {
  Box,
  Button,
  Divider,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useTypedAuth } from "src/hooks/use-auth";
import { toast } from "react-hot-toast";
import { useMounted } from "src/hooks/use-mounted";

import { PageHelpSection } from "src/components/dashboard/page-help-section";

export const ChangePassword: FC = () => {
  const { updateUserPassword } = useTypedAuth();
  const isMounted = useMounted();
  const formik = useFormik({
    initialValues: {
      existingPassword: "",
      password: "",
      passwordConfirmation: "",
      submit: null,
    },
    validationSchema: Yup.object({
      password: Yup.string().min(7).max(255).required("Password is required"),
      existingPassword: Yup.string()
        .min(7)
        .max(255)
        .required("Existing Password is required"),
      passwordConfirmation: Yup.string().oneOf(
        [Yup.ref("password"), null],
        "Passwords must match",
      ),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      helpers.setSubmitting(true);
      try {
        await updateUserPassword(values.existingPassword, values.password).then(
          () => toast.success("Updated password"),
        );
        helpers.setSubmitting(false);
      } catch (err) {
        console.log(err);
        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });
  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        minHeight: "100%",
        p: 3,
      }}
    >
      <form noValidate onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Change Password</Typography>
            <PageHelpSection>
              <span>
                For a strong password use a mixture of letters, numbers and
                symbols.
              </span>
            </PageHelpSection>
          </Grid>

          <Grid item sm={12}>
            <TextField
              error={Boolean(
                formik.touched.existingPassword &&
                  formik.errors.existingPassword,
              )}
              sx={{ width: "48%", minWidth: "280px" }}
              helperText={
                formik.touched.existingPassword &&
                formik.errors.existingPassword
              }
              label="Confirm Existing Password"
              margin="normal"
              name="existingPassword"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.existingPassword}
            />
          </Grid>

          <Grid item sm={6} xs={12}>
            <TextField
              error={Boolean(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="New Password"
              margin="normal"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              error={Boolean(
                formik.touched.passwordConfirmation &&
                  formik.errors.passwordConfirmation,
              )}
              fullWidth
              helperText={
                formik.touched.passwordConfirmation &&
                formik.errors.passwordConfirmation
              }
              label="Confirm New Password"
              margin="normal"
              name="passwordConfirmation"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.passwordConfirmation}
            />
          </Grid>

          {formik.errors.submit && (
            <Box sx={{ mt: 3 }}>
              <FormHelperText error>{formik.errors.submit}</FormHelperText>
            </Box>
          )}
        </Grid>
        <Divider sx={{ pt: 2 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            py: 2,
          }}
        >
          <Button color="primary" type="submit" variant="contained">
            Change Password
          </Button>
        </Box>
      </form>
    </Box>
  );
};
